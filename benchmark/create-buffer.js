import { format } from './bytes'
import Debug from '@idio/debug'
import Form from '@multipart/form'

const debug = new Debug('nicer')

/**
 * @param {string} boundary
 * @param {number} size
 */
export default function createMultipartBuffer(boundary, size = 0) {
  const form = new Form({ boundary })
  form.addSection('field1', Buffer.allocUnsafe(size))
  debug('getting form data')
  const data = form.buffer
  debug('got %s of free memory', data.length)
  // const head =
  //       '--'+boundary+'\r\n'
  //     + 'content-disposition: form-data; name="field1"\r\n'
  //     + '\r\n'
  // const tail = `\r\n--${boundary}--\r\n`
  // const buffer = Buffer.allocUnsafe(size)
  const s = format(data.length)
  debug('buffer %s alloc', s)

  // const b = Buffer.concat([
  //   Buffer.from(head, 'ascii'),
  //   buffer,
  //   Buffer.from(tail, 'ascii'),
  // ])
  return data
}