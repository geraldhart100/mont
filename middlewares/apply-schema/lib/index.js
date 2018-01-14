const { rejectP } = require('yiwn/full')

const cast = require('./cast')

const generate = require('./schema-from-type')

function applySchema (ctx, next) {
  const schema = generate(ctx.collection.type)

  const resolve = args => {
    ctx.args = args
    return next()
  }

  return cast(schema, ctx.args)
    .cata(rejectP, resolve)
}

module.exports = () => applySchema
