const compose = require('koa-compose')

module.exports = function applyMiddleware (manager, collection) {
  const exec = compose(collection.middlewares)

  return lastFn => (args, method) => {
    const ctx = {
      manager,
      collection,
      args,
      method
    }

    const callback = ctx => {
      return lastFn(ctx.col, ctx.args)
    }

    return exec(ctx, callback)
  }
}
