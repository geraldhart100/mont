const compose = require('koa-compose')

module.exports = function applyMiddleware (middlewares) {
  console.log(middlewares)

  const middleware = compose(middlewares)

  return function (monkInstance, collection) {
    var context = {
      monkInstance,
      collection
    }

    return lastFn => (args, method) => {
      const ctx = Object.assign({}, context, { args, method })

      const callback = (ctx, next) => {
        const { args, method } = ctx

        return lastFn(args, method)
          .then(x => {
            console.log(x)
            return x
          })
      }

      return middleware(ctx, callback)
    }
  }
}
