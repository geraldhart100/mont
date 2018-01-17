const Collection = require('mont-collection')

const Connection = require('./connection')

class Manager extends Connection {
  constructor (uri, opts = {}) {
    super(uri)

    this.middlewares = opts.middlewares || []
    this.collections = []
  }

  get (type) {
    if (!this.collections[type]) {
      this.collections[type] = new Collection(this, type)
    }

    const collection = this.collections[type]

    this.middlewares.forEach(fn => collection.use(fn))

    return this.collections[type]
  }
}

module.exports = Manager
