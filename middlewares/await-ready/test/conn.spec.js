import test from 'ava'

import awaitReady from '..'

test(async t => {
  const mw = awaitReady()

  const col = x => {
    return Promise.resolve({ x })
  }

  // mock mongodb

  const db = {
    collection (name) {
      return Promise.resolve({ name })
    }
  }

  // mock monk

  const monkInstance = {
    executeWhenOpened () {
      return Promise.resolve(db)
    }
  }

  const ctx = {
    monkInstance,
    collection: {
      name: 'y'
    },
    args: {}
  }

  const next = err => {
    t.falsy(err, 'no error')
    t.is(ctx.args.col.name, 'y')
  }

  await mw(ctx, next)
})
