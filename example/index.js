/* alanode example/ */
import Http from '@contexts/http'
const http = new Http()
import Context from '../test/context'
const c = new Context()
const { getBoundary } = c

const run = async () => {
/* start example */
import { Transform } from 'stream'
import Nicer from '../src'

const detected = []

await http.startPlain((req, res) => {
  const boundary = getBoundary(req, res)
  console.log('Boundary detected: %s', boundary)
  req.pipe(new Nicer({ boundary })).pipe(new Transform({
    objectMode: true,
    transform(obj, enc, next) {
      let d = []
      detected.push(['%s\n====\n', obj.header, d, '\n'])
      obj.stream.on('data', (data) => {
        d.push(data)
      })
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
      debugger
      const de = detected.map((_d) => {
        let d = /** @type {!Array<?>} */ _d
        if (Array.isArray(d[2])) {
          d[2] = d[2].map(db => {
            if (db instanceof Buffer) {
              return db.toString()
            } return db
          })
          return d
        } else return _d
      })

      de.forEach((a) => {
        console.log(...a)
      })
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