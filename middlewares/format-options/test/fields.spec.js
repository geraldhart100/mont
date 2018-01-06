import test from 'ava'

import formatFields from '../lib/fields'

test('Array', t => {

  t.deepEqual(
    formatFields(0, ['a', '-b']),
    { a: 1, b: 0 }
  )

  t.deepEqual(
    formatFields(-1, ['a', '-b']),
    { a: 1, b: -1 }
  )
})

test('String', t => {
  t.deepEqual(
    formatFields(0, 'a -b'),
    { a: 1, b: 0 }
  )
})
