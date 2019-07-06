import { PassThrough, Transform } from 'stream'

export default class Nicer extends Transform {
  constructor(cfg) {
    const { readableHighWaterMark, writableHighWaterMark } = cfg
    super({
      // readableHighWaterMark,
      writableHighWaterMark,
      readableObjectMode: true,
    })
    /** @type {string} */
    this.buffer = '\r\n'
    this.needle = cfg.boundary
    this.BOUNDARY = `\r\n--${this.needle}`
    this.BOUNDARY_LENGTH = this.BOUNDARY.length

    this.state = 'start'
    this.header = null
  }
  /**
   * @param {string} data
   * @param {boolean} isNewPart
   * @param {string} cb
   */
  parse(data, isNewPart, cb) {
    if (this.state == 'start') {
      this.state = 'reading_header'
      this.header = ''
      return
    }
    if (isNewPart) {
      this.state = 'reading_header'
      this.header = ''
      if (this.bodyStream) {
        this.bodyStream.push(null)
        this.bodyStream = null
      }
    }
    if (this.state == 'reading_header') {
      this.header += data
      let i = this.header.indexOf('\r\n\r\n')
      if (i != -1) {
        const header = this.header.substr(0, i)
        const newData = data.substr(i + 4)
        this.state = 'reading_body'
        this.bodyStream = new PassThrough()
        this.push({ header: header, stream: this.bodyStream })
        this.parse(newData, false)
      }
    } else if (this.state == 'reading_body') {
      this.bodyStream.write(data)
    }
  }
  _transform(chunk, enc, next) {
    this.buffer += `${chunk}`

    // this is the buffer with padding, so that a part of the boundary does not
    // end up in the body
    let safeBuffer = (
      this.state == 'start' ||
      this.buffer.length < this.BOUNDARY_LENGTH) ? this.buffer :
      this.buffer.slice(0, this.buffer.length - this.BOUNDARY_LENGTH + 1)

    this.consume(safeBuffer)
    next(null)
  }
  consume(buffer) {
    let i
    while((i = buffer.indexOf(this.BOUNDARY)) != -1) {
      const data = buffer.substr(0, i)
      this.buffer = this.buffer.substr(data.length + this.BOUNDARY_LENGTH)
      buffer = buffer.substr(data.length + this.BOUNDARY_LENGTH)
      this.parse(data, true)
    }
    return buffer
  }
  _final(cb) {
    const rest = this.consume(this.buffer)
    if (this.bodyStream) this.bodyStream.push(null)
    const endsWithDashes = /^--/.test(rest)
    if (!endsWithDashes) {
      const [a, b] = rest
      cb(new Error(`Unexpected end of request body, wanted to see "--" but saw ${a}${b}.`))
    } else cb()
  }
}