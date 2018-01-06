import test from 'ava'

import schema from '../lib/schema'

test('identifier', async t => {
  await schema
    .validate({ id: 'a', type: 'chars' })
    .then(res => {
      t.is(res.id, 'a', 'provided id')
      t.is(res.type, 'chars', 'provided type')
    })

  const options = { context: { type: 'things' } }

  await schema
    .validate({ type: 'chars' }, options)
    .then(res => {
      t.is(res.type, 'chars', 'provided type')
    })

  await schema
    .validate({}, options)
    .then(res => {
      t.is(res.type, 'things', 'context type')
    })

  await schema
    .validate({ id: 'b', stats: 1 })
    .then(res => {
      t.is(res.id, 'b')
      t.is(res.stats, undefined, 'strip extra')
    })
})

test('refs', async t => {
  await schema
    .validate({
      refs: {
        a: { id: 'a', type: 'A', extra: 'x' }
      }
    })
    .then(res => {
      const { a } = res.refs

      t.is(a.id, 'a')
      t.is(a.type, 'A')
      t.is(a.extra, undefined, 'skip extra')
    })

  await schema
    .validate({
      refs: {
        a: { id: 'a' }
      }
    })
    .then(() => t.fail('refs id/type required'))
    .catch(err => {
      t.is(err.source.key, 'refs')
    })
})

test('errors', async t => {
  await t.throws(schema.validate({ refs: 'exo' }))
    .then(err => {
      t.is(err.status, 422, 'http ready errors')
      t.not(err.source, undefined)
    })
})

test('resource', async t => {
  await schema
    .validate({ id: 'a', type: 'chars' })
    .then(res => {
      t.is(res.id, 'a', 'provided id')
      t.is(res.type, 'chars', 'provided type')
    })

  await schema
    .validate({
      id: 'b',
      body: { b: 1 },
      meta: { b: 2 },
      stats: 2
    })
    .then(res => {
      t.is(res.id, 'b')
      t.deepEqual(res.body, { b: 1 }, 'keep body')
      t.deepEqual(res.meta, { b: 2 }, 'keep meta')
      t.is(res.stats, undefined, 'strip extra')
    })
})

test('resources array', async t => {
  await schema
    .validate([
      { id: 'a', type: 'chars' },
      { id: 'b' }
    ])
    .then(docs => {
      t.is(docs.length, 2, 'support array of resources')
    })
})
