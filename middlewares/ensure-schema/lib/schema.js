const sqem = require('sqem')

const env = require('sqem/lib/ajv')

const entity = require('../schemas/entity')

env.addSchema(entity)

module.exports.validate = sqem
