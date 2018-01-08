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

test('options > should allow defaults', async t => {
  const { db } = t.context

  const col = db.get('optsss')

  await col
    .insert([
      { f: true },
      { f: true },
      { g: true },
      { g: true }
    ])

  await col
    .update({}, { $set: { f: 'g' } })

  col.options.safe = false
  col.options.multi = false

  await col
    .update({}, { $set: { g: 'h' } })
    .then(({ n }) => {
      t.true(n && n <= 1)
    })

  col.options.safe = true
  col.options.multi = true

  await col
    .update({}, { $set: { g: 'i' } }, { safe: false, multi: false })
    .then(({n}) => {
      t.true(n && n <= 1)
    })
})
