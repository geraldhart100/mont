const Connection = require('mont-connection')
const Collection = require('mont-collection')

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
