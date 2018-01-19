const composeM = require('koa-compose')

const { compose, append, prepend } = require('ramda')
const { isFunction } = require('ramda-adjunct')

const cast = require('mont-middleware-format-args')

const pipeM = compose(
  composeM,
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

  dispatch (fn, args = {}) {
    const context = {
      collection: this,
      manager: this.manager,
      method: fn.name,
      args
    }

    const callback = (ctx, next) => {
      const { args } = ctx
      return this
        .resolveCol()
        .then(col => fn(args, col))
    }

    return this.pipe(context, callback)
  }
}

module.exports = Dispatcher
