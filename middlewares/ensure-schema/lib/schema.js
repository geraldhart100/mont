const sqem = require('sqem')

const schema = require('../schemas/entity.json')

module.exports.validate = sqem(schema)
