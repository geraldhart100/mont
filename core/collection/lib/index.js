const composeM = require('koa-compose')

const yiwn = require('yiwn/full')

const awaitReady = require('mont-middleware-await-ready')
const formatArgs = require('mont-middleware-format-args')
const applySchema = require('mont-middleware-apply-schema')
const execCommand = require('mont-middleware-exec-command')

const {
  when,
  isNil,
  isEmpty,
  isArray,
  isFunction,
  merge,
  resolveP
} = yiwn

class Collection {
  constructor (manager, name, opts = {}) {
    this.manager = manager
    this.name = name
    this.type = name
    this.options = opts

    this.middlewares = [
      formatArgs(),
      applySchema(),
      awaitReady()
    ]

    return this
  }

  use (fn) {
    if (!isFunction(fn)) {
      throw new TypeError('middleware must be a function')
    }

    this.middlewares.push(fn)
    return this
  }

  $dispatch (method, args = {}) {
    const context = {
      collection: this,
      manager: this.manager,
      method,
      args
    }

    const fn = composeM(this.middlewares)

    return fn(context, execCommand())
  }

  find (query, options) {
    const args = { query, options }
    return this.$dispatch('find', args)
  }

  findOne (query, options) {
    const args = { query, options }
    return this.$dispatch('findOne', args)
  }

  findOneAndUpdate (query, update, opts = {}) {
    const options = merge({ returnOriginal: false }, opts)
    const args = { options, query, update }
    return this.$dispatch('findOneAndUpdate', args)
  }

  findOneAndDelete (query, options) {
    const args = { query, options }
    return this.$dispatch('findOneAndDelete', args)
  }

  insert (data, options) {
    if (isEmpty(data)) return resolveP([])

    const args = { data, options }

    const method = isArray(data)
      ? 'insertMany'
      : 'insertOne'

    return this.$dispatch(method, args)
  }

  update (query, update, options = {}) {
    const args = { query, update, options }

    const method = options.multi === false
      ? 'updateOne'
      : 'updateMany'

    return this.$dispatch(method, args)
  }

  remove (query, options = {}) {
    const args = { query, options }

    const method = options.multi === false
      ? 'deleteOne'
      : 'deleteMany'

    return this.$dispatch(method, args)
  }

  drop () {
    return this.$dispatch('drop')
  }
}

module.exports = Collection
