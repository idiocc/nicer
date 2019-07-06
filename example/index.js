/* alanode example/ */
import nicer from '../src'

(async () => {
  const res = await nicer({
    text: 'example',
  })
  console.log(res)
})()