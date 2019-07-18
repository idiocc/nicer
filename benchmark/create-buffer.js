import Debug from '@idio/debug'
import Form from '@multipart/form'

const debug = new Debug('nicerb')

/**
 * @param {string} boundary
 * @param {number} size
 */
export default function createMultipartBuffer(boundary, size = 0) {
  const form = new Form({ boundary })
  form.addSection('field1', Buffer.allocUnsafe(size))
  debug('getting form data')
  const data = form.buffer
  debug('Generated %f of form data', data.length)
  return data
}