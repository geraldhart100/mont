const yiwn = require('yiwn/full')

const Commander = require('./commander')

const awaitReady = require('mont-middleware-await-ready')
const formatArgs = require('mont-middleware-format-args')
const applySchema = require('mont-middleware-apply-schema')

const {
  isEmpty,
  isArray,
  merge,
  resolveP
} = yiwn

const defaultMiddlewares = [
  formatArgs(),
  applySchema(), // TODO: make optional
  awaitReady()
]

class Collection extends Commander {
  constructor (manager, name, opts = {}) {
    super(defaultMiddlewares)

    this.manager = manager
    this.name = name
    this.type = name
    this.options = opts

    return this
  }

  find (query, options) {
    const args = { query, options }
    return this.dispatch('find', args)
  }

  findOne (query, options) {
    const args = { query, options }
    return this.dispatch('findOne', args)
  }

  findOneAndUpdate (query, update, opts = {}) {
    const options = merge({ returnOriginal: false }, opts)
    const args = { options, query, update }
    return this.dispatch('findOneAndUpdate', args)
  }

  findOneAndDelete (query, options) {
    const args = { query, options }
    return this.dispatch('findOneAndDelete', args)
  }

  insert (data, options) {
    if (isEmpty(data)) return resolveP([])

    const args = { data, options }

    const method = isArray(data)
      ? 'insertMany'
      : 'insertOne'

    return this.dispatch(method, args)
  }

  update (query, update, options = {}) {
    const args = { query, update, options }

    const method = options.multi === false
      ? 'updateOne'
      : 'updateMany'

    return this.dispatch(method, args)
  }

  remove (query, options = {}) {
    const args = { query, options }

    const method = options.multi === false
      ? 'deleteOne'
      : 'deleteMany'

    return this.dispatch(method, args)
  }

  drop () {
    return this.dispatch('drop')
  }
}

module.exports = Collection
