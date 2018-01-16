const { compose, prop } = require('ramda')

const { assertNotNil } = require('../helpers')

const callback = compose(
  assertNotNil,
  prop('value')
)

module.exports = function findOneAndDelete (col, args) {
  const { query, options } = args

  return col
    .findOneAndDelete(query, options)
    .then(callback)
}
