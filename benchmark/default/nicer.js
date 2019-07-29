import { collect } from 'catchment'
import { c } from 'erte'
import Context from '../../test/context'
import Nicer from '../../src'
import NicerCompile from '../..'
import Debug from '@idio/debug'
export { default as context } from './context'

const debug = Debug('nicerb')

/**
 * @param {import('./context').Context} context
 * @param {import('./context').ServiceContext} serviceContext
 */
const nicerTest = async function ({ startPlain, startTimer, collectLength, reportEnd, postForm }, { snapshotSource }) {
  snapshotSource(this.compiled ? '../../sends 100mb of data with nicer' : '../sends 100mb of data with nicer')
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
    nicer.on('error', (err) => {
      res.statusCode = 500
      res.end(err.message)
    })
  })
    .postForm('/', postForm).assert(200)
    .assert(({ body }) => {
      b = body
    })
  return b
}

const nicerTestCompiled = nicerTest.bind({ compiled: true })

export default {
  'nicer'() { console.error('["nicer"') },
  'sends 100mb of data with nicer': nicerTest,
  'sends 100mb of data with nicer (2)': nicerTest,
  'sends 100mb of data with nicer (3)': nicerTest,
  'nicer-end'(){ console.error('],')},
}

export const compiled = {
  'nicerc'() { console.error('["nicerc"') },
  'sends 100mb of data with Nicer': nicerTestCompiled,
  'sends 100mb of data with Nicer (2)\n': nicerTestCompiled,
  'sends 100mb of data with Nicer (3)': nicerTestCompiled,
  'nicerc-end'(){ console.error(']]')},
}