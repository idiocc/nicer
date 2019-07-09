const { _Nicer } = require('./')

class Nicer extends _Nicer {
  /**
   * Create a new transform stream that emits object data with a header and the body stream.
   * @param {_nicer.$Nicer} opt
   */
  constructor(opt) {
    super(opt)
  }
}
// var n = new Nicer()
// n.on()
// console.log('testing depack')

module.exports = Nicer

/* typal types/index.xml */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {_nicer.Nicer} Nicer A stream that emits objects with a header buffer and the body PassThrough stream.
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {stream.Transform & _nicer.$Nicer} _nicer.Nicer A stream that emits objects with a header buffer and the body PassThrough stream.
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {Object} _nicer.$Nicer A stream that emits objects with a header buffer and the body PassThrough stream.
 * @prop {string} boundary The mandatory field separator.
 */
