import Context from '../context'
import Nicer from '../../src'
import { Duplex } from 'stream'
import { collect } from 'catchment'

/** @type {Object.<string, (c: Context)>} */
const T = {
  context: Context,
  'is a function'() {
    // equal(typeof nicer, 'function')
  },
  async 'parses data'({ startPlain, getBoundary, fixture }) {
    await startPlain(async (req, res) => {
      const boundary = getBoundary(req, res)
      if (!boundary) return

      const nicer = new Nicer({
        boundary,
        writableHighWaterMark: 5,
        // readableHighWaterMark: 5,
      })
      const bt = new BufferTransform(500)
      req.pipe(bt).pipe(nicer)
      const s = []
      nicer.on('data', ({ header, stream }) => {
        s.push(collect(stream))
      })
      nicer.on('end', async () => {
        const data = await Promise.all(s)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(data))
      })
    })
      .postForm('/', async (form) => {
        form.addSection('hello', 'world')
        form.addSection('test', 'data')
        await form.addFile(fixture`test.txt`, 'file')
      })
      .assert(200, ['world', 'data', 'a test file\n'])
  },
}

class BufferTransform extends Duplex {
  constructor(highWaterMark) {
    super({
      highWaterMark,
    })
    /** @type {Buffer} */
    this.buffer = new Buffer(0)
    this.cb = null
    this.readRes = null
    this.cbCalled = false
  }
  _read(size) {
    const data = this.buffer.slice(0, size)
    this.buffer = this.buffer.slice(size)
    this.readRes = this.push(data)
    if (!this.cbCalled) {
      this.cbCalled = true
      this.cb()
    }
  }
  /**
   * @param {Buffer} chunk
   */
  _write(chunk, encoding, cb) {
    this.buffer = Buffer.concat([this.buffer, chunk])
    this.cb = cb
  }
  _final(cb) {
    this.push(null)
    cb()
  }
}

export default T