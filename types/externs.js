/**
 * @fileoverview The program externs.
 * @externs
 */
/* typal types/index.xml externs */
/** @const */
var _nicer = {}
/**
 * A stream that emits objects with a header buffer and the body PassThrough stream.
 * @typedef {{ boundary: string }}
 */
_nicer.Nicer
/**
 * A part that gets emitted by _Nicer_.
 * @record
 */
_nicer.Part
/**
 * The mandatory field separator.
 * @type {!stream.PassThrough}
 */
_nicer.Part.prototype.stream
/**
 * The header found before data.
 * @type {!Buffer}
 */
_nicer.Part.prototype.header

/** @type {string} */
process.env.DEBUG