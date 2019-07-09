/**
 * @param {Buffer} a
 * @param {Buffer} b
 */
export const searchTwoBuffers = (a, b, needle) => {
  let i = a.indexOf(needle)
  if (i >= 0) return i
  const offsetLeftA = -needle.length + 1
  const oa = a.slice(offsetLeftA)
  const ob = b.slice(0, needle.length - 1)
  const joined = Buffer.concat([oa, ob])
  i = joined.indexOf(needle)
  if (i >= 0) return a.length + offsetLeftA + i
  i = b.indexOf(needle)
  if (i >= 0) return (a.length - 1) + i
  return i
  // const overlap =
}
