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

  // this.createIndex = this.createIndex.bind(this)
  // this.index = this.ensureIndex = this.ensureIndex.bind(this)
  // this.dropIndex = this.dropIndex.bind(this)
  // this.indexes = this.indexes.bind(this)
  // this.dropIndexes = this.dropIndexes.bind(this)
  this.update = this.update.bind(this)
  this.remove = this.remove.bind(this)
  this.findOneAndUpdate = this.findOneAndUpdate.bind(this)
  this.findOneAndDelete = this.findOneAndDelete.bind(this)
  this.insert = this.insert.bind(this)
  this.find = this.find.bind(this)
  this.distinct = this.distinct.bind(this)
  this.count = this.count.bind(this)
  this.findOne = this.findOne.bind(this)
  this.aggregate = this.aggregate.bind(this)
  // this.drop = this.drop.bind(this)

    this.$dispatch = applyMiddleware(manager, this)
    return this
  }

  aggregate (stages, options) {
    const aggregate = (col, args) => {
      const {
        stages,
        options
      } = args

      return col
        .aggregate(stages, options)
        .toArray()
    }

    return this
      .$dispatch(aggregate)({ stages, options }, 'aggregate')
  }

  bulkWrite (operations, options) {
    const bulkWrite = (col, args) => {
      const {
        operations,
        options
      } = args

      return col
        .bulkWrite(operations, options)
    }

    return this
      .$dispatch(bulkWrite)({ operations, options }, 'bulkWrite')
  }

  count (query, options) {
    const count = (col, args) => {
      const {
        query,
        options
      } = args

      return col
        .count(query, options)
    }

    return this
      .$dispatch(count)({ query, options }, 'count')
  }

  distinct (field, query, options) {
    const distinct = (col, args) => {
      const { field, query, options } = args

      return col
        .distinct(field, query, options)
    }

    return this
      .$dispatch(distinct)({ field, query, options }, 'distinct')
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

  geoNear (x, y, options) {
    function geoNear (col, args) {
      const { x, y, options } = args

      return col
        .geoNear(x, y, options)
        .then(res => {
          return res.results
        })
    }

    return this
      .$dispatch(geoNear)({ x, y, options }, 'geoNear')
  }

  group (...args) {
    const paramNames = [
      'keys',
      'condition',
      'initial',
      'reduce',
      'finalize',
      'command',
      'options'
    ]

    const getArgs = zipObj(paramNames)
    const getParams = props(paramNames)

    function group (col, args) {
      return col
        .group(...getParams(args))
    }

    return this
      .$dispatch(group)(getArgs(args), 'group')
  }

  insert (data, options) {
    if (isEmpty(data)) return resolveP([])

    const method = isArray(data)
      ? 'insertMany'
      : 'insertOne'

    return this
      .$dispatch(commands[method])({ data, options }, 'insert')
  }

  mapReduce (map, reduce, options) {
    function mapReduce (col, args) {
      const { map, reduce, options } = args

      return col
        .mapReduce(map, reduce, options)
    }

    return this
      .$dispatch(mapReduce)({ map, reduce, options }, 'mapReduce')
  }

  remove (query, options = {}) {
    const method = options.multi === false
      ? 'deleteOne'
      : 'deleteMany'

    return this
      .$dispatch(commands[method])({ query, options }, 'remove')
  }

  stats (options) {
    function stats (col, args) {
      const { options } = args

      return col
        .stats(options)
    }

    return this
      .$dispatch(stats)({ options }, 'stats')
  }

  update (query, update, options = {}) {
    const args = { query, update, options }

    const method = options.multi === false
      ? 'updateOne'
      : 'updateMany'

    return this
      .$dispatch(commands[method])(args, 'update')
  }
}

module.exports = Collection
