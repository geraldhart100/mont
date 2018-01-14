const { always, lensPath, over } = require('yiwn/full')

const defaultSchema = require('../schemas/default.json')

const typeLens = lensPath(['properties', 'type'])

module.exports = type => {
  const fixValue = always({
    const: type,
    default: type
  })

  return over(typeLens, fixValue, defaultSchema)
}
