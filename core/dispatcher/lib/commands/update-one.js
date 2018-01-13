const { prop } = require('yiwn/full')

const callback = prop('result')

module.exports = function updateOne (col, args) {
  const { query, update, options } = args

  return col
    .updateOne(query, update, options)
    .then(callback)
}
