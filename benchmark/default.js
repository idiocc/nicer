import Nicer from '../src'
import NicerCompile from '..'
import Dicer from '@idio/dicer'
import Debug from '@idio/debug'
import Context from '../test/context'
import { collect } from 'catchment'
import { c } from 'erte'
import ServiceContext from 'zoroaster'

const debug = new Debug('nicerb')

export const context = [Context, ServiceContext]

const nicerTest = async function ({ startPlain, startTimer, collectLength, reportEnd }, { snapshotSource }) {
  snapshotSource('sends 100mb of data with nicer')
  let b
  await startPlain(async (req, res) => {
    const boundary = Context.getBoundary(req, res)
    if (!boundary) return

    debug(c('Received request, starting timer', 'red'))
    startTimer()

    let nicer
    if (this.compiled) {
      debug(c('using compiled nicer', 'green'))
      nicer = new NicerCompile({ boundary })
    } else nicer =  new Nicer({ boundary })

    collectLength(req)
    req.pipe(nicer)

    const s = []
    nicer.on('data', ({ header, stream }) => {
      // console.log(`${header}`)
      s.push(collect(stream, { binary: true }))
    })
    nicer.on('end', async () => {
      reportEnd()

      const data = await Promise.all(s)
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(data.map(f => f.length)))
    })
  })
    .postForm('/', postForm).assert(200)
    .assert(({ body }) => {
      b = body
    })
  return b
}

const nicerTestCompiled = nicerTest.bind({ compiled: true })

const dicerTest = async function ({ startPlain, startTimer, collectLength, reportEnd }, { snapshotSource }) {
  snapshotSource('sends 100mb of data with nicer')
  let b

  await startPlain(async (req, res) => {
    const boundary = Context.getBoundary(req, res)
    if (!boundary) return

    debug(c('Received request, starting timer', 'red'))
    startTimer()

    const dicer = new Dicer({ boundary })

    collectLength(req)
    req.pipe(dicer)

    const s = []
    dicer.on('part', (part) => {
      s.push(collect(part, { binary: true }))
    })
    dicer.on('finish', async () => {
      reportEnd()

      const data = await Promise.all(s)
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(data.map(f => f.length)))
    })
  })
    .postForm('/', postForm).assert(200)
    .assert(({ body }) => {
      b = body
    })
  return b
}

/** @type {Object<string, (c:Context, z:ServiceContext)} */
const T = {
  'sends 100mb of data with nicer (1)': nicerTest,
  'sends 100mb of data with nicer (2)': nicerTest,
  'sends 100mb of data with nicer-compiled': nicerTestCompiled,
  'sends 100mb of data with nicer-compiled 2': nicerTestCompiled,
  'sends 100mb of data with dicer (1)': dicerTest,
  'sends 100mb of data with dicer (2)': dicerTest,
  // 'sends 100mb of data with dicer (2)': dicerTest,
  // 'sends 100mb of data with nicer (3)': nicerTest,
  // 'sends 100mb of data with dicer (3)': dicerTest,
}

export default T

const postForm = async (form) => {
  form.addSection('hello', 'world')
  form.addSection('test', 'data')
  await form.addFile(`benchmark/dracula.txt`, 'file')
  await Promise.all(Array.from({ length: 50 }).map(async () => {
    await form.addFile(`benchmark/img.JPG`, 'photo')
  }))
  await form.addFile(`benchmark/dracula.txt`, 'file')
}