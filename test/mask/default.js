import makeTestSuite from '@zoroaster/mask'
import Context from '../context'
import nicer from '../../src'

// export default
makeTestSuite('test/result', {
  async getResults() {
    const res = await nicer({
      text: this.input,
    })
    return res
  },
  context: Context,
})