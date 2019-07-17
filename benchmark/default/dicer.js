import { collect } from 'catchment'
import { c } from 'erte'
import Dicer from '@idio/dicer'
import Debug from '@idio/debug'

const debug = Debug('nicerb')

/**
 * @param {import('./context').Context} context
 * @param {import('./context').ServiceContext} serviceContext
 */
const dicerTest = async function ({ startPlain, getBoundary, startTimer, collectLength, reportEnd, postForm }, { snapshotSource }) {
  snapshotSource('../sends 100mb of data with nicer')
  let b

  await startPlain(async (req, res) => {
    const boundary = getBoundary(req, res)
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
export default {
  'dicer'() { console.error('["dicer"') },
  'sends 100mb of data with dicer\n': dicerTest,
  'sends 100mb of data with dicer (2)': dicerTest,
  'sends 100mb of data with dicer (3)': dicerTest,
  'dicer-end'(){ console.error('],')},
}