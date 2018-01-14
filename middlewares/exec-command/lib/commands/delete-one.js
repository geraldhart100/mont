module.exports = function deleteOne (col, args) {
  const { query, options } = args
  return col.deleteOne(query, options)
}
