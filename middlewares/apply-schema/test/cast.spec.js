import test from 'ava'

import cast from '../lib/cast'

import generate from '../lib/schema-from-type'

const schema = generate('users')

test('data obj', t => {
  const args = {
    data: {
      body: {
        name: 'Exo'
      },
      extra: 1
    },
    extra: 2
  }

  cast(schema, args)
    .cata(
      e => t.fail(e),
      x => {
        t.not(x.data.id, undefined, 'ensure id')
        t.is(x.data.type, 'users', 'ensure type')

        t.is(x.data.extra, undefined, 'strip extra')
        t.is(x.extra, 2, 'allow extra on root data')
      }
    )
})

test('data arr', t => {
  const args = {
    data: [
      {
        body: {
          name: 'Exo'
        }
      }, {
        body: {
          name: 'Hopar'
        }
      }
    ]
  }

  cast(schema, args)
    .cata(
      e => t.fail(e),
      x => {
        t.is(x.data.length, 2)

        x.data.forEach(b => {
          t.not(b.id, undefined, 'ensure id')
          t.is(b.type, 'users', 'ensure type')
        })
      }
    )
})

test('update', t => {
  const args = {
    update: {
      $set: {
        body: {
          name: 'Exo'
        }
      }
    }
  }

  cast(schema, args)
    .cata(
      e => t.fail(e),
      x => {
        const { $set, $setOnInsert } = x.update

        t.is($set.id, undefined, 'not id')
        t.is($set.type, 'users', 'ensure type')

        t.not($setOnInsert.id, undefined, 'ensure id on upsert')
      }
    )
})
