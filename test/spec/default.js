import { equal } from '@zoroaster/assert'
import Context, { BufferTransform } from '../context'
import Nicer from '../../src'
import { collect } from 'catchment'
import Debug from '@idio/debug'
import { createReadStream } from 'fs'
import Form from '@multipart/form'

const debug = new Debug('nicert')

/** @type {Object.<string, (c: Context)>} */
const T = {
  context: Context,
  'is a function'() {
    equal(typeof Nicer, 'function')
  },
  async 'parses data'({ startPlain, getBoundary, fixture }) {
    await startPlain(async (req, res) => {
      const boundary = getBoundary(req, res)
      if (!boundary) return

      const nicer = new Nicer({
        boundary,
        // writableHighWaterMark: 5,
        // readableHighWaterMark: 5,
      })
      const bt = new BufferTransform(500)
      req.pipe(bt).pipe(nicer)
      const s = []
      nicer.on('data', ({ header, stream }) => {
        debug('received header and stream')
        debug(`${header}`.substr(0, 50))
        s.push(collect(stream, { binary: 1 }))
      })
      nicer.on('end', async () => {
        const data = await Promise.all(s)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(data.map(d => `${d}`)))
      })
    })
      .postForm('/', async (form) => {
        form.addSection('hello', 'world')
        form.addSection('test', 'data')
        await form.addFile(fixture`test.txt`, 'file')
      })
      .assert(200, ['world', 'data', 'a test file\n'])
  },
  async 'parses file'({ startPlain, getBoundary, fixture }) {
    await startPlain(async (req, res) => {
      const boundary = getBoundary(req, res)
      if (!boundary) return

      const nicer = new Nicer({ boundary })
      // const bt = new BufferTransform()
      req
        // .pipe(bt)
        .pipe(nicer)
      const s = []
      nicer.on('data', ({ header, stream }) => {
        s.push(collect(stream, { binary: true }))
      })
      nicer.on('end', async () => {
        const data = await Promise.all(s)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(data.map(d => d.length)))
      })
    })
      .postForm('/', async (form) => {
        form.addSection('hello', 'world')
        form.addSection('test', 'data')
        await form.addFile(fixture`cat.JPG`, 'picture')
      })
      .assert(200, [5, 4, 1266310])
  },
  async 'receives header'({ startPlain, getBoundary, fixture }) {
    let b
    await startPlain(async (req, res) => {
      const boundary = getBoundary(req, res)
      if (!boundary) return

      const nicer = new Nicer({ boundary })
      // const bt = new BufferTransform()
      req
        // .pipe(bt)
        .pipe(nicer)
      const s = []
      // how to add jsdoc on on
      nicer.on('data', ({ header }) => {
        s.push(header.toString())
      })
      nicer.on('end', async () => {
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(s))
      })
    })
      .postForm('/', async (form) => {
        form.addSection('hello', 'world')
        form.addSection('test', 'data')
        await form.addFile(fixture`cat.JPG`, 'picture')
      })
      .assert(200).assert(f => {
        b = f.body
      })
    return b
  },
  async 'reads small file'({ startPlain, getBoundary, fixture }) {
    await startPlain(async (req, res) => {
      const boundary = getBoundary(req, res)
      if (!boundary) return

      const nicer = new Nicer({ boundary })
      const bt = new BufferTransform(1024 * 10)
      req.pipe(bt).pipe(nicer)
      const s = []
      nicer.on('data', ({ header, stream }) => {
        s.push(collect(stream, { binary: 1 }))
      })
      nicer.on('end', async () => {
        const data = await Promise.all(s)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(data.map(d => d.length)))
      })
      nicer.on('error', () => {
        res.statusCode = 500
        res.end(null)
      })
    })
      .postForm('/', async (form) => {
        form.addSection('hello', 'world')
        form.addSection('test', 'data')
        await form.addFile(fixture`test.txt`, 'text')
      })
      .assert(200, [5, 4, 12])
  },
  async 'reads data when header is split between chunks'({ startPlain, getBoundary }) {
    await startPlain(async (req, res) => {
      const boundary = getBoundary(req, res)
      if (!boundary) return

      const nicer = new Nicer({ boundary })
      const bt = new BufferTransform(25)
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
      nicer.on('error', (err) => {
        res.statusCode = 500
        res.end(null)
      })
    })
      .postForm('/', async (form) => {
        form.addSection('hello', 'world')
        form.addSection('test', 'data')
      })
      .assert(200, ['world', 'data'])
  },
}

export const simple = {
  async 'parses file'({ fixture }) {
    const form = new Form()
    const nicer = new Nicer({ boundary: form.boundary })
    form.addSection('hello', 'world')
    form.addSection('test', 'data')
    await form.addFile(fixture`cat.JPG`, 'picture')
    nicer.end(form.buffer)
    const s = []
    const data = await new Promise((r, j) => {
      nicer.on('data', ({ stream }) => {
        s.push(collect(stream, { binary: true }))
      })
      nicer.on('end', async () => {
        const d = await Promise.all(s)
        r(d)
      })
      nicer.on('error', j)
    })
    return data.map(d => d.length)
  },
  async 'parses file in chunks'({ fixture }) {
    const form = new Form()
    const nicer = new Nicer({ boundary: form.boundary })
    form.addSection('hello', 'world')
    form.addSection('test', 'data')
    await form.addFile(fixture`cat.JPG`, 'picture')
    // nicer.end(form.buffer)
    const s = []
    const b=new BufferTransform(64*1024)
    b.pipe(nicer)
    b.end(form.buffer)
    let c = collect(b, { binary: true })
    const data = await new Promise((r, j) => {
      nicer.on('data', ({ stream }) => {
        s.push(collect(stream, { binary: true }))
      })
      nicer.on('end', async () => {
        const d = await Promise.all(s)
        r(d)
      })
      nicer.on('error', j)
    })
    c = await c
    equal(c.length, 1266755)
    return data.map(d => d.length)
  },
}

// export
const buffer = {
  async '!correctly writes buffer'() {
    const b = new BufferTransform(1024 * 10)
    const rs = createReadStream('test/fixture/cat.JPG')
    rs.pipe(b)
    const [expected, res] = await Promise.all([
      collect(rs, { binary: 1 }),
      collect(b, { binary: 1 }),
    ])
    equal(expected.length, 1266310)
    equal(res.length, expected.length)
  },
}

export default T