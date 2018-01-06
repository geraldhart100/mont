const FN = require('yiwn/full')

const formatOptions = require('./options')

const {
  resolveP
} = FN

module.exports = function () {
  return (ctx, next) => {
    const resolve = res => next(null, res)
    const reject = err => next(err)

    return resolveP(formatOptions(ctx))
      .catch(reject)
      .then(resolve)
  }
}
