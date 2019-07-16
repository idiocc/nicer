import Nicer from '../src'
import Dicer from '@idio/dicer'
import Context from '../test/context'
import { collect } from 'catchment'

/** @type {Object<string, (c:Context)} */
export const bench = {
  context: Context,
  async 'sends 100mb of data with nicer'({ startPlain, startTimer, collectLength, reportEnd }) {
    await startPlain(async (req, res) => {
      const boundary = Context.getBoundary(req, res)
      if (!boundary) return

      startTimer()

      const nicer = new Nicer({ boundary })

      collectLength(req)
      req.pipe(nicer)

      const s = []
      nicer.on('data', ({ header, stream }) => {
        // console.log(`${header}`)
        s.push(collect(stream))
      })
      nicer.on('end', async () => {
        reportEnd()

        const data = await Promise.all(s)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(data.map(f => f.length)))
      })
    })
      .postForm('/', postForm)
      .assert(200)
  },
  async 'sends 100mb of data with dicer'({ startPlain, startTimer, collectLength, reportEnd }) {
    await startPlain(async (req, res) => {
      const boundary = Context.getBoundary(req, res)
      if (!boundary) return

      startTimer()

      const nicer = new Nicer({ boundary })

      collectLength(req)
      req.pipe(nicer)

      const s = []
      nicer.on('data', ({ header, stream }) => {
        // console.log(`${header}`)
        s.push(collect(stream))
      })
      nicer.on('end', async () => {
        reportEnd()

        const data = await Promise.all(s)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(data.map(f => f.length)))
      })
    })
      .postForm('/', postForm)
      .assert(200)
  },
}

const postForm = async (form) => {
  form.addSection('hello', 'world')
  form.addSection('test', 'data')
  await form.addFile(`benchmark/dracula.txt`, 'file')
  await Promise.all(Array.from({ length: 50 }).map(async () => {
    await form.addFile(`benchmark/img.JPG`, 'photo')
  }))
  await form.addFile(`benchmark/dracula.txt`, 'file')
}