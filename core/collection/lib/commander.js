const composeM = require('koa-compose')

const { clone, isFunction } = require('yiwn/full')

const Command = require('mont-middleware-exec-command')

const exec = Command()

class Commander {
  constructor (middlewares = []) {
    this.middlewares = clone(middlewares)
  }

  get pipe () {
    return composeM(this.middlewares)
  }

  use (fn) {
    if (!isFunction(fn)) {
      throw new TypeError('middleware must be a function')
    }

    this.middlewares.push(fn)
    return this
  }

  dispatch (method, args = {}) {
    const context = {
      collection: this,
      manager: this.manager,
      method,
      args
    }

    return this.pipe(context, exec)
  }
}

module.exports = Commander
