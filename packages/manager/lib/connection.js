const { EventEmitter } = require('events')
const { MongoClient } = require('mongodb')

const debug = require('debug')('mont:connection')

const STATE = {
  CLOSED: 'closed',
  OPENING: 'opening',
  OPEN: 'open'
}

/**
 * Connection constructor.
 *
 * @param {String} uri
 * @param {Object} opts
 * @return {Promise} resolve when the connection is opened
 */

class Connection extends EventEmitter {
  constructor (uri, opts = {}) {
    if (!uri) throw new Error('No connection URI provided.')

    super()

    if (typeof uri === 'string') {
      if (!/^mongodb:\/\//.test(uri)) {
        uri = 'mongodb://' + uri
      }
    }

    this._state = STATE.OPENING

    this._queue = []
    this.on('open', client => {
      debug('connection opened')
      debug('emptying queries queue (%s to go)', this._queue.length)
      this._queue.forEach(function (cb) {
        cb(client)
      })
    })

    this._connectionURI = uri
    this._connectionOptions = opts

    this.open(uri, opts)

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.executeWhenOpened = this.executeWhenOpened.bind(this)
    this.resolveDb = this.resolveDb.bind(this)
  }
}

Connection.prototype.open = function (uri, opts) {
  const resolve = client => {
    this._state = STATE.OPEN
    this._client = client

    // set up events
    const self = this
    ;['authenticated', 'close', 'error', 'fullsetup', 'parseError', 'reconnect', 'timeout'].forEach(function (eventName) {
      self._client.on(eventName, function (e) {
        self.emit(eventName, e)
      })
    })

    this.emit('open', client)

    return this
  }

  const reject = err => {
    this._state = STATE.CLOSED
    this.emit('error-opening', err)
  }

  MongoClient
    .connect(uri, opts)
    .then(resolve)
    .catch(reject)
}

/**
 * Execute when connection opened.
 * @private
 */

Connection.prototype.executeWhenOpened = function () {
  switch (this._state) {
    case STATE.OPEN:
      return Promise.resolve(this._client)
    case STATE.OPENING:
      return new Promise(function (resolve) {
        this._queue.push(resolve)
      }.bind(this))
    case STATE.CLOSED:
    default:
      return new Promise(function (resolve) {
        this._queue.push(resolve)
        this.open(this._connectionURI, this._connectionOptions)
      }.bind(this))
  }
}

/**
 * Resolve `db` when opened.
 */

Connection.prototype.resolveDb = function () {
  return this
    .executeWhenOpened()
    .then(client => {
      const { dbName } = client.s.options
      return client.db(dbName)
    })
}

/**
 * Then
 *
 * @param {Function} [fn] - callback
 */

Connection.prototype.then = function (fn) {
  return new Promise((resolve, reject) => {
    this.once('open', resolve)
    this.once('error-opening', reject)
  }).then(fn.bind(null, this))
}

/**
 * Catch
 *
 * @param {Function} [fn] - callback
 */

Connection.prototype.catch = function (fn) {
  return new Promise(resolve => {
    this.once('error-opening', resolve)
  }).then(fn.bind(null))
}

/**
 * Closes the connection.
 *
 * @param {Boolean} [force] - Force close, emitting no events
 * @param {Function} [fn] - callback
 * @return {Promise}
 */

Connection.prototype.close = function (force) {
  const close = (resolve, client) => {
    client.close(force, () => {
      this._state = STATE.CLOSED
      resolve()
    })
  }

  switch (this._state) {
    case STATE.CLOSED:
      return Promise.resolve()
    case STATE.OPENING:
      return new Promise(resolve => {
        this._queue.push(client => {
          close(resolve, client)
        })
      })
    case STATE.OPEN:
    default:
      return new Promise(resolve => {
        close(resolve, this._client)
      })
  }
}

module.exports = Connection
