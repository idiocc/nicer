import { equal, ok } from '@zoroaster/assert'
import Context from '../context'
import nicer from '../../src'

/** @type {Object.<string, (c: Context)>} */
const T = {
  context: Context,
  'is a function'() {
    equal(typeof nicer, 'function')
  },
  async 'calls package without error'() {
    await nicer()
  },
  async 'gets a link to the fixture'({ fixture }) {
    const text = fixture`text.txt`
    const res = await nicer({
      text,
    })
    ok(res, text)
  },
}

export default T