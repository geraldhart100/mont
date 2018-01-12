const {
  curry,
  evolve,
  propOr,
  assoc,
  assocPath,
  compose
} = require('ramda')

const sqem = require('sqem')

const env = require('sqem/lib/ajv')

env
  .addSchema(require('../schemas/core.json'))
  .addSchema(require('../schemas/default.json'))

const ensureDynamicDefaults = assocPath(['dynamicDefaults', 'id'], 'shortid')

const ensurePropId = assocPath(['properties', 'id', 'type'], 'string')

const ensurePropType = S => {
  const value = {
    const: S.$id,
    default: S.$id
  }
  return assocPath(['properties', 'type'], value, S)
}

const stripAdditional = assoc('additionalProperties', false)

const evolveSchema = compose(
  ensureDynamicDefaults,
  ensurePropId,
  ensurePropType,
  stripAdditional
)

module.exports.validate = curry(
  (schema, data) => {
    return sqem(evolveSchema(schema), data)
  }
)
