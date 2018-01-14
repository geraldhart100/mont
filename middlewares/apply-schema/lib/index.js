const FN = require('yiwn/full')

const cast = require('./cast')

module.exports = function () {

  return async (ctx, next) => {
    const resolve = args => {
      ctx.args = args
      return next(null, ctx)
    }

    const reject = err => {
      return next(err)
    }

    return cast(ctx.collection.type, ctx.args)
      .cata(reject, resolve)
  }
}
