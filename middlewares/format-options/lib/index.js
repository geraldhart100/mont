const FN = require('yiwn/full')

const formatOptions = require('./options')

module.exports = function () {
  return (ctx, next) => {
    const context = formatOptions(ctx)
    ctx.args.options = context.args.options

    return next()
  }
}
