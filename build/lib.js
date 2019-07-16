
/**
 * @param {string|!Buffer} a
 * @param {string|!Buffer} b
 */
const concat = (a, b, comment='', z =0) => {
  // if (!a.length) return b
  // if (!b.length) return a
  if (comment) comment = `-${comment}`
  const a_s = a.toString()
  const x = ' '.repeat(z)
  debug('%s<concat%s> a.toString %s', x, comment, format(a_s.length))
  const bs = b.toString()
  debug('%s<concat%s> b.toString %s', x, comment, format(bs.length))
  const r = a_s + bs
  debug('%s<concat%s> a+b %s', x, comment, format(r.length))
  return r
}