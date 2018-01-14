import test from 'ava'

import { MongoDBServer } from 'mongomem'

import Connection from 'mont-connection'

import Collection from '..'

import middlewares from '../../../lib/middlewares'

test.before(MongoDBServer.start)

test.beforeEach(async t => {
  const url = await MongoDBServer.getConnectionString()

  const conn = new Connection(url)

  const options = {
    type: 'users',
    middlewares
  }

  const col = new Collection(conn, 'persons', options)

  t.context = { col }
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
    .find({ meta: 'findOneAndDelete' })
    .then(docs => t.is(docs.length, 1, 'delete only one'))

  //

  await col
    .findOneAndDelete({ extra: true })
    .then(() => t.fail('throw if found nothing'))
    .catch(err => t.is(err.status, 404, 'throw 404'))
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
    .find({ meta: 'remove' })
    .then(docs => t.is(docs.length, 0, 'remove all'))
})

test('drop', async t => {
  const { col, db } = t.context

  await col.insert({ body: 'a' })

  await t.notThrows(col.drop())
  await t.throws(col.drop())
})
