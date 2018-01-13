const compose = require('koa-compose')

const commands = require('./commands')

module.exports = function applyMiddleware (manager, collection) {
  const exec = compose(collection.middlewares)

  return (method, args = {}) => {
    const ctx = {
      manager,
      collection,
      args,
      method
    }

    const fn = commands[method]

    if (!fn) return Promise.reject({ code: 405 })

    const callback = ctx => fn(ctx.col, ctx.args)

    return exec(ctx, callback)
  }
}
