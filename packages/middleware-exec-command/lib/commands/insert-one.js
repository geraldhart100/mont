const { compose, head, prop } = require('ramda')

const callback = compose(
  head,
  prop('ops')
)

module.exports = function insertOne (col, args) {
  const { data, options } = args

  return col
    .insertOne(data, options)
    .then(callback)
}
