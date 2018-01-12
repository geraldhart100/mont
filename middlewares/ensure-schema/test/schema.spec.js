import test from 'ava'

import { validate } from '../lib/schema'

const validateEntity = validate('entity')

test('identifier', async t => {
  validateEntity({
    id: 'a',
    type: 'entities'
  })
  .cata(
    e => t.fail(e),
    x => {
      t.is(x.id, 'a', 'provided id')
      t.is(x.type, 'entities', 'provided type')
    }
  )

  validateEntity({
    extra: 1
  })
  .cata(
    e => t.fail(e),
    x => {
      t.is(typeof x.id, 'string', 'generate id')
      t.is(x.type, 'entities', 'default type')

      t.is(x.extra, undefined, 'strip extra')
    }
  )
})

test('refs', async t => {
  validateEntity({
    refs: {
      a: { id: 'a', type: 'A', extra: 'x' }
    }
  })
  .cata(
    e => t.fail(),
    x => {
      const { a } = x.refs

      t.is(a.id, 'a')
      t.is(a.type, 'A')
      t.is(a.extra, undefined, 'skip extra')
    }
  )


  // errors

  validateEntity({
    refs: {
      a: { id: 'a' }
    }
  })
  .cata(
    e => t.pass(),
    x => t.fail('require both id, type')
  )

  validateEntity({ refs: 'exo' })
    .cata(
      e => t.pass(),
      x => t.fail('refs should be obj')
    )
})


test('resource', async t => {
  validateEntity({
    id: 'a',
    type: 'entities'
  })
  .cata(
    t.fail,
    x => {
      t.is(x.id, 'a', 'provided id')
      t.is(x.type, 'entities', 'provided type')
    }
  )

  validateEntity({
    id: 'b',
    body: { b: 1 },
    meta: { b: 2 },
    links: { self: '/' },
    stats: 2
  })
  .cata(
    t.fail,
    x => {
      t.is(x.id, 'b')

      t.deepEqual(x.body, { b: 1 }, 'keep body')
      t.deepEqual(x.meta, { b: 2 }, 'keep meta')
      t.deepEqual(x.links, { self: '/' }, 'keep links')

      t.is(x.stats, undefined, 'strip extra')
    }
  )
})

test('resources array', async t => {
  const schema = {
    type: 'array',
    items: {
      $ref: 'entity'
    }
  }

  validate(schema, [
    { id: 'a', type: 'entities' },
    { id: 'b' },
    {
      type: 'entities',
      meta: { x: 1 },
      extra: 3
    }
  ])
  .cata(
    t.fail,
    x => {
      t.is(x.length, 3, 'support array of resources')

      const l = x[2]

      t.not(l.id, undefined)
      t.not(l.meta, undefined)
      t.is(l.extra, undefined)
    }
  )
})
