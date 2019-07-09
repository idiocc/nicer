const { PassThrough, Transform } = require('stream');

/**
 * @implements {_nicer.Nicer}
 */
class Nicer extends Transform {
  constructor(cfg) {
    const { readableHighWaterMark, writableHighWaterMark, boundary } = cfg || {}
    if (!boundary) throw new Error("please pass the boundary")
    super({
      // readableHighWaterMark,
      writableHighWaterMark,
      readableObjectMode: true,
    })
    /** @type {string} */
    this.buffer = ''
    this.needle = boundary
    this.BOUNDARY = `--${this.needle}`

    // this.BOUNDARY_LENGTH = this.boundary.length

    this.state = 'start'
    this.header = ''
    this.bodyWritten = 0
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
  writeHeader(data) {
    this.header += data
    let i = this.header.indexOf('\r\n\r\n')
    if (i != -1) {
      const header = this.header.substr(0, i)
      const newData = data.substr(i + 4)
      this.state = 'reading_body'
      this.bodyStream = new PassThrough()
      this.bodyWritten = 0
      this.header = ''
      this.push({ header, stream: this.bodyStream })
      this.writeBody(newData)
    }
  }
  get nextCheckpoint() {
    if (this.state == 'reading_body') {
      // console.log('Switched to reading the header from reading body %s bytes read', this.bodyWritten)
      this.finishCurrentStream() // just pushes null
      this.state = 'reading_header'
    }
    return null
    // else if (this.state == 'reading_header')
  }
  writeBody(data) {
    this.bodyWritten += data.length
    this.bodyStream.write(data)
  }
  _transform(chunk, enc, next) {
    this.buffer += `${chunk}`

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

    const rest = this.consumeSafe(this.buffer)
    this.buffer = rest

    next(null)
  }
  /**
   * Consumes all bytes in the safe buffer and updates the internal buffer to exclude the safe one leaving only the necessary padding.
   */
  consumeAndUpdate(safeBuffer) {
    // this.consumeSafe(safeBuffer) // assume all consumed
    // this.buffer = this.buffer.slice(safeBuffer.length - 1)
  }
  get boundary() {
    const boundary = this.state == 'start' ? this.BOUNDARY : `\r\n${this.BOUNDARY}`
    return boundary
  }
  finishCurrentStream() {
    if (this.bodyStream) {
      this.bodyStream.push(null)
      this.bodyStream = null
    }
  }
  // should consume all safe bytes
  consumeSafe(buffer) {
    let i, b, B = buffer
    // let newBuffer = buffer
    // either end of header or end of body
    // let consumedLength = 0
    let foundSeparator
    while((i = buffer.indexOf(b = this.boundary)) != -1) {
      foundSeparator = 1
      const offset = i + b.length

      const data = buffer.substr(0, i)
      buffer = buffer.substr(offset)

      if (this.state == 'start') {
        this.state = 'reading_header'
        continue
      }

      this.nextCheckpoint
      // this.finishCurrentStream()


      /**
       *  Content-Disposition: form-data; name="alan"

          watts
          --u2KxIV5yF1y+xUspOQCCZopaVgeV6Jxihv35XQJmuTx8X3sh--
          "
       */
      // sync parse part
      this.parsePart(data)
    }

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
  _final(cb) {
    this.consumeAndUpdate(this.buffer)
    if (this.bodyStream) this.bodyStream.push(null)
    const endsWithDashes = /^--/.test(this.buffer)
    try {
      if (!endsWithDashes) {
        const [a, b] = this.buffer
        cb(new Error(`Unexpected end of request body, wanted to see "--" but saw ${a}${b}.`))
      } else cb()
    } finally {
      this.push(null)
    }
  }
}

module.exports = Nicer