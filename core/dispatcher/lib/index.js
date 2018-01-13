const compose = require('koa-compose')

const command = require('./command')

module.exports = function dispatcher (manager, collection) {

  return (method, args = {}) => {
    const ctx = {
      manager,
      collection,
      args,
      method
    }

    const exec = compose(collection.middlewares)

    return exec(ctx, command)
  }
}
