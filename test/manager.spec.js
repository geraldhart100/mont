import test from 'ava'

import { MongoDBServer } from 'mongomem'

import Mont from '..'

test.before(MongoDBServer.start)

test.beforeEach(async t => {
  const url = await MongoDBServer.getConnectionString()

  const db = new Mont(url)

  t.context = { db }
})

test('caching collections', (t) => {
  const { db } = t.context

  const a = 'cached-' + Date.now()
  const b = 'not-' + a

  t.is(db.get(a), db.get(a), 'cached')
})
