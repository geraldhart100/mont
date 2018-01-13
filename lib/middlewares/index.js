const yiwn = require('yiwn/full')

const {
  merge,
  rejectP
} = yiwn

function wrapper (middleware) {
  return context => next => (args, method) => {
    const ctx = merge(context, { args, method })

    console.log(ctx.args.data)

    const callback = (err, ctx) => {
      if (err) return rejectP(err)

      const { args, method } = ctx
      return next(args, method)
    }

    return middleware(ctx, callback)
  }
}

module.exports = [
  wrapper(require('mont-middlewares-format-options')()),
  wrapper(require('mont-middlewares-format-args')()),
  wrapper(require('mont-middlewares-ensure-schema')()),
  require('./handle-errors'),
  require('./handle-response'),
  require('monk-middleware-wait-for-connection')
]
