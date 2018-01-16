import test from 'ava'

import mont from '..'

test('signature', t => {
  t.notThrows(() => mont('localhost/db'), 'init w/o `new`')
})

