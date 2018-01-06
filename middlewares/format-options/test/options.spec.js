import test from 'ava'

import formatOptions from '../lib/options'

test('Defaults', t => {
  const ctx = {
    collection: {
      options: { a: 1, b: 1 }
    },
    args: {
      options: { b: 2, c: 3 }
    }
  }

  t.deepEqual(
    formatOptions(ctx).args.options,
    { a: 1, b: 2, c: 3 }
  )

  t.deepEqual(
    formatOptions({ args: ctx.args }).args.options,
    { b: 2, c: 3 }
  )

  t.deepEqual(
    formatOptions({ collection: ctx.collection }).args.options,
    { a: 1, b: 1 }
  )

  t.deepEqual(formatOptions({}).args.options, {})
})

test('Fields', t => {
  const ctx = {
    args: {
      options: 'a -b'
    }
  }

  t.deepEqual(
    formatOptions(ctx).args.options,
    { fields: { a: 1, b: 0 } }
  )
})
