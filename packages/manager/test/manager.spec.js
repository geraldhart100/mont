import test from 'ava'

import Collection from 'mont-collection'

import Manager from '..'

test('collection', async t => {
  const manager = new Manager('localhost/app')

  const col = manager.get('users')

  t.true(col instanceof Collection)
})
