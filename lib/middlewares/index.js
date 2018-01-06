const FN = require('yiwn/full')

const {
  merge
} = FN

function wrapper (middleware) {
  return context => next => (args, method) => {
    const ctx = merge(context, { args, method })

    const callback = (err, ctx) => {
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
  wrapper(require('mont-middlewares-ensure-id')()),
  require('./handle-errors'),
  require('./handle-response'),
  require('monk-middleware-wait-for-connection'),
  require('./ensure-indexes')
]
