const { prop } = require('yiwn/full')

const callback = prop('result')

module.exports = function updateMany (col, args) {
  const { query, update, options } = args

  return col
    .updateMany(query, update, options)
    .then(callback)
}
