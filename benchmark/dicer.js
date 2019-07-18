import Dicer from '@idio/dicer'
import Debug from '@idio/debug'
import createMultipartBuffer from './create-buffer'

const debug = new Debug('nicerb')

const BOUNDARY = '-----------------------------168072824752491622650073'
const MB = 100
const BUFFER = createMultipartBuffer(BOUNDARY, MB * 1024 * 1024)

const d = new Dicer({ boundary: BOUNDARY })

d.on('part', part => {
  part.on('header', (...args) => {
    console.log(`Received header: ${''}`,...args)
  })
  part.on('data', (d) => {
    debug('received data from part stream %f', d.length)
  })
  part.on('end', () => {
    debug('ended part stream')
  })
})
d.on('finish', () => {
  const duration = +new Date - start
  const mbPerSec = (MB / (duration / 1000)).toFixed(2)
  console.log(mbPerSec+' mb/sec')
})

const start = +new Date()
d.end(BUFFER)