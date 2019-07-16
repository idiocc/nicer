import { join } from 'path'
import Http from '@contexts/http'
import { Duplex } from 'stream'
import { format } from '../../benchmark/bytes'
import Debug from '@idio/debug'

const debug = new Debug('nicert')

/**
 * A testing context for the package.
 */
export default class Context extends Http {
  /**
   * A tagged template that returns the relative path to the fixture.
   * @param {string} file
   * @example
   * fixture`input.txt` // -> test/fixture/input.txt
   */
  fixture(file) {
    const f = file.raw[0]
    return join('test/fixture', f)
  }
  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  static getBoundary(req, res) {
    const contentType = req.headers['content-type']
    if (!contentType) {
      res.status = 500
      res.end('content-type not found')
      return
    }
    let boundary = /; boundary=(.+)/.exec(contentType)
    if (!boundary) {
      res.status = 500
      res.end('boundary not found')
      return
    }

    ([, boundary] = boundary)
    return boundary
  }
  get getBoundary() {
    return Context.getBoundary
  }
  startTimer() {
    this.start = +new Date
  }
  stopTimer() {
    return +new Date - this.start
  }
  collectLength(req) {
    this.l = 0
    req.on('data', ({ length }) => {
      this.l += length
    })
  }
  reportEnd() {
    const duration = this.stopTimer()
    const totalSize = this.l/1024/1024
    const mb = format(this.l)
    const mbPerSec = (totalSize / (duration / 1000)).toFixed(2)
    console.log('Processed %s at %s' , mb, mbPerSec)
  }
}


export class BufferTransform extends Duplex {
  constructor(highWaterMark) {
    super({
      highWaterMark,
    })
    /** @type {Buffer} */
    this.buffer = new Buffer(0)
    this.cb = null
    this.readRes = null
    this.cbCalled = false
    this.red = 0
  }
  _read(size) {
    const data = this.buffer.slice(0, size)
    this.buffer = this.buffer.slice(size)
    if (data.length) {
      debug('Read %s from buffer', format(data.length))
      this.delayRead = false
      this.readRes = this.push(data)
      this.red += data.length
    } else {
      debug('No data left. Delaying %s read until more data is ready.', format(size))
      this.delayRead = size
    }
    if (this.cb && !this.cbCalled && !this.buffer.length) {
      this.cbCalled = true
      this.cb() // accept more incoming data now...
    }
  }
  /**
   * @param {Buffer} chunk
   */
  _write(chunk, encoding, cb) {
    debug('Stored %s in buffer', format(chunk.length))
    this.buffer = Buffer.concat([this.buffer, chunk])
    this.cbCalled = false
    this.cb = cb
    if (this.delayRead) {
      debug('Fulfilling the delayed read of %s.', format(this.delayRead))
      this._read(this.delayRead)
    }
  }
  _final(cb) {
    debug('Total read %s', this.red)
    this.push(null)
    cb()
  }
}

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('http').IncomingMessage} http.IncomingMessage
 * @typedef {import('http').ServerResponse} http.ServerResponse
 */