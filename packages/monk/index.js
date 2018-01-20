const Manager = require('mont-manager')

function Mont (uri, opts) {
  return new Manager(uri, opts)
}

module.exports = Mont

module.exports.Manager = Manager
module.exports.Collection = Manager.collection
