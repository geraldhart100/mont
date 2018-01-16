const { compose, head } = require('ramda')

const { assertNotNil } = require('../helpers')

const callback = compose(
  assertNotNil,
  head
)

module.exports = function findOne (col, args) {
  const { query, options } = args

  return col
    .find(query, options)
    .limit(1)
    .toArray()
    .then(callback)
}
