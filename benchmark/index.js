import Nicer from '../src'

const BOUNDARY = '-----------------------------168072824752491622650073'
const n = new Nicer({ boundary: BOUNDARY })
const MB = 100
const BUFFER = createMultipartBuffer(BOUNDARY, MB * 1024 * 1024)

const start = +new Date()
n.end(BUFFER)
n.on('end', () => {
  const duration = +new Date - start
  const mbPerSec = (MB / (duration / 1000)).toFixed(2)
  console.log(mbPerSec+' mb/sec')
})
n.on('data', ({ header }) => {
  console.log(`${header}`)
})
// n.pipe(process.stdout)


//assert.equal(nparsed, buffer.length);

function createMultipartBuffer(boundary, size) {
  const head =
        '\r\n--'+boundary+'\r\n'
      + 'content-disposition: form-data; name="field1"\r\n'
      + '\r\n'
  const tail = '\r\n--'+boundary+'--\r\n'
  const buffer = Buffer.allocUnsafe(size)

  const b = Buffer.concat([
    Buffer.from(head, 'ascii'),
    buffer,
    Buffer.from(tail, 'ascii'),
  ])
  return b
}