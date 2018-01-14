const createError = require('http-errors')

const yiwn = require('yiwn/full')

const dispatcher = require('mont-dispatcher')

const {
  when,
  isNil,
  isEmpty,
  isArray,
  isFunction,
  rejectP,
  resolveP
} = yiwn

const rejectHttp = (code = 400) => rejectP(createError(code))

const rejectP404 = () => rejectHttp(404)

class Collection {
  constructor (manager, name, opts = {}) {

    this.manager = manager
    this.name = name
    this.type = name
    this.options = opts

    this.middlewares = []

    this.$dispatch = dispatcher(manager, this)

    return this
  }

  use (fn) {
    if (!isFunction(fn)) {
      throw new TypeError('middleware must be a function')
    }

    this.middlewares.push(fn)
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
