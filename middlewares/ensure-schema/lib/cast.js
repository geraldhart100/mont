const yiwn = require('yiwn/full')

const sqem = require('sqem')
const env = require('sqem/lib/ajv')

const coreSchema = require('../schemas/core.json')
const defaultSchema = require('../schemas/default.json')

const {
  assocPath,
  curry
} = yiwn

env.addSchema(coreSchema)

const ensureId = assocPath(['dynamicDefaults', 'id'], 'shortid')

const resFromType = type => {
  const evolveSchema = assocPath(
    ['properties', 'type'],
    {
      const: type,
      default: type
    }
  )

  return evolveSchema(defaultSchema)
}

const allFromType = type => {
  const schema = resFromType(type)

  return {
    type: 'object',
    definitions: {
      data: ensureId(schema),
      $set: schema,
      $setOnInsert: ensureId({
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      })
    },
    properties: {
      data: {
        oneOf: [
          { $ref: '#/definitions/data' },
          {
            type: 'array',
            items: { $ref: '#/definitions/data' }
          }
        ]
      },
      update: {
        type: 'object',
        properties: {
          $set: {
            $ref: '#/definitions/$set'
          },
          $setOnInsert: {
            $ref: '#/definitions/$setOnInsert',
            default: {}
          }
        }
      }
    },
    additionalProperties: true
  }
}

module.exports = curry(
  (type, data) => {
    const schema = allFromType(type)
    return sqem(schema, data)
  }
)
