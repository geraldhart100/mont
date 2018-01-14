const createError = require('http-errors')

const yiwn = require('yiwn/full')

const dispatcher = require('mont-dispatcher')

const {
  when,
  isNil,
  isEmpty,
  isArray,
  rejectP,
  resolveP
} = yiwn

const rejectHttp = (code = 400) => rejectP(createError(code))

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

    this.find = this.find.bind(this)
    this.findOne = this.findOne.bind(this)
    this.findOneAndUpdate = this.findOneAndUpdate.bind(this)
    this.findOneAndDelete = this.findOneAndDelete.bind(this)
    this.insert = this.insert.bind(this)
    this.update = this.update.bind(this)
    this.remove = this.remove.bind(this)
    this.drop = this.drop.bind(this)

    this.$dispatch = dispatcher(manager, this)

    return this
  }

  find (query, options) {
    const args = { query, options }

    return this.$dispatch('find', args)
  }

  findOne (query, options) {
    const args = { query, options }

    const callback = when(isNil, rejectP404)

    return this
      .$dispatch('findOne', args)
      .then(callback)
  }

  findOneAndUpdate (query, update, options) {
    const args = { options, query, update }

    const callback = when(isNil, rejectP404)

    return this
      .$dispatch('findOneAndUpdate', args)
      .then(callback)
  }

  findOneAndDelete (query, options) {
    const args = {
      query,
      options
    }

    const callback = when(isNil, rejectP404)

    return this
      .$dispatch('findOneAndDelete', args)
      .then(callback)
  }

  insert (data, options) {
    if (isEmpty(data)) return resolveP([])

    const method = isArray(data)
      ? 'insertMany'
      : 'insertOne'

    return this
      .$dispatch(method, { data, options })
  }

  update (query, update, options = {}) {
    const args = { query, update, options }

    const method = options.multi === false
      ? 'updateOne'
      : 'updateMany'

    return this
      .$dispatch(method, args)
  }

  remove (query, options = {}) {
    const method = options.multi === false
      ? 'deleteOne'
      : 'deleteMany'

    return this
      .$dispatch(method, { query, options })
  }

  drop () {
    return this.$dispatch('drop')
  }
}

module.exports = Collection
