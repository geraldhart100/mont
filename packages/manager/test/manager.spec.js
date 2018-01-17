import test from 'ava'

import Collection from 'mont-collection'

import Manager from '..'

test('collection', async t => {
  const manager = new Manager('localhost/app')

  const col = manager.get('users')

  t.true(col instanceof Collection)
})

test('middlewares', async t => {
  const fn1 = (ctx, next) => { t.pass(); next() }
  const fn2 = (ctx, next) => { t.pass(); next() }

  const manager = new Manager('localhost', { middlewares: [fn1] })

  t.plan(2)

  const col = manager
    .get('users')
    .use(fn2)

  await col.find()
})
