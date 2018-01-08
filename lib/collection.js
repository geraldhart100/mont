const monk = require('monk')

const createError = require('http-errors')

const yiwn = require('yiwn/full')
const monet = require('monet')

const {
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
  resolveP
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

class Collection extends monk.Collection {
  constructor (db, name, opts = {}) {
    const type = opts.type || name
    const indexes = opts.indexes || []

    delete opts.type
    delete opts.indexes

    super(db, name, opts)

    this.type = type
    this._indexes = indexes
  }

  aggregate (stages, options) {
    const fn = args => {
      const {
        stages,
        options
      } = args

      return args.col
        .aggregate(stages, options)
        .toArray()
    }

    return this
      ._dispatch(fn)({ stages, options }, 'aggregate')
  }

  bulkWrite (operations, options) {
    const fn = args => {
      const {
        operations,
        options
      } = args

      return args.col
        .bulkWrite(operations, options)
    }

    return this
      ._dispatch(fn)({ operations, options }, 'bulkWrite')
  }

  count (query, options) {
    const fn = args => {
      const {
        query,
        options
      } = args

      return args.col
        .count(query, options)
    }

    return this
      ._dispatch(fn)({ query, options }, 'count')
  }

  insert (data, opts) {
    if (!data) return reject400()

    return super
      .insert(data, opts)
  }

  find (query, options) {
    const args = {
      query,
      options
    }

    const fn = args => {
      const { query, options } = args

      return args.col
        .find(query, options)
        .toArray()
    }

    return this
      ._dispatch(fn)(args, 'find')
  }

  findOne (query, options) {
    const args = {
      query,
      options
    }

    const fn = args => {
      const { query, options } = args

      const callback = docs => {
        return Maybe
          .fromNull(docs[0])
          .map(Either.Right)
          .orSome(Either.Left(404))
      }

      return args.col
        .find(query, options)
        .limit(1)
        .toArray()
        .then(callback)
        // TODO: move to middleware
        .then(cata(rejectHttp, resolveP))
    }

    return this
      ._dispatch(fn)(args, 'findOne')
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

    const fn = args => {
      const { query, update } = args

      const options = getOptions(args)

      const callback = doc => {
        return Maybe
          .fromNull(doc.value)
          .map(Either.Right)
          .orSome(Either.Left(404))
      }

      return args.col
        .findOneAndUpdate(query, update, options)
        .then(callback)
    }

    const callback = cata(rejectHttp, resolveP)

    return this
      ._dispatch(fn)(args, 'findOneAndUpdate')
      .then(callback)
  }

  findOneAndDelete (query, options) {
    const args = {
      query,
      options
    }

    const fn = args => {
      const { query, options } = args

      const callback = doc => {
        return Maybe
          .fromNull(doc.value)
          .map(Either.Right)
          .orSome(Either.Left(404))
      }

      return args.col
        .findOneAndDelete(query, options)
        .then(callback)
        // TODO: move to middleware
        .then(cata(rejectHttp, resolveP))
    }

    return this
      ._dispatch(fn)(args, 'findOneAndDelete')
  }

  update (query, update, options) {
    const args = {
      query,
      update,
      options
    }

    const isMulti = opts => opts.multi || opts.single === false

    const fn = args => {
      const { query, update, options = {} } = args

      const method = isMulti(options)
        ? 'updateMany'
        : 'updateOne'

      const callback = doc => {
        return Maybe
          .fromNull(doc.result)
          .map(Either.Right)
          .orSome(Either.Left())
      }

      return args.col[method](query, update, options)
        .then(callback)
    }

    const callback = cata(rejectHttp, resolveP)

    return this
      ._dispatch(fn)(args, 'update')
      .then(callback)
  }
}

module.exports = Collection
