import { PassThrough, Transform } from 'stream'
import Debug from '@idio/debug'
import { format } from '../benchmark/bytes'
import { c as C, b as B } from 'erte'

const debug = new Debug('nicer')

const trunc = (s, l = 97) => {
  let h = s.substr(0, l)
  if (s.length >= l+3) h += '...'
  else if (s.length == l+2) h += '..'
  else if (s.length == l+1) h += '.'
  return h
}

/**
 * @param {string|!Buffer} a
 * @param {string|!Buffer} b
 */
const concat = (a, b, comment='', z =0) => {
  if (comment) comment = `-${comment}`
  const a_s = a.toString()
  const x = ' '.repeat(z)
  debug('%s<concat%s> a.toString %s', x, comment, format(a_s.length))
  const bs = b.toString()
  debug('%s<concat%s> b.toString %s', x, comment, format(bs.length))
  const r = a_s + bs
  debug('%s<concat%s> a+b %s', x, comment, format(r.length))
  return r
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
    /** @type {string} */
    this.buffer = ''
    this.needle = boundary
    this.BOUNDARY = `--${this.needle}`

    // this.BOUNDARY_LENGTH = this.boundary.length

    this.state = 'start'
    /** @type {string} */
    this.header = ''
    this.bodyWritten = 0

    this.bodyStream = null
  }

  // * @param {boolean} isNewPart
  // * @param {string} cb
  /**
   * Content-Disposition: form-data; name="alan"

     watt
   * @param {string} data
   */
  parsePart(data) {
    if (this.state == 'reading_header') {
      this.writeHeader(data)
    } else {
      this.writeBody(data)
    }
  }
  /**
   * Stores the header data in internal buffer until it can find `\r\n\r\n` after which we know that
   * the body started to be written. The body will finish with the boundary.
   */
  writeHeader(data) {
    if (!data.length) return
    this.header = concat(this.header, data, 'header', 6)
    let i = this.header.indexOf('\r\n\r\n')
    if (i != -1) {
      const header = this.header.substr(0, i)
      const newData = this.header.substr(i + 4)
      this.state = 'reading_body'
      const dl = format(newData.length)
      debug(`    🗒  Found header at %s, data available <%s>
       %s`, C(i, 'yellow'), dl, '_'.repeat(35 + `${i}`.length + dl.length))

      const h = trunc(header)
      h.split(/\r?\n/).filter(Boolean).forEach(l => {
        debug('       %s', C(B(l, 'blue')))
      })

      // if we know this part has finished, we can just flush it wil body as a string...
      this.bodyStream = new PassThrough()
      this.bodyWritten = 0
      this.header = ''
      this.push({ header, stream: this.bodyStream })
      this.writeBody(newData)
    }
  }
  nextCheckpoint(data) {
    if (this.state == 'reading_body') {
      // console.log('Switched to reading the header from reading body %s bytes read', this.bodyWritten)
      this.finishCurrentStream(data)
      this.state = 'finished_body'
      // return true
    }
    // return null
    // else if (this.state == 'reading_header')
  }
  writeBody(data) {
    this.bodyWritten += data.length
    this.bodyStream.write(data)
    debug('    📝  Wrote %s to body', format(data.length))
  }
  _transform(chunk, enc, next) {
    this.buffer = concat(this.buffer, chunk, 'transform')

    // this is the buffer with padding, so that a part of the boundary does not
    // end up in the body
    // let safeBuffer
    // const { boundary } = this
    // if (this.buffer.length < boundary.length) {
    // safeBuffer = this.buffer
    // }
    //  else if (this.state == 'start') {
    // safeBuffer = this.buffer.slice(0, this.buffer.length) // allow for /r/n
    // }
    // else {
    // safeBuffer = this.buffer.slice(0, this.buffer.length)
    // }
    // else
    // safeBuffer = this.buffer.slice(0, this.buffer.length + (boundary.length) + 2)
    // let safeBuffer = (
    // this.state == 'start' ||
    // ) ? this.buffer :
    // this.buffer.slice(0, this.buffer.length - (this.boundary.length + 2))

    /*
     The data that is coming can end half-way through the separator
     so there is always a length left from the incoming buffers, which
     equals to the length of the separator - 1
     This will be handled in the _final call node 8
    */
    try {
      this.buffer = this.consumeAndUpdate()
    } catch (err) {
      next(err)
      return
    }

    // this.buffer = rest

    next(null)
  }
  // get safeBuffer() {
  //   let safeBuffer
  //   // if (this.state == 'start') safeBuffer = this.buffer
  //   // the safe buffer length
  //   if (this.buffer.length < this.boundary.length) safeBuffer = this.buffer
  //   else safeBuffer = this.buffer.slice(0, this.buffer.length - this.boundary.length)
  //   return safeBuffer
  //   //  = (this.state == 'start' || ) ? this.buffer :
  //   // this.buffer.slice(0, this.buffer.length - (this.boundary.length + 2))
  // }
  /**
   * Consumes all bytes in the safe buffer and updates the internal buffer to exclude the safe one leaving only the necessary padding.
   */
  consumeAndUpdate() {
    const { buffer } = this
    const rest = this.consumeSafe(buffer)
    const howmuchconsumed = buffer.length - rest.length
    const left = howmuchconsumed ? this.buffer.slice(howmuchconsumed) : this.buffer
    debug('one consume safe consumed %s and left %s', format(howmuchconsumed), format(left.length))
    return left
    // this.consumeSafe(safeBuffer) // assume all consumed
    // this.buffer = this.buffer.slice(safeBuffer.length - 1)
  }
  get boundary() {
    const boundary = this.state == 'start' ? this.BOUNDARY : `\r\n${this.BOUNDARY}`
    return boundary
  }
  finishCurrentStream(data) {
    if (!this.bodyStream) return

    if (data && data.length) this.writeBody(data)
    debug('    🔒  Closing current data stream, total written: %s', format(this.bodyWritten))
    this.bodyStream.push(null)
    this.bodyStream = null
    this.bodyWritten = 0
  }
  // should consume all safe bytes
  /**
   * Must make sure to keep some padding so it doesn't end up in the body.
   * Can disregard the preamble buffer.
   */
  consumeSafe(buffer) {
    // if (!buffer.length) return buffer
    let i, b
    // B = buffer
    // let newBuffer = buffer
    // either end of header or end of body
    // let consumedLength = 0
    let foundSeparator = 0
    // this will only consume buffer until the after the boundary
    debug('🔍  Staring boundary %s scan', C(trunc(this.boundary.trim(), 15), 'red'))
    const toConsume = []
    // let headerToConsume = null

    while((i = buffer.indexOf(b = this.boundary)) != -1) {
      foundSeparator++
      const offset = i + b.length

      const data = buffer.substr(0, i)
      buffer = buffer.substr(offset)

      // when in here, guaranteed to have a body finished
      if (this.state == 'start') {
        debug('  ⭐  Found starting boundary at index %s', C(i, 'yellow'))
        this.state = 'reading_header'
        continue
      }
      debug('  🔛  Found boundary, part size %s', C(format(data.length), 'magenta'))
      // what if state is reading body
      if (this.state == 'reading_body') {
        this.nextCheckpoint(data)
      } else if (this.state == 'reading_header') {
        // headerToConsume = data
        toConsume.push(`${this.header}${data}`)
        this.header = ''
        this.state = 'finished_body'
        // found end
      } else
        toConsume.push(data)

      // if (foundSeparator == 1) {
      //   // if foundSeparator > 1, the previous part's data will have been handled in parsePart
      //   // only when seeing a first separator in the chunk, might need to handle it.
      //   this.nextCheckpoint(data)
      // } else {
      //   // check if there are further data
      //   this.nextCheckpoint()
      //   this.state = 'reading_header'
      //   this.parsePart(data)
      // }

      // const stoppedReadingBody =
      // this.finishCurrentStream()


      /**
       *  Content-Disposition: form-data; name="alan"

          watts
          --u2KxIV5yF1y+xUspOQCCZopaVgeV6Jxihv35XQJmuTx8X3sh--
          "
       */
      // sync parse part
      // if (!stoppedReadingBody)
    }
    toConsume.forEach((d) => {
      const [header, data] = d.split(/\r\n\r\n/)
      if (!data) throw new Error('Did not find the end of header before boundary.')
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
    debug('🔎  Finished boundary scan, buffer of length %s left, separators found: %s',
      format(buffer.length), foundSeparator)

    if (this.state == 'finished_body' && checkIsEnd(buffer)) {
      debug('〰️  Special case, found %s after the boundary', C('--', 'red'))
      this.state = 'data-ended'
      // this.writeBody(buffer)
      // return B.length
      // return buffer.length
      this.finishCurrentStream()
      return buffer
    } else if (this.state == 'finished_body') {
      this.state = 'reading_header'
      // this.writeHeader(buffer)
      // return ''
    }

    // we might have a header
    // if (this.state == 'reading_body' && foundSeparator && buffer.length) {
    // this.state = 'reading_header'
    // this.writeHeader(buffer)
    // return ''
    // }
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
    // buffer is what's left
    // const r = B.slice(0, B.length - buffer.length)
    // consume as a body
    if (this.state == 'reading_body' && foundSeparator
      && (buffer[0] == '-' && buffer[1] == '-')) {
      // this.writeBody(buffer)
      // return B.length
      // return buffer.length
      this.finishCurrentStream()
      return buffer
    } else if (this.state == 'reading_body' && foundSeparator) {
      this.writeHeader(buffer)
    } else if (this.state == 'reading_body') {
      this.writeBody(buffer)
      return ''
    } else if (this.state == 'reading_header') {
      this.writeHeader(buffer) // this can trigger write body
      return ''
    }
    // return B.length
    // or consume as a header

    // return how much consumed
    // return r
  }
  /**
   * Safe buffer is how much we can write confident that what we've written does not contain boundary.
   * @param {Buffer} buffer
   */
  safeBuffer(buffer) {
    // let safeBuffer
    // if (buffer.length < this.boundary.length) safeBuffer = this.buffer
    const safeBuffer = buffer.slice(0, Math.max(0, buffer.length - this.boundary.length))
    return safeBuffer
  }
  /**
   * Final is called with what's left in the buffer at the end. If it doesn't finish property with --boundary--, emit an error.
   */
  _final(cb) {
    if (this.state == 'data-ended') {
      this.push(null)
      return cb()
    }

    this.buffer = this.consumeAndUpdate(this.buffer)
    this.finishCurrentStream()

    // const endsWithDashes = /^--/.test(this.buffer)
    const isEnd = checkIsEnd(this.buffer)
    // try {
    if (!isEnd) {
      const [a, b] = this.buffer
      const e = new Error(`Unexpected end of request body, wanted to see "--" but saw ${a}${b}.`)
      cb(e)
      this.push(e)
    } else {
      cb()
      this.push(null)
    }
  }
}

const checkIsEnd = (buffer) => {
  const endsWithDashes = /^--/.test(buffer)
  return endsWithDashes
}