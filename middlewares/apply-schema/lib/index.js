const { rejectP } = require('yiwn/full')

const cast = require('./cast')

function applySchema (ctx, next) {
  const resolve = args => {
    ctx.args = args
    return next()
  }

  return cast(ctx.collection.type, ctx.args)
    .cata(rejectP, resolve)
}

module.exports = () => applySchema
