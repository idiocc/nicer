/* alanode example/ */
process.env.DEBUG = process.env.DEBUG ? `${process.env.DEBUG},nicer` : 'nicer'

import Http from '@contexts/http'
const http = new Http()
import Context, { BufferTransform } from '../test/context'
const c = new Context()
const { getBoundary } = c

const run = async () => {
/* start example */
import { Writable } from 'stream'
import Nicer from '../src'

const detected = []

await http.startPlain((req, res) => {
  const boundary = getBoundary(req, res)
  console.log('Boundary detected: %s', boundary)
  const nicer = new Nicer({ boundary })
  const bt = new BufferTransform(50)

  req.pipe(bt).pipe(nicer).pipe(new Writable({
    objectMode: true,
    write(obj, enc, next) {
      const { header: HEADER, stream: STREAM } = obj
      next()
    },
    final() {
      res.statusCode = 200
      res.end(JSON.stringify(detected))
    },
  }))
})
/* end example */
    .postForm('/', async (form) => {
      form.addSection('key', 'value')
      form.addSection('alan', 'watts')
      await form.addFile('test/fixture/test.txt', 'file')
      // await form.addFile('test/fixture/cat.JPG', 'the-cat')
    }).assert(200)
    .assert(() => {
      // debugger
      // const de = detected.map((_d) => {
      //   let d = /** @type {!Array<?>} */ _d
      //   if (Array.isArray(d[2])) {
      //     d[2] = d[2].map(db => {
      //       if (db instanceof Buffer) {
      //         return db.toString()
      //       } return db
      //     })
      //     return d
      //   } else return _d
      // })

      // de.forEach((a) => {
      //   console.log(...a, '\n')
      // })
      // console.log(...de)
    })

  // const res = await nicer({
  //   text: 'example',
  // })
  // console.log(res)
}

;(async () => {
  try {
    await run()
  } catch (err) {
    console.log(err)
  } finally {
    await http._destroy()
  }
})()