const Collection = require('mont-collection')

const Connection = require('./connection')

class Manager extends Connection {
  constructor (uri) {
    super(uri)

    this.collections = []
  }

  get (type) {
    if (!this.collections[type]) {
      this.collections[type] = new Collection(this, type)
    }

    return this.collections[type]
  }
}

module.exports = Manager
