const { head } = require('yiwn/full')

module.exports = function findOne (col, args) {
  const { query, options } = args

  return col
    .find(query, options)
    .limit(1)
    .toArray()
    .then(head)
}
