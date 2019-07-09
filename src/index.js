import { PassThrough, Transform } from 'stream'

/**
 * @param {Buffer} a
 * @param {Buffer} b
 */
const concat = (a, b) => {
  const start = +new Date
  // const by = Buffer.allocUnsafe(a.length + b.length)
  // by.copy(a)
  // by.copy(b, 0, a.length)
  const res = Buffer.concat([a, b])
  const duration = +new Date - start
  console.log('concat in %sms', duration)
  return res
}

export default class Nicer extends Transform {
  constructor(cfg) {
    const { readableHighWaterMark, writableHighWaterMark } = cfg
    super({
      // readableHighWaterMark,
      writableHighWaterMark,
      readableObjectMode: true,
      decodeStrings: false,
    })
    /** @type {Buffer} */
    this.buffer = Buffer.from('\r\n')
    this.needle = cfg.boundary
    this.BOUNDARY = `\r\n--${this.needle}`
    this.BOUNDARY_LENGTH = this.BOUNDARY.length
    // this.BOUNDARY_LENGTH = this.BOUNDARY.length

    this.state = 'start'
    /** @type {Buffer} */
    this.header = null
  }
  /**
   * @param {string} data
   * @param {boolean} fullPart
   * @param {string} cb
   */
  parse(data, fullPart, cb) {
    if (this.state == 'start') {
      this.state = 'reading_header'
      this.header = Buffer.from('')
      return
    }
    if (fullPart) {
      this.state = 'reading_header'
      this.header = Buffer.from('')
      if (this.bodyStream) {
        this.bodyStream.push(null)
        this.bodyStream = null
      }
    }
    if (this.state == 'reading_header') {
      this.header = concat(this.header, data)
      let i = this.header.indexOf('\r\n\r\n')
      if (i != -1) {
        const header = this.header.slice(0, i)
        const body = data.slice(i + 4)
        this.state = 'reading_body'
        if (fullPart) {
          this.push({ header, body })
        } else {
          this.bodyStream = new PassThrough()
          this.parse(body, false)
        }
      }
    } else if (this.state == 'reading_body') {
      this.bodyStream.write(data)
    }
  }
  _transform(chunk, enc, next) {
    // const start = +new Date
    // concat(Buffer.from('abc'), Buffer.from('def'))
    this.buffer = concat(this.buffer, chunk)
    // const duration = +new Date - start
    // console.log('alloc in %sms', duration)

    // this is the buffer with padding, so that a part of the boundary does not
    // end up in the body
    // let safeBuffer = this.buffer.slice(0, this.buffer.length - this.BOUNDARY_LENGTH)
    let safeBuffer = (
      this.state == 'start' ||
      this.buffer.length < this.BOUNDARY_LENGTH) ? this.buffer :
      this.buffer.slice(0, this.buffer.length - this.BOUNDARY_LENGTH + 1)

    this.consume(safeBuffer)
    // this.buffer = rest.slice(-this.BOUNDARY_LENGTH + 1)
    // const toConsume = rest.slice(0, this.buffer.length)

    // this.parse(toConsume)
    next(null)
  }
  /**
   * @param {Buffer} buffer
   */
  consume(buffer) {
    let i
    const start = +new Date
    while((i = buffer.indexOf(this.BOUNDARY)) != -1) {
      const duration = +new Date - start
      console.log('found %s in %sms', i, duration)
      const data = buffer.slice(0, i)
      this.buffer = this.buffer.slice(data.length + this.BOUNDARY_LENGTH)
      buffer = buffer.slice(data.length + this.BOUNDARY_LENGTH)
      this.parse(data, true)
      this.state = 'reading_header'
    }
    const duration = +new Date - start
    console.log('consumed in %sms', duration)
    return buffer
  }
  _final(cb) {
    const rest = this.consume(this.buffer)
    if (this.bodyStream) this.bodyStream.push(null)
    const endsWithDashes = /^--/.test(`${rest}`)
    if (!endsWithDashes) {
      const [a, b] = rest
      cb(new Error(`Unexpected end of request body, wanted to see "--" but saw ${a}${b}.`))
    } else cb()
  }
}