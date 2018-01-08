import test from 'ava'

import { MongoDBServer } from 'mongomem'

import debugMiddleware from 'monk-middleware-debug'

import Mont from '..'

test.before(MongoDBServer.start)

test.beforeEach(async t => {
  const url = await MongoDBServer.getConnectionString()

  const db = new Mont(url)
  db.addMiddleware(debugMiddleware)

  t.context = { db }
})

test('caching collections', (t) => {
  const { db } = t.context

  const a = 'cached-' + Date.now()
  const b = 'not-' + a

  t.is(db.get(a), db.get(a), 'cached')

  t.not(
    db.get(b, { cache: false }),
    db.get(b, { cache: false }),
    'not cached'
  )
})
