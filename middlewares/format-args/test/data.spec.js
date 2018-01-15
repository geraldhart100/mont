import test from 'ava'

import castBody from '../lib/cast-data'

const cast = castBody({ type: 'A' })

test('id', t => {
  const empty = {}
  const hasId = { id: 'b' }

  const resEmpty = cast(empty)
  const resHasId = cast(hasId)

  t.not(resEmpty.id, undefined, 'generate id if nil')
  t.is(resHasId.id, 'b', 'use existing id')
})

test('type', t => {
  const empty = {}
  const typed = { type: 'B' }

  const resEmpty = cast(empty)
  const resTyped = cast(typed)

  t.is(resEmpty.type, 'A', 'assign default type')
  t.is(resTyped.type, 'A', 'force default type')
})

test('extra', t => {
  const extra = {
    body: {},
    meta: {},
    refs: {},
    links: {},
    extra: {}
  }

  const resExtra = cast(extra)

  t.truthy(resExtra.id, 'ensure id')
  t.truthy(resExtra.type, 'ensure typ')
  t.truthy(resExtra.body, 'preserve body')
  t.truthy(resExtra.meta, 'preserve meta')
  t.truthy(resExtra.refs, 'preserve refs')
  t.truthy(resExtra.links, 'preserve links')
  t.falsy(resExtra.extra, 'omit extra')
})

test('multi', t => {
  const multi = [{}, {}]

  const resMulti = cast(multi)

  t.is(resMulti.length, 2, 'cast lists')

  resMulti.forEach(res => t.truthy(res.id, 'format each'))
})
