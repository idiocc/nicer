import { searchTwoBuffers } from '../../src/lib'
import { equal } from '@zoroaster/assert'

const SearchTwoBuffers = {
  'finds i in the first buffer'() {
    const a = Buffer.from('hello')
    const b = Buffer.from('world')
    const res = searchTwoBuffers(a, b, 'lo')
    equal(res, 3)
  },
  'finds i in the second buffer'() {
    const a = Buffer.from('hello')
    const b = Buffer.from('world')
    const res = searchTwoBuffers(a, b, 'or')
    equal(res, 5)
  },
  'finds i in-between'() {
    const a = Buffer.from('hello')
    const b = Buffer.from('world')
    const res = searchTwoBuffers(a, b, 'ow')
    equal(res, 4)
  },
}

// export default { '!default': SearchTwoBuffers }