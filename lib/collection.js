const monk = require('monk')

const createError = require('http-errors')

const yiwn = require('yiwn/full')
const monet = require('monet')

const applyMiddleware = require('./apply-middleware')

const {
  zipObj,
  isEmpty,
  cata,
  filter,
  prop,
  propOr,
  merge,
  compose,
  dissoc,
  pick,
  when,
  isNil,
  assoc,
  reduce,
  toPairs,
  rejectP,
  resolveP,
  props
} = yiwn

const {
  Maybe,
  Either
} = monet

const rejectHttp = (code = 400) => rejectP(createError(code))

const rejectP400 = () => rejectHttp(400)
const rejectP404 = () => rejectHttp(404)

const ensureOk = when(
  isNil,
  rejectP404
)

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
    const aggregate = ctx => {
      const {
        stages,
        options
      } = ctx.args

      return ctx.args.col
        .aggregate(stages, options)
        .toArray()
    }

    return this
      .$dispatch(aggregate)({ stages, options }, 'aggregate')
  }

  bulkWrite (operations, options) {
    const bulkWrite = ctx => {
      const {
        operations,
        options
      } = ctx.args

      return ctx.args.col
        .bulkWrite(operations, options)
    }

    return this
      .$dispatch(bulkWrite)({ operations, options }, 'bulkWrite')
  }

  count (query, options) {
    const count = ctx => {
      const {
        query,
        options
      } = ctx.args

      return ctx.args.col
        .count(query, options)
    }

    return this
      .$dispatch(count)({ query, options }, 'count')
  }

  distinct (field, query, options) {
    const distinct = ctx => {
      const { field, query, options } = ctx.args

      return ctx.args.col
        .distinct(field, query, options)
    }

    return this
      .$dispatch(distinct)({ field, query, options }, 'distinct')
  }

  find (query, options) {
    const args = {
      query,
      options
    }

    const find = ctx => {
      const { query, options } = ctx.args

      return ctx.args.col
        .find(query, options)
        .toArray()
    }

    return this
      .$dispatch(find)(args, 'find')
  }

  findOne (query, options) {
    const args = {
      query,
      options
    }

    const fn = ctx => {
      const { query, options } = ctx.args

      const callback = docs => {
        return Maybe
          .fromNull(docs[0])
          .map(Either.Right)
          .orSome(Either.Left(404))
      }

      return ctx.args.col
        .find(query, options)
        .limit(1)
        .toArray()
        .then(callback)
        // TODO: move to middleware
        .then(cata(rejectHttp, resolveP))
    }

    return this
      .$dispatch(fn)(args, 'findOne')
  }

  findOneAndUpdate (query, update, options) {
    const args = {
      options,
      query,
      update
    }

    const getOptions = compose(
      merge({ returnOriginal: false }),
      propOr({}, 'options')
    )

    const fn = ctx => {
      const { query, update } = ctx.args

      const options = getOptions(args)

      const callback = doc => {
        return Maybe
          .fromNull(doc.value)
          .map(Either.Right)
          .orSome(Either.Left(404))
      }

      return ctx.args.col
        .findOneAndUpdate(query, update, options)
        .then(callback)
    }

    const callback = cata(rejectHttp, resolveP)

    return this
      .$dispatch(fn)(args, 'findOneAndUpdate')
      .then(callback)
  }

  findOneAndDelete (query, options) {
    const args = {
      query,
      options
    }

    const fn = ctx => {
      const { query, options } = ctx.args

      const callback = doc => {
        return Maybe
          .fromNull(doc.value)
          .map(Either.Right)
          .orSome(Either.Left(404))
      }

      return ctx.args.col
        .findOneAndDelete(query, options)
        .then(callback)
        // TODO: move to middleware
        .then(cata(rejectHttp, resolveP))
    }

    return this
      .$dispatch(fn)(args, 'findOneAndDelete')
  }

  geoNear (x, y, options) {
    function geoNear (ctx) {
      const { x, y, options } = ctx.args

      return ctx.args.col
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

    function group (ctx) {
      return ctx.args.col
        .group(...getParams(ctx.args))
    }

    return this
      .$dispatch(group)(getArgs(args), 'group')
  }

  insert (data, options) {
    function insert (ctx) {
      const { data, options } = ctx.args

      if (isEmpty(data)) return resolveP([])

      const method = Array.isArray(data)
        ? 'insertMany'
        : 'insertOne'

      return ctx.args.col[method](data, options)
        .then(res => {
          const docs = res.ops

          return method === 'insertOne'
            ? docs[0]
            : docs
        })
    }

    return this
      .$dispatch(insert)({ data, options }, 'insert')
  }

  mapReduce (map, reduce, options) {
    function mapReduce (ctx) {
      const { map, reduce, options } = ctx.args

      return ctx.args.col
        .mapReduce(map, reduce, options)
    }

    return this
      .$dispatch(mapReduce)({ map, reduce, options }, 'mapReduce')
  }

  remove (query, options) {
    const isMulti = opts => opts.multi || opts.single === false

    function remove (ctx) {
      const { query, options } = ctx.args

      const method = isMulti
        ? 'deleteMany'
        : 'deleteOne'

      return ctx.args.col[method](query, options)
    }

    return this
      .$dispatch(remove)({ query, options }, 'remove')
  }

  stats (options) {
    function stats (ctx) {
      const { options } = ctx.args

      return ctx.args.col
        .stats(options)
    }

    return this
      .$dispatch(stats)({ options }, 'stats')
  }

  update (query, update, options) {
    const args = {
      query,
      update,
      options
    }

    const isMulti = opts => opts.multi || opts.single === false

    const fn = ctx => {
      const { query, update, options = {} } = ctx.args

      const method = isMulti(options)
        ? 'updateMany'
        : 'updateOne'

      const callback = doc => {
        return Maybe
          .fromNull(doc.result)
          .map(Either.Right)
          .orSome(Either.Left())
      }

      return ctx.args.col[method](query, update, options)
        .then(callback)
    }

    const callback = cata(rejectHttp, resolveP)

    return this
      .$dispatch(fn)(args, 'update')
      .then(callback)
  }
}

module.exports = Collection
