const yiwn = require('yiwn/full')

const {
  merge,
  rejectP
} = yiwn

function wrapper (middleware) {
  return context => next => (args, method) => {
    const ctx = merge(context, { args, method })

    const callback = (err, ctx) => {
      if (err) return rejectP(err)

      const { args, method } = ctx
      return next(args, method)
    }

    return middleware(ctx, callback)
  }
}

module.exports = [
  require('mont-middlewares-format-options')(),
  require('mont-middlewares-format-args')(),
  // require('mont-middlewares-ensure-schema')(),
  require('mont-middleware-await-ready')(),
  // require('./handle-response')(),
  // require('./handle-errors')()
]
