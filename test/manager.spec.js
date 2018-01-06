import test from 'ava'

const Monk = require('../lib')

const db = new Monk('127.0.0.1/monk')
db.addMiddleware(require('monk-middleware-debug'))

test('caching collections', (t) => {
  const a = 'cached-' + Date.now()
  const b = 'not-' + a

  t.is(db.get(a), db.get(a), 'cached')
  t.not(
    db.get(b, { cache: false }),
    db.get(b, { cache: false }),
    'not cached'
  )
})
