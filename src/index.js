import { PassThrough, Transform } from 'stream'
import Debug from '@idio/debug'
import { format } from '../benchmark/bytes'
import { c as C, b as B } from 'erte'

const debug = Debug('nicer')

const trunc = (s, l = 97) => {
  let h = s.slice(0, l)
  if (s.length >= l+3) h += '...'
  else if (s.length == l+2) h += '..'
  else if (s.length == l+1) h += '.'
  return h
}

/**
 * @param {Buffer} s
 * @param {number} i The length of the boundary (\r\n\r\n)
 */
const splitHeader = (s, i) => {
  const header = s.slice(0, i)
  const data = s.slice(i + 4)
  return { header, data }
}

/**
 * @param {!Buffer} a
 * @param {!Buffer} b
 */
const concatBuffer = (a, b, comment='', z=0) => {
  if (!a.length) return b
  if (!b.length) return a
  const x = ' '.repeat(z)
  if (comment) comment = `-${comment}`
  debug('%s<concat%s>', x, comment)
  const res = Buffer.concat([a, b])
  debug('%s<concat%s> %f', x, comment, res.length)
  return res
}

/**
 * @implements {_nicer.Nicer}
 */
export default class Nicer extends Transform {
  constructor(cfg) {
    const { readableHighWaterMark, writableHighWaterMark, boundary } = cfg || {}
    if (!boundary) throw new Error("please pass the boundary")
    super(/** @type {!stream.TransformOptions} */({
      // readableHighWaterMark,
      writableHighWaterMark,
      readableObjectMode: true,
    }))
    /** @type {!Buffer} */
    this.buffer = Buffer.from('')
    this.needle = boundary
    this.BOUNDARY = `--${this.needle}`

    this.state = 'start'
    /** @type {!Buffer} */
    this.header = Buffer.from('')
    this.bodyWritten = 0

    this.bodyStream = null
  }
  /**
   * Stores the header data in internal buffer until it can find `\r\n\r\n` after which we know that
   * the body started to be written. The body will finish with the boundary.
   */
  writeHeader(data) {
    if (!data.length) return
    this.header = concatBuffer(this.header, data, 'header', 6)
    let i = this.header.indexOf('\r\n\r\n')
    if (i != -1) {
      const { header, data: newData } = splitHeader(this.header, i)
      this.state = 'reading_body'
      const dl = format(newData.length)
      debug(`    🗒  Found header at %s, data available <%s>
       %s`, C(`${i}`, 'yellow'), dl, '_'.repeat(35 + `${i}`.length + dl.length))

      debugHeader(header)

      // if we know this part has finished, we can just flush it wil body as a string...
      this.bodyStream = new PassThrough()
      // this.bodyStream = new Readable({
      //   read() {

      //   },
      // })
      // this.bodyWritten = 0
      this.resetHeader()
      this.push({ header, stream: this.bodyStream })
      this.writeBody(newData)
    }
  }
  resetHeader() {
    this.header = Buffer.from('')
  }
  writeBody(data) {
    this.bodyWritten += data.length
    this.bodyStream.write(data)
    debug('    📝  Wrote %f to body', data.length)
  }
  _transform(chunk, enc, next) {
    // console.log('RECEIVED %s', chunk.length)
    // this is the buffer with padding, so that a part of the boundary does not
    // end up in the body
    /*
     The data that is coming can end half-way through the separator
     so there is always a length left from the incoming buffers, which
     equals to the length of the separator - 1
     This will be handled in the _final call node 8
    */
    try {
      this.buffer = concatBuffer(this.buffer, chunk, 'transform')
      this.buffer = this.consumeAndUpdate()
    } catch (err) {
      next(err)
      return
    }

    next(null)
  }
  /**
   * Consumes all bytes in the safe buffer and updates the internal buffer to exclude the safe one leaving only the necessary padding.
   */
  consumeAndUpdate() {
    const { buffer } = this
    const rest = this.consumeSafe(buffer)
    const howmuchconsumed = buffer.length - rest.length
    const left = howmuchconsumed ? this.buffer.slice(howmuchconsumed) : this.buffer
    debug('one consume safe consumed %f and left %f', howmuchconsumed, left.length)
    return left
  }
  get boundary() {
    const boundary = this.state == 'start' ? this.BOUNDARY : `\r\n${this.BOUNDARY}`
    return boundary
  }
  /**
   * @param {Buffer} [data]
   */
  finishCurrentStream(data) {
    if (!this.bodyStream) return

    if (data && data.length) this.writeBody(data)
    debug('    🔒  Closing current data stream, total written: %f', this.bodyWritten)
    this.bodyStream.push(null)
    this.bodyStream = null
    this.bodyWritten = 0
  }
  /**
   * Must make sure to keep some padding so it doesn't end up in the body.
   * Can disregard the preamble buffer.
   * @param {Buffer} buffer
   */
  consumeSafe(buffer) {
    // if (!buffer.length) return buffer
    let i, b
    let foundSeparator = 0
    // this will only consume buffer until the after the boundary
    debug('🔍  Staring boundary %s scan', C(trunc(this.boundary.trim(), 15), 'red'))
    const toConsume = []

    while((i = buffer.indexOf(b = this.boundary)) != -1) {
      foundSeparator++
      const offset = i + b.length

      const data = buffer.slice(0, i)
      buffer = buffer.slice(offset)

      // when in here, guaranteed to have a body finished
      if (this.state == 'start') {
        debug('  ⭐  Found starting boundary at index %s', C(`${i}`, 'yellow'))
        this.state = 'reading_header'
        continue
      }
      debug('  🔛  Found boundary, data size %fm', data.length)
      // what if state is reading body
      if (this.state == 'reading_body') {
        this.finishCurrentStream(data)
        this.state = 'finished_body'
      } else if (this.state == 'reading_header' && this.header.length) {
        // headerToConsume = data
        const header = Buffer.concat([this.header, data])
        debug(`  🗒  Found header and data of size <%fy>`, header.length)
        debugHeader(header, 3)
        toConsume.push(header)
        this.resetHeader()
        this.state = 'finished_body'
        // found end
      } else
        toConsume.push(data)

      /**
       *  Content-Disposition: form-data; name="alan"

          watts
          --u2KxIV5yF1y+xUspOQCCZopaVgeV6Jxihv35XQJmuTx8X3sh--
          "
       */
    }
    toConsume.forEach((d) => {
      const j = d.indexOf('\r\n\r\n')
      if (j == -1) throw new Error('Did not find the end of header before boundary.')
      const { header, data } = splitHeader(d, j)
      const stream = new PassThrough()
      stream.end(data)
      this.push({ header, stream })
      this.state = 'finished_body'
    })
    // debugger

    // buffer will only be consumed by parts ie until the end of the separator
    // OR WHEN IT'S a 100% data or header stream
    // what's left is not handled

    // OR HANDLE IT HERE
    // -- END
    // -- PUSH TO THE BODY or HEADER
    debug('🔎  Finished boundary scan, buffer of length %f left, separators found: %s',
      buffer.length, foundSeparator)

    if (this.state == 'finished_body' && checkIsEnd(buffer)) {
      debug('〰️  Special case, found %s after the boundary', C('--', 'red'))
      this.state = 'data-ended'
      return buffer
    } else if (this.state == 'finished_body') {
      this.state = 'reading_header'
    }

    // we might have a header
    const canSafelyWrite = this.safeBuffer(buffer)
    const rest = buffer.slice(canSafelyWrite.length)
    if (this.state == 'reading_body') {
      this.writeBody(canSafelyWrite)
      return rest
    } else if (this.state == 'reading_header') {
      this.writeHeader(canSafelyWrite)
      return rest
    } else if (this.state == 'start') {
      return rest
    }
    return buffer
  }
  /**
   * Safe buffer is how much we can write confident that what we've written does not contain boundary.
   * @param {Buffer} buffer
   */
  safeBuffer(buffer) {
    const safeBuffer = buffer.slice(0, Math.max(0, buffer.length - this.boundary.length))
    return safeBuffer
  }
  /**
   * Final is called with what's left in the buffer at the end. If it doesn't finish property with --boundary--, emit an error.
   */
  _final(cb) {
    if (this.state == 'data-ended') {
      this.finishCurrentStream()
      return cb()
    }

    this.buffer = this.consumeAndUpdate()
    this.finishCurrentStream()

    const isEnd = checkIsEnd(this.buffer)
    if (!isEnd) {
      let b = this.buffer.slice(0, 2).toString()
      const e = new Error(`Unexpected end of request body, wanted to see "--" but saw ${b}.`)
      cb(e)
      this.push(e)
    } else {
      cb()
      this.push(null)
    }
  }
}

const checkIsEnd = (buffer) => {
  const endsWithDashes = buffer[0] == 45 && buffer[1] == 45
  return endsWithDashes
}

const debugHeader = (header, i = 5) => {
  if (!/nicer/.test(`${process.env.DEBUG}`)) return
  const h = trunc(header)
  h.toString().split(/\r?\n/).filter(Boolean).forEach(l => {
    debug('%s%s', ' '.repeat(i +2), C(B(`${l}`, 'blue'), 'cyan'))
  })
}