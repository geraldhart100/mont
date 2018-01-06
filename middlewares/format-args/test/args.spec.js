import test from 'ava'

import update from '../lib/update'
import fields from '../lib/fields'
import query from '../lib/query'

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

test('update', t => {
  t.is(update(void 0), void 0)

  const plain = { id: 1 }
  const wrapped = { $set: plain }

  t.deepEqual(
    update(wrapped),
    wrapped
  )

  t.deepEqual(
    update(plain),
    wrapped,
    'wrap non-$'
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
