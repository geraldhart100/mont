module.exports = function find (col, args) {
  const { query, options } = args

  return col
    .find(query, options)
    .toArray()
}
