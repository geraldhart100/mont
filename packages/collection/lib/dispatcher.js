const composeM = require('koa-compose')

const { compose, append, prepend } = require('ramda')
const { isFunction } = require('ramda-adjunct')

const cast = require('mont-middleware-format-args')
const exec = require('mont-middleware-exec-command')

const pipeM = compose(
  composeM,
  append(exec()),
  prepend(cast())
)

class Dispatcher {
  constructor () {
    this.middlewares = []
  }

  get pipe () {
    return pipeM(this.middlewares)
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
