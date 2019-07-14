import Nicer from '../src'
import Debug from '@idio/debug'
import { format } from './bytes'
import createMultipartBuffer from './create-buffer'

const debug = new Debug('nicer')

const BOUNDARY = '-----------------------------168072824752491622650073'
const n = new Nicer({ boundary: BOUNDARY })
const MB = 100
const BUFFER = createMultipartBuffer(BOUNDARY, MB * 1024 * 1024)

const start = +new Date()
n.end(BUFFER)
let file = 0
n.on('end', () => {
  const duration = +new Date - start
  const mbPerSec = (MB / (duration / 1000)).toFixed(2)
  console.log(mbPerSec+' mb/sec')
})
n.on('data', ({ header, stream }) => {
  file++
  console.log(`Received header: ${header}`)
  stream.on('data', (d) => {
    debug('(%s) received emitted from stream %s', file, format(d.length))
  })
  stream.on('end', () => {
    debug('(%s) ended stream', file)
  })
})
// n.pipe(process.stdout)


//assert.equal(nparsed, buffer.length);