import test from 'ava'

import { MongoDBServer } from 'mongomem'

import debugMiddleware from 'monk-middleware-debug'

import Mont from '..'

test.before(MongoDBServer.start)

test.beforeEach(async t => {
  const url = await MongoDBServer.getConnectionString()

  const db = new Mont(url)
  db.addMiddleware(debugMiddleware)

  const col = db.get('persons', { type: 'users' })

  t.context = { db, col }
})

test('insert', async t => {
  const { col } = t.context

  await col
    .insert({ body: 'a' })
    .then(doc => {
      t.is(doc._id, undefined, 'skip _id')

      t.is(typeof doc.id, 'string', 'ensure id')
      t.is(doc.type, 'users', 'use default type')
    })

  await col
    .insert({ id: 'b', body: 'b' })
    .then(doc => {
      t.is(doc._id, undefined, 'skip _id')
      t.is(doc.id, 'b', 'use provided id')
    })

  await col
    .insert([{ body: 'c' }, { body: 'd' }])
    .then(docs => {
      t.true(Array.isArray(docs), 'res arr if inserted arr')
      t.is(docs.length, 2)
      docs.forEach(res => {
        t.is(typeof res.id, 'string', 'multi-cast w/ id')
        t.is(typeof res.type, 'string', 'multi-cast w/ type')
        t.is(typeof res.body, 'string', 'multi-cast w/ body')
      })
    })

  await col
    .insert([])
    .then(docs => {
      t.true(Array.isArray(docs), 'not throw on empty arr')
      t.is(docs.length, 0)
    })
})

test('findOne', async t => {
  const { col } = t.context

  const doc = await col.insert({ body: 'a' })

  const resNotFound = col.findOne({ nonExistingField: true })
  await t.throws(resNotFound, /not found/gi, 'throws on null')

  await col
    .findOne()
    .then(() => t.pass('findOne(undefined) works'))

  await col
    .findOne(doc.id)
    .then(() => t.pass('findOne(id) works'))

  await col
    .findOne(doc.id)
    .then(res => {
      t.is(res._id, undefined, 'skip _id')
      t.is(res.type, 'users', 'get type')
    })

  await col
    .findOne(doc.id, 'body')
    .then(res => {
      t.is(res.body, 'a', 'provide selected fields')
      t.is(res.id, undefined, 'skip not-selected fields')
      t.is(res.type, undefined, 'skip not-selected fields')
    })
})

test('find', async t => {
  const { col } = t.context

  await col
    .insert({ body: 'a' })

  await col
    .find()
    .then(docs => {
      docs.forEach(doc => {
        t.is(doc._id, undefined, 'skip _id')
      })
    })

  //

  await col
    .insert([
      { meta: { a: 1 } },
      { meta: { a: 2 } }
    ])

  await col
    .find({ 'meta.a': 1 })
    .then(docs => {
      t.is(docs.length, 1, 'with nested query')
      t.is(docs[0].meta.a, 1)
    })

  // nested array

  await col
    .insert([
      { body: [{ a: 1 }] },
      { body: [{ a: 2 }] }
    ])

  await col
    .find({ 'body.a': 1 })
    .then(docs => {
      t.is(docs.length, 1, 'with nested array query')
      t.is(docs[0].body[0].a, 1)
    })

  //

  await col
    .insert([
      { meta: 'sort', body: { a: 1, b: 2 } },
      { meta: 'sort', body: { a: 1, b: 1 } }
    ])

  await col
    .find({ meta: 'sort' }, { sort: '-body.a body.b' })
    .then(docs => {
      t.is(docs[0].body.b, 1, 'should sort')
      t.is(docs[1].body.b, 2, 'should sort')
    })

  //

  const refs = {
    a: { id: 'a', type: 'a' },
    b: { id: 'b', type: 'b' }
  }

  await col
    .insert([
      { meta: 'findByRefs', refs },
      { meta: 'findByRefs', refs: { a: refs.a } },
    ])

  await col
    .find({
      meta: 'findByRefs',
      refs: {
        a: {
          id: 'a',
          type: 'a',
          meta: 'a'
        }
      }
    })
    .then(docs => {
      t.is(docs.length, 2, 'find by refs')
    })
})

test('count', async t => {
  const { col } = t.context

  await col
    .count({ meta: 'count' })
    .then(count => t.is(count, 0), 'should count')

  await col
    .insert([
      { meta: 'count' },
      { meta: 'count' },
      { meta: 'count' },
      { meta: 'count' }
    ])

  await col
    .count({ meta: 'count' })
    .then(count => t.is(count, 4, 'should count'))

  await col
    .count({ meta: 'count' }, { limit: 2 })
    .then(count => t.is(count, 2, 'not ignore options'))
})

test('update', async t => {
  const { col } = t.context

  const doc = await col.insert({ body: 'a' })

  await col
    .update({ id: doc.id }, { $set: { body: 'b' } })
    .then(() => col.findOne(doc.id))
    .then(res => {
      t.is(res.body, 'b')
    })

  await col
    .update({ id: doc.id }, { body: 'c' })
    .then(() => col.findOne(doc.id))
    .then(res => {
      t.is(res.body, 'c', 'wrap non $')
    })

  await col
    .update(doc.id, { body: 'd' })
    .then(() => col.findOne(doc.id))
    .then(res => {
      t.is(res.body, 'd', 'update with id')
    })

  await col
    .update(doc.id, { body: 0 })
    .then(() => col.findOne(doc.id))
    .then(res => {
      t.is(res.body, 0, 'with 0')
    })

})

test('remove', async t => {
  const { col } = t.context

  await col
    .insert([
      { meta: 'remove' },
      { meta: 'remove' }
    ])

  await col
    .remove({ meta: 'remove' })

  await col
    .count({ meta: 'remove' })
    .then(count => t.is(count, 0, 'remove all'))
})

test('findOneAndUpdate', async t => {
  const { col } = t.context

  const doc = await col.insert({ body: 'a' })

  await col
    .findOneAndUpdate({ body: 'a' }, { body: 'b', extra: 'c' })
    .then(res => {
      t.is(typeof res.id, 'string', 'should return id')
      t.is(res.body, 'b', 'should return updated')
      t.is(res.extra, undefined, 'should skip unknown by casting')
    })

  const xNil = col.findOneAndUpdate({ body: 'x' }, { body: 'b' })
  await t.throws(xNil, /not found/gi, 'throws on nil')

})

test('findOneAndUpdate (upsert)', async t => {
  const { col } = t.context

  // Upsert

  await col
    .findOneAndUpdate({ body: 'x' }, { body: 'y' }, { upsert: true })
    .then(res => {
      t.is(typeof res.id, 'string')
      t.is(res.body, 'y')
    })
})

test('findOneAndDelete', async t => {
  const { col } = t.context

  await col
    .insert([
      { meta: 'findOneAndDelete' },
      { meta: 'findOneAndDelete' }
    ])

  await col
    .findOneAndDelete({ meta: 'findOneAndDelete' })
    .then(doc => {
      t.is(doc._id, undefined, 'skip _id')
      t.is(doc.meta, 'findOneAndDelete', 'proper doc')
    })

  await col
    .count({ meta: 'findOneAndDelete' })
    .then(count => t.is(count, 1, 'delete only one'))

  //

  await col
    .findOneAndDelete({ extra: true })
    .then(() => t.fail('throw if found nothing'))
    .catch(err => t.is(err.status, 404, 'throw 404'))
})

test('aggregate', async t => {
  const { col } = t.context

  await t.throws(col.aggregate(), Error, 'should fail properly')

  await col.insert([
    { id: 'a', body: 1 },
    { id: 'b', body: 2 }
  ])

  await col
    .aggregate([{$group: {_id: null, max: { $max: '$body' }}}])
    .then(res => {
      t.true(Array.isArray(res))
      t.is(res.length, 1)
    })

  await col
    .aggregate([{$group: {_id: null, max: { $max: '$body' }}}], { explain: true })
    .then((res) => {
      t.true(Array.isArray(res))
      t.is(res.length, 1)
    })
})

test('group', async (t) => {
  const { col } = t.context

  await col
    .insert([
      { meta: 'a' },
      { meta: 'a' }
    ])

  await col
    .group(
      { meta: 'a' },
      {},
      { count: 0 },
      function (obj, prev) {
        return prev.count++
      }
    )
    .then(([group1, group2]) => {
      t.is(group1.meta, 'a')
      t.is(group1.count, 2)
    })
})

test('distinct', async t => {
  const { col } = t.context

  await col
    .insert([
      { meta: 'a', body: 'x' },
      { meta: 'b' },
      { meta: 'c', body: 'x' },
      { meta: 'c' }
    ])

  await col
    .distinct('meta')
    .then(docs => {
      t.deepEqual(docs, ['a', 'b', 'c'])
    })

  await col
    .distinct('meta', { body: 'x' })
    .then(docs => {
      t.deepEqual(docs, ['a', 'c'], 'ok with query')
    })
})

test('mapReduce', async t => {
  const { col } = t.context

  // Map function
  const map = function () { emit(this.meta, 1) } // eslint-disable-line
  // Reduce function
  const reduce = function (k, vals) { return 1 }

  await col
    .insert([
      { meta: 1 },
      { meta: 2 }
    ])

  await col
    .mapReduce(map, reduce, {out: {replace: 'tempCollection'}})
    .then((collection) => collection.findOne({'_id': 1}))
    .then(r => {
      t.is(r.value, 1)
    })
})

