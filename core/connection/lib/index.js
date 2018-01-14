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
 * @param {Array|String} uri replica sets can be an array or
 * comma-separated
 * @param {Object} opts
 * @return {Promise} resolve when the connection is opened
 */

class Connection extends EventEmitter {
  constructor (uri, opts = {}) {
    if (!uri) throw new Error('No connection URI provided.')

    super()

    if (Array.isArray(uri)) {
      if (!opts.database) {
        for (var i = 0, l = uri.length; i < l; i++) {
          if (!opts.database) {
            opts.database = uri[i].replace(/([^\/])+\/?/, '') // eslint-disable-line
          }
          uri[i] = uri[i].replace(/\/.*/, '')
        }
      }
      uri = uri.join(',') + '/' + opts.database
      debug('repl set connection "%j" to database "%s"', uri, opts.database)
    }

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
  }
}

Connection.prototype.open = function (uri, opts) {
  MongoClient.connect(uri, opts, function (err, client) {
    if (err || !client) {
      this._state = STATE.CLOSED
      this.emit('error-opening', err)
    } else {
      this._state = STATE.OPEN
      this._client = client

      // set up events
      var self = this
      ;['authenticated', 'close', 'error', 'fullsetup', 'parseError', 'reconnect', 'timeout'].forEach(function (eventName) {
        self._client.on(eventName, function (e) {
          self.emit(eventName, e)
        })
      })

      this.emit('open', client)
    }
  }.bind(this))
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
 * Then
 *
 * @param {Function} [fn] - callback
 */

Connection.prototype.then = function (fn) {
  return new Promise(function (resolve, reject) {
    this.once('open', resolve)
    this.once('error-opening', reject)
  }.bind(this)).then(fn.bind(null, this))
}

/**
 * Catch
 *
 * @param {Function} [fn] - callback
 */

Connection.prototype.catch = function (fn) {
  return new Promise(function (resolve) {
    this.once('error-opening', resolve)
  }.bind(this)).then(fn.bind(null))
}

/**
 * Closes the connection.
 *
 * @param {Boolean} [force] - Force close, emitting no events
 * @param {Function} [fn] - callback
 * @return {Promise}
 */

Connection.prototype.close = function (force, fn) {
  if (typeof force === 'function') {
    fn = force
    force = false
  }

  var self = this
  function close (resolve, client) {
    client.close(force, function () {
      self._state = STATE.CLOSED
      if (fn) {
        fn()
      }
      resolve()
    })
  }

  switch (this._state) {
    case STATE.CLOSED:
      if (fn) {
        fn()
      }
      return Promise.resolve()
    case STATE.OPENING:
      return new Promise(function (resolve) {
        self._queue.push(function (client) {
          close(resolve, client)
        })
      })
    case STATE.OPEN:
    default:
      return new Promise(function (resolve) {
        close(resolve, self._client)
      })
  }
}

module.exports = Connection
