const monk = require('monk')

const createError = require('http-errors')

const yiwn = require('yiwn/full')

const applyMiddleware = require('./apply-middleware')

const commands = require('./commands')

const {
  ifElse,
  head,
  zipObj,
  prop,
  propOr,
  merge,
  compose,
  when,
  isNil,
  isEmpty,
  isArray,
  rejectP,
  resolveP,
  props
} = yiwn

const rejectHttp = (code = 400) => rejectP(createError(code))

const rejectP400 = () => rejectHttp(400)
const rejectP404 = () => rejectHttp(404)
const rejectP405 = () => rejectHttp(405)

class Collection {
  constructor (manager, name, opts = {}) {
    const type = opts.type || name

    delete opts.type

    this.type = type

  this.manager = manager
  this.name = name
  this.options = opts

  this.middlewares = this.options.middlewares || []
  delete this.options.middlewares

  this.find = this.find.bind(this)
  this.findOne = this.findOne.bind(this)
  this.findOneAndUpdate = this.findOneAndUpdate.bind(this)
  this.findOneAndDelete = this.findOneAndDelete.bind(this)
  this.insert = this.insert.bind(this)
  this.update = this.update.bind(this)
  this.remove = this.remove.bind(this)
  // this.drop = this.drop.bind(this)

    this.$dispatch = applyMiddleware(manager, this)
    return this
  }

  find (query, options) {
    const args = { query, options }

    return this.$dispatch(commands.find)(args, 'find')
  }

  findOne (query, options) {
    const args = {
      query,
      options
    }

    const callback = when(isNil, rejectP404)

    return this
      .$dispatch(commands.findOne)(args, 'findOne')
      .then(callback)
  }

  findOneAndUpdate (query, update, options) {
    const args = { options, query, update }

    const callback = when(isNil, rejectP404)

    return this
      .$dispatch(commands.findOneAndUpdate)(args, 'findOneAndUpdate')
      .then(callback)
  }

  findOneAndDelete (query, options) {
    const args = {
      query,
      options
    }

    const callback = when(isNil, rejectP404)

    return this
      .$dispatch(commands.findOneAndDelete)(args, 'findOneAndDelete')
      .then(callback)
  }

  insert (data, options) {
    if (isEmpty(data)) return resolveP([])

    const method = isArray(data)
      ? 'insertMany'
      : 'insertOne'

    return this
      .$dispatch(commands[method])({ data, options }, 'insert')
  }

  update (query, update, options = {}) {
    const args = { query, update, options }

    const method = options.multi === false
      ? 'updateOne'
      : 'updateMany'

    return this
      .$dispatch(commands[method])(args, 'update')
  }

  remove (query, options = {}) {
    const method = options.multi === false
      ? 'deleteOne'
      : 'deleteMany'

    return this
      .$dispatch(commands[method])({ query, options }, 'remove')
  }

}

module.exports = Collection
