import test from 'ava'

import Dispatcher from '../lib/dispatcher'

test('middleware', t => {
  const $d = new Dispatcher()

  t.is($d.middlewares.length, 0, 'init with empty middleware list')

  t.throws(() => $d.use('x'), /must be a function/gi, 'assert function')

  const f1 = (ctx, next) => next()
  const f2 = (ctx, next) => next()

  $d.use(f1)
    .use(f2)

  t.is($d.middlewares.length, 2, 'append')

  t.deepEqual($d.middlewares, [f1, f2])
})
