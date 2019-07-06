import { join } from 'path'
import Http from '@contexts/http'

/**
 * A testing context for the package.
 */
export default class Context extends Http {
  /**
   * A tagged template that returns the relative path to the fixture.
   * @param {string} file
   * @example
   * fixture`input.txt` // -> test/fixture/input.txt
   */
  fixture(file) {
    const f = file.raw[0]
    return join('test/fixture', f)
  }
  getBoundary(req, res) {
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
}