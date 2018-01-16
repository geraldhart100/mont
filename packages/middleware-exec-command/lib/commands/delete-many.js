module.exports = function deleteMany (col, args) {
  const { query, options } = args
  return col.deleteMany(query, options)
}
