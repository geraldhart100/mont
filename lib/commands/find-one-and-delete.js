const { prop } = require('yiwn/full')

const callback = prop('value')

module.exports = function findOneAndDelete (col, args) {
  const { query, options } = args

  return col
    .findOneAndDelete(query, options)
    .then(callback)
}
