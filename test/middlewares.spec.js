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

test('ensure indexes', async t => {
  const { db } = t.context

  const options = {
    indexes: [
      {
        key: {
          id: 1,
          type: 1
        },
        unique: true
      }
    ]
  }

  const col = db.get('indexxx', options)

  await col
    .indexes()
    .then(indexes => {
      const index = indexes.id_1_type_1
      t.not(index, undefined, 'accept indexes array')
    })

  await col
    .dropIndexes()
    .then(col.indexes)
    .then(indexes => {
      const index = indexes.id_1_type_1
      t.is(index, undefined, 'runs once on init')
    })

  const col2 = db.get('index-' + Date.now())

  await col
    .insert({})
    .then(res => {
      t.pass('works fine with no indexes')
    })
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
