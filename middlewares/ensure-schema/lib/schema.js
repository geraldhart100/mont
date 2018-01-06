const Joi = require('joi')

const handleErrors = require('joi-http-errors')

const id = Joi
  .string()

const type = Joi
  .string()
  .when('$type', {
    is: Joi.exist(),
    then: Joi.default(Joi.ref('$type')),
    otherwise: Joi.default('entities')
  })

const identifier = Joi
  .object({ id, type })
  .options({ stripUnknown: true })

const meta = Joi.any()
const body = Joi.any()
const links = Joi.any()

const reference = identifier
  .options({ presence: 'required' })

const refs = Joi
  .object()
  .pattern(/.+/, reference)

const resource = identifier
  .keys({ meta, body, refs, links })
  .error(handleErrors())

module.exports = Joi
  .alternatives(
    resource,
    Joi.array().items(resource)
  )
