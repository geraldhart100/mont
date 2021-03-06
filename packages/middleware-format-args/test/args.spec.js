import test from 'ava'

import options from '../lib/cast-options'
import update from '../lib/cast-update'
import fields from '../lib/cast-fields'
import query from '../lib/cast-query'

test('options', t => {
  t.deepEqual(
    options(void 0),
    {}
  )

  const str = 'a -b'
  const arr = ['a', '-b']

  t.deepEqual(
    options(str),
    {
      fields: {
        a: 1,
        b: 0
      }
    },
    'str fields'
  )

  t.deepEqual(
    options(arr),
    {
      fields: {
        a: 1,
        b: 0
      }
    },
    'arr fields'
  )

  t.deepEqual(
    options({ sort: str }),
    {
      sort: {
        a: 1,
        b: -1
      }
    },
    'minus -1 for sort'
  )
})

test('fields', t => {
  t.is(fields(void 0), void 0)

  const str = 'a b c'
  const arr = ['a', 'b', 'c']
  const obj = { a: 1, b: 1, c: 1 }

  t.deepEqual(
    fields(str),
    obj
  )

  t.deepEqual(
    fields(arr),
    obj
  )
})

test('query', t => {
  t.is(
    query(void 0),
    void 0
  )

  t.deepEqual(
    query('xxx'),
    { id: 'xxx' }
  )

  const refs = {
    hopar: {
      id: 'zxc',
      type: 'hopar',
      meta: 'hoparner'
    }
  }

  t.deepEqual(
    query({ id: 'xxx', refs }),
    {
      id: 'xxx',
      'refs.hopar': { id: 'zxc', type: 'hopar' }
    }
  )
})
