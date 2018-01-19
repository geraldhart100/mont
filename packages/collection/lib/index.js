const { isEmpty, merge } = require('ramda')
const { isArray, resolveP } = require('ramda-adjunct')

const Dispatcher = require('./dispatcher')

const M = require('./commands')

class Collection extends Dispatcher {
  constructor (manager, type) {
    super()

    this.manager = manager
    this.type = type

    return this
  }

  resolveCol () {
    return this.manager
      .resolveDb()
      .then(db => db.collection(this.type))
  }

  find (query, options) {
    const args = { query, options }
    return this.dispatch(M.find, args)
  }

  findOne (query, options) {
    const args = { query, options }
    return this.dispatch(M.findOne, args)
  }

  findOneAndDelete (query, options) {
    const args = { query, options }
    return this.dispatch(M.findOneAndDelete, args)
  }

  findOneAndUpdate (query, update, opts = {}) {
    const options = merge({ returnOriginal: false }, opts)
    const args = { options, query, update }

    return this.dispatch(M.findOneAndUpdate, args)
  }

  findOneOrCreate (query, update, opts = {}) {
    const defaults = {
      upsert: true,
      returnOriginal: false
    }

    const options = merge(opts, defaults)

    const args = { query, update, options }

    return this.dispatch(M.findOneAndUpdate, args)
  }

  insert (data, options) {
    if (isEmpty(data)) return resolveP([])

    const args = { data, options }

    const method = isArray(data)
      ? M.insertMany
      : M.insertOne

    return this.dispatch(method, args)
  }

  update (query, update, options = {}) {
    const args = { query, update, options }

    const method = options.multi === false
      ? M.updateOne
      : M.updateMany

    return this.dispatch(method, args)
  }

  remove (query, options = {}) {
    const args = { query, options }

    const method = options.multi === false
      ? M.deleteOne
      : M.deleteMany

    return this.dispatch(method, args)
  }

  drop () {
    return this.dispatch(M.drop)
  }
}

module.exports = Collection
