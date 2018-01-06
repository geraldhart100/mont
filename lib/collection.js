const monk = require('monk')

const createError = require('http-errors')

const FN = require('yiwn/full')

const {
  dissoc,
  pick,
  when,
  isNil,
  assoc,
  reduce,
  toPairs,
  rejectP,
  resolveP
} = FN

const rejectP400 = () => rejectP(createError(400))
const rejectP404 = () => rejectP(createError(404))

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

  insert (data, opts) {
    if (!data) return reject400()

    return super
      .insert(data, opts)
  }

  findOne (...args) {
    return super
      .findOne(...args)
      .then(ensureOk)
  }

  findOneAndUpdate (query, update, options) {
    const args = {
      options,
      query,
      update
    }

    const fn = args => {
      const { query, update, options = {} } = args

      if (typeof options.returnOriginal === 'undefined') {
        options.returnOriginal = false
      }

      const callback = doc => {
        if (doc && typeof doc.value !== 'undefined') {
          return doc.value
        }

        if (doc.ok && doc.lastErrorObject && doc.lastErrorObject.n === 0) {
          return null
        }

        return doc
      }

      return args.col
        .findOneAndUpdate(query, update, options)
        .then(callback)
    }

    return this
      ._dispatch(fn)(args, 'findOneAndUpdate')
      .then(when(isNil, rejectP404))
  }

  findOneAndDelete (...args) {
    return super
      .findOneAndDelete(...args)
      .then(ensureOk)
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

      return args.col[method](query, update, options)
        .then(function (doc) {
          return (doc && doc.result) || doc
        })
    }

    return this
      ._dispatch(fn)(args, 'update')
  }
}

module.exports = Collection
