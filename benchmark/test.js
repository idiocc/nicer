import Nicer from '../src'
import Http from '@contexts/http'
import { collect } from 'catchment'

const http = new Http()
let startTime
let l = 0

;(async () => {
  await http.startPlain(async (req, res) => {
    const boundary = getBoundary(req, res)
    if (!boundary) return

    startTime = +new Date

    const nicer = new Nicer({ boundary })

    req.on('data', ({ length }) => {
      l += length
    })
    req.pipe(nicer)
    const s = []
    nicer.on('data', ({ header, stream }) => {
      console.log(`${header}`)
      s.push(collect(stream))
    })
    nicer.on('end', async () => {
      const data = await Promise.all(s)
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(data.map(f => f.length)))
    })
  })
    .postForm('/', async (form) => {
      form.addSection('hello', 'world')
      form.addSection('test', 'data')
      await form.addFile(`benchmark/dracula.txt`, 'file')
      await Promise.all(Array.from({ length: 50 }).map(async () => {
        await form.addFile(`benchmark/img.JPG`, 'photo')
      }))
      await form.addFile(`benchmark/dracula.txt`, 'file')
    })
    .assert(200)

  const duration = +new Date - startTime
  const mbPerSec = (l / (duration / 1000)).toFixed(2)
  console.log(mbPerSec)

  await http._destroy()
})()

function getBoundary(req, res) {
  const contentType = req.headers['content-type']
  if (!contentType) {
    res.status = 500
    res.end('content-type not found')
    return
  }
  let boundary = /; boundary=(.+)/.exec(contentType)
  if (!boundary) {
    res.status = 500
    res.end('boundary not found')
    return
  }

  ([, boundary] = boundary)
  return boundary
}