import test from 'ava'

const Monk = require('../lib')

const db = new Monk('127.0.0.1/monk')
db.addMiddleware(require('monk-middleware-debug'))

test.beforeEach(async t => {
  const col = db.get('test-col-' + Date.now(), { type: 'users' })
  t.context = { col }
})

test.afterEach.always(async t => {
  const { col } = t.context
  return col.drop()
})

test('ensure indexes', async t => {
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

  const col = db.get('index-' + Date.now(), options)

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
  const { col } = t.context

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
