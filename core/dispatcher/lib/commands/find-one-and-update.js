const yiwn = require('yiwn/full')

const {
  compose,
  merge,
  flip,
  propOr,
  prop
} = yiwn

const assign = flip(merge)

const getOptions = compose(
  assign({ returnOriginal: false }),
  propOr({}, 'options')
)

module.exports = function findOneAndUpdate (col, args) {
  const { query, update } = args

  const options = getOptions(args)

  return col
    .findOneAndUpdate(query, update, options)
    .then(prop('value'))
}
