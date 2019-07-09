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

await http.startPlain((req, res) => {
  const boundary = getBoundary(req, res)
  console.log('Boundary detected: %s', boundary)
  req.pipe(new Nicer({ boundary })).pipe(new Transform({
    objectMode: true,
    transform(obj, enc, next) {
      console.log('%s\n====', obj.header) // Data from Nicer:
      obj.stream.pipe(process.stdout)
      next()
    },
    final() {
      res.statusCode = 200
      res.end('hello world')
    },
  }))
})
/* end example */
    .postForm('/', (form) => {
      form.addSection('key', 'value')
      form.addSection('alan', 'watts')
      // await form.addFile('test/fixture/cat.JPG', 'the-cat')
    })
    .assert(200, 'hello world')

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