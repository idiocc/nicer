import { c } from 'erte'
import Debug from '@idio/debug'
import { Form } from 'multiparty'

const debug = Debug('nicerb')

/**
 * @param {import('./context').Context} context
 * @param {import('./context').ServiceContext} serviceContext
 */
const multipartyTest = async function ({ startPlain, getBoundary, startTimer, collectLength, reportEnd, postForm }, { snapshotSource }) {
  snapshotSource('../sends 100mb of data with nicer')
  let b

  await startPlain(async (req, res) => {
    const boundary = getBoundary(req, res)
    if (!boundary) return

    debug(c('Received request, starting timer', 'red'))

    collectLength(req)
    const form = new Form()
    startTimer()

    try {
      form.parse(req, (err, fields, files) => {
        const ret = [fields.hello[0].length, fields.test[0].length, files.file[0].size,
          ...files.photo.map(p => p.size), files.file[1].size]
        reportEnd()
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify(ret))
      })
    } catch (err) {
      res.writeHead(500)
      res.end(err.message)
      reportEnd()
    }
  })
    .postForm('/', postForm).assert(200)
    .assert(({ body }) => {
      b = body
    })
  return b
}

export default {
  'multiparty'() { console.error('["multiparty"') },
  'sends 100mb of data with multiparty\n': multipartyTest,
  'sends 100mb of data with multiparty (2)': multipartyTest,
  'sends 100mb of data with multiparty (3)': multipartyTest,
  'multiparty-end'(){ console.error('],')},
}