const compose = require('koa-compose')

module.exports = function applyMiddleware (middlewares) {
  const middleware = compose(middlewares)

  return function (manager, collection) {
    return lastFn => (args, method) => {
      const ctx = {
        manager,
        collection,
        args,
        method
      }

      const callback = (ctx, next) => {
        const { args, method } = ctx

        return lastFn(args, method)
      }

      return middleware(ctx, callback)
    }
  }
}