test.failing('geoHaystackSearch', async t => {
  const { col } = t.context

  await col
    .createIndex({ body: 'geoHaystack', type: 1 }, {bucketSize: 1})

  await col
    .insert([
      { meta: 1, body: [50, 30] },
      { meta: 1, body: [30, 50] }
    ])

  const options = {
    search: { meta: 1 },
    limit: 1,
    maxDistance: 100
  }

  await col
    .geoHaystackSearch(50, 50, options)
    .then(r => {
      t.is(r.length, 1)
    })
})

test('geoNear', async t => {
  const { col } = t.context

  await col
    .ensureIndex({ body: '2d' })

  await col
    .insert([
      { meta: 'a', body: [50, 30] },
      { meta: 'a', body: [30, 50] }
    ])

  const options = {
    query: { meta: 'a' },
    num: 1
  }

  await col
    .geoNear(50, 50, options)
    .then(r => {
      t.is(r.length, 1)
    })
})

test('createIndex', async t => {
  const { col } = t.context

  await col
    .createIndex('name.first')
    .then(col.indexes)
    .then(indexes => {
      const index = indexes['name.first_1']
      t.not(index, undefined, 'accept a field string')
    })

  await col
    .createIndex({ location: '2dsphere' })
    .then(col.indexes)
    .then(indexes => {
      const index = indexes.location_2dsphere
      t.not(index, undefined, 'object argument')
    })

  await col
    .createIndex('name last')
    .then(col.indexes)
    .then(indexes => {
      const index = indexes.name_1_last_1
      t.not(index, undefined, 'space delimited compound')
    })

  await col
    .createIndex(['nombre', 'apellido'])
    .then(col.indexes)
    .then(indexes => {
      const index = indexes.nombre_1_apellido_1
      t.not(index, undefined, 'array compound indexes')
    })

  await col
    .createIndex({ up: 1, down: -1 })
    .then(col.indexes)
    .then(indexes => {
      const index = indexes['up_1_down_-1']
      t.not(index, undefined, 'object compound indexes')
    })

  await col
    .createIndex({ woot: 1 }, { unique: true })
    .then(col.indexes)
    .then(indexes => {
      const index = indexes.woot_1
      t.not(index, undefined, 'accept options')
    })
})

test('index', async t => {
  const { col } = t.context

  await col
    .index('name.first')
    .then(col.indexes)
    .then(indexes => {
      const index = indexes['name.first_1']
      t.not(index, undefined, 'accept a field string')
    })
})

test('dropIndex', async t => {
  const { col } = t.context

  await col
    .index('name2.first')
    .then(col.indexes)
    .then(indexes => t.truthy(indexes['name2.first_1']))

  await col
    .dropIndex('name2.first')
    .then(col.indexes)
    .then(indexes => {
      t.is(indexes['name2.first_1'], undefined, 'field string')
    })

  //

  await col
    .index('name2 last')
    .then(col.indexes)
    .then(indexes => t.truthy(indexes.name2_1_last_1))

  await col
    .dropIndex('name2 last')
    .then(col.indexes)
    .then(indexes => {
      t.is(indexes.name2_1_last_1, undefined, 'space delimited compound')
    })

  await col
    .index(['nom2', 'ape2'])
    .then(col.indexes)
    .then(indexes => t.truthy(indexes.nom2_1_ape2_1))

  await col
    .dropIndex(['nom2', 'ape2'])
    .then(col.indexes)
    .then(indexes => {
      t.is(indexes.nom2_1_ape2_1, undefined, 'array compound')
    })

  await col
    .index({ up2: 1, down: -1 })
    .then(col.indexes)
    .then(indexes => t.truthy(indexes['up2_1_down_-1']))

  await col
    .dropIndex({ up2: 1, down: -1 })
    .then(col.indexes)
    .then(indexes => {
      t.is(indexes['up2_1_down_'], undefined, 'object compound')
    })
})

test('dropIndexes', async t => {
  const { col } = t.context

  await col
    .index({ up2: 1, down: -1 })
    .then(col.indexes)
    .then(indexes => t.truthy(indexes['up2_1_down_-1']))

  await col
    .dropIndexes()
    .then(col.indexes)
    .then(indexes => {
      t.is(indexes['up2_1_down_'], undefined, 'drop all')
    })
})

test('drop', async t => {
  const { db } = t.context

  await db
    .get('dropDB-' + Date.now())
    .drop()
    .then(() => t.pass())
    .catch(() => t.fail('should not throw when dropping empty'))
})

test('stats', async t => {
  const { col } = t.context

  await col.insert({ body: 'a' })

  await col
    .stats()
    .then(res => {
      t.truthy(res)
    })
})

test('bulkWrite', async t => {
  const { col } = t.context

  const b = [
    { insertOne: { document: { bulkWrite: 1 } } }
  ]

  await col
    .bulkWrite(b)
    .then(res => {
      t.is(res.nInserted, 1)
    })
})
