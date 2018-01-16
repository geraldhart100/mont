const { compose, prop } = require('ramda')

const { assertNotNil } = require('../helpers')

const callback = compose(
  assertNotNil,
  prop('value')
)

module.exports = function findOneAndUpdate (col, args) {
  const { query, update, options } = args

  return col
    .findOneAndUpdate(query, update, options)
    .then(callback)
}
