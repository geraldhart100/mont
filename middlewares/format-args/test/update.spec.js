import test from 'ava'

import parseUpdate from '../lib/update'

const parse = parseUpdate({ type: 'A' })

test('id', t => {
  const empty = { body: {} }
  const resEmpty = parse(empty)

  t.is(resEmpty.$set.id, undefined)
  t.not(resEmpty.$setOnInsert.id, undefined, 'ensure upsert id')

  const hasId = { id: 'b' }
  const resHasId = parse(hasId)

  t.is(resHasId.$set.id, 'b', 'use existing id')
  t.is(resHasId.$setOnInsert.id, undefined, 'use existing id')
})

test('type', t => {
  const empty = { body: {} }
  const resEmpty = parse(empty)

  t.is(resEmpty.$set.type, undefined)
  t.is(resEmpty.$setOnInsert.type, 'A', 'assign default type')

  const typed = { type: 'B' }
  const resTyped = parse(typed)

  t.is(resTyped.$set.type, undefined)
  t.is(resTyped.$setOnInsert.type, 'A')
})

test('extra', t => {
  const extra = {
    body: {},
    meta: {},
    refs: {},
    links: {},
    extra: {}
  }

  const { $set } = parse(extra)

  t.falsy($set.id, 'ensure id upsert only')
  t.falsy($set.type, 'ensure type upsert only')
  t.truthy($set.body, 'preserve body')
  t.truthy($set.meta, 'preserve meta')
  t.truthy($set.refs, 'preserve refs')
  t.truthy($set.links, 'preserve links')
  t.falsy($set.extra, 'omit extra')
})
