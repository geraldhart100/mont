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

  const next = (err, ctx) => {
    t.not(ctx.args.data.id, undefined, 'ensure id')
    t.pass()
  }


  await cast(ctx, next)
})
