import test from 'ava'

import schema from '../lib/schema'

test('identifier', async t => {
  const x1 = schema
    .validate({ id: 'a', type: 'chars' })
    .right()

  t.is(x1.id, 'a', 'provided id')
  t.is(x1.type, 'chars', 'provided type')

  const options = { context: { type: 'things' } }

  const x2 = schema
    .validate({ }, options)
    .right()

  t.is(typeof x2.id, 'string', 'generate id')
  t.is(x2.type, 'entities', 'default type')

  const x3 = schema
    .validate({ id: 'b', stats: 1 })
    .right()

  t.is(x3.id, 'b')
  t.is(x3.stats, undefined, 'strip extra')
})

test('refs', async t => {
  const r1 = schema
    .validate({
      refs: {
        a: { id: 'a', type: 'A', extra: 'x' }
      }
    })
    .right()

  t.is(r1.refs.a.id, 'a')
  t.is(r1.refs.a.type, 'A')
  t.is(r1.refs.a.extra, undefined, 'skip extra')

  // errors

  const res2 = schema
    .validate({
      refs: {
        a: { id: 'a' }
      }
    })

  t.true(res2.isLeft(), 'require both type/id')

  const res3 = schema
    .validate({ refs: 'exo' })

  t.true(res3.isLeft(), '`refs` should be object')
})


test('resource', async t => {
  const res1 = schema
    .validate({ id: 'a', type: 'chars' })
    .right()

  t.is(res1.id, 'a', 'provided id')
  t.is(res1.type, 'chars', 'provided type')

  const res2 = schema
    .validate({
      id: 'b',
      body: { b: 1 },
      meta: { b: 2 },
      links: { self: '/' },
      stats: 2
    })
    .right()

  t.is(res2.id, 'b')
  t.deepEqual(res2.body, { b: 1 }, 'keep body')
  t.deepEqual(res2.meta, { b: 2 }, 'keep meta')
  t.deepEqual(res2.links, { self: '/' }, 'keep links')
  t.is(res2.stats, undefined, 'strip extra')
})

test.failing('resources array', async t => {
  const res = schema
    .validate([
      { id: 'a', type: 'chars' },
      { id: 'b' }
    ])
    .right()

  console.log(res)

  t.is(res.length, 2, 'support array of resources')
})
