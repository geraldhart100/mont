import test from 'ava'

import caster from '..'

const cast = caster()

const collection = {
  type: 'users'
}

test('data', async t => {
  const data = {
    body: {
      name: 'Exo'
    }
  }

  const ctx = {
    collection,
    args: {
      data
    }
  }

  const next = err => {
    t.falsy(err)
  }

  await cast(ctx, next)

  t.not(ctx.args.data.id, undefined, 'ensure id')
  t.is(ctx.args.data.type, 'users', 'fix type')
})
