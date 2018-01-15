const composeM = require('koa-compose')

const { clone, isFunction } = require('yiwn/full')

const cast = require('mont-middleware-format-args')
const exec = require('mont-middleware-exec-command')

class Dispatcher {
  constructor () {
    this.middlewares = [
      cast(),
      exec()
    ]
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

    return this.pipe(context)
  }
}

module.exports = Dispatcher
