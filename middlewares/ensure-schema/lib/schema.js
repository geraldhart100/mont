const sqem = require('sqem')

const env = require('sqem/lib/ajv')

const core = require('../schemas/core')
const entity = require('../schemas/entity')

env.addSchema(core)
env.addSchema(entity)

module.exports.validate = sqem
