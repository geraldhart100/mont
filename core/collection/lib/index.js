const yiwn = require('yiwn/full')

const Dispatcher = require('./dispatcher')

const {
  isEmpty,
  isArray,
  merge,
  resolveP
} = yiwn

class Collection extends Dispatcher {
  constructor (manager, name, opts = {}) {
    super()

    this.manager = manager
    this.name = name
    this.type = name
    this.options = opts

    return this
  }

  resolveCol () {
    return this.manager
      .resolveDb()
      .then(db => db.collection(this.type))
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
