const { assocPath, dissocPath } = require('yiwn/full')

const sqem = require('sqem')
const env = require('sqem/lib/ajv')

const coreSchema = require('../schemas/core.json')

env.addSchema(coreSchema)

const ensureId = assocPath(['dynamicDefaults', 'id'], 'shortid')
const skipId = dissocPath(['properties', 'id'])

const extend = schema => {
  return {
    type: 'object',
    definitions: {
      data: ensureId(schema),
      $set: skipId(schema),
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

module.exports = (schema, data) => {
  const extendedSchema = extend(schema)
  return sqem(extendedSchema, data)
}
