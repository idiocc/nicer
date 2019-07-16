/* alanode example/ */
import Http from '@contexts/http'
const http = new Http()
import Context from '../test/context'
const c = new Context()
const { getBoundary } = c

const run = async () => {
/* start example */
import { Writable } from 'stream'
import Nicer from '../src'

const detected = []

const boundary = '-----example'

await http.startPlain((req, res) => {
  const boundary = getBoundary(req, res)
  console.error('Boundary detected: %s', boundary)
  const n = new Nicer({ boundary })
  let e = null
  n.on('error', (err) => {
    e = err
    res.statusCode = 500
    res.end(err.message)
  })

  // .replace(/[^$]/g, '!') javascript why
  req.on('data', a=>console.log(`\n${a.toString()}\n`))
  req.pipe(n).pipe(new Writable({
    objectMode: true,
    write(obj, enc, next) {
      const { header: HEADER, stream: STREAM } = obj

      // to print in sync have to wait for all data
      // since STREAM is a pass-through
      let d = []
      detected.push(['%s\n====\n', HEADER, d])

      STREAM.on('data', (data) => {
        d.push(data)
      })
      next()
    },
    final() {
      if (!e) {
        res.statusCode = 200
        res.end(JSON.stringify(detected))
      }
    },
  }))
})
/* end example */
  .set('Content-Type', 'multipart/form-data; boundary=-----example')
  .post('/', Buffer.concat([
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="key"\r\n\r\n`,
    `data\r\n`,
    `--${boundary}WAT`,
  ].map(Buffer.from)), {
    type: null,
  })
    // .postForm('/', async (form) => {
    //   form.addSection('key', 'value')
    //   form.addSection('alan', 'watts')
    //   await form.addFile('test/fixture/test.txt', 'file')
    //   // await form.addFile('test/fixture/cat.JPG', 'the-cat')
    // }).assert(200)
    // .assert(() => {
    //   debugger
    //   printDetected()
    //   // console.log(...de)
    // })
    .assert(500, 'Unexpected end of request body, wanted to see "--" but saw WA.')
    .assert(({ body }) => {
      console.error('[!] Error %s\n    Detected Data:', body)
      printDetected(detected)
    })

  // const res = await nicer({
  //   text: 'example',
  // })
  // console.log(res)
}

const printDetected = (detected) => {
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
    console.error(...a, '\n')
  })
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