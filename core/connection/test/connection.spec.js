import test from 'ava'

import { MongoDBServer } from 'mongomem'

import { EventEmitter } from 'events'

import Connection from '..'

const connect = (...args) => new Connection(...args)

test.before(MongoDBServer.start)

test.beforeEach(async t => {
  t.context.uri = await MongoDBServer.getConnectionString()
})

test('constructor', (t) => {
  const { uri } = t.context

  t.throws(connect, /no connection uri provided/gi)

  const conn = new Connection(uri)
  t.true(conn instanceof Connection)
  t.true(conn instanceof EventEmitter)
})

test('connect', async t => {
  const { uri } = t.context

  await connect(uri)
    .then(conn => {
      t.true(conn instanceof Connection, 'connect w/ Promise')
    })

  await connect('127.0.0.1:3030/xyz')
    .catch(err => {
      t.truthy(err, 'fail w/ Promise')
    })

})

test('disconnect', async t => {
  const { uri } = t.context

  const conn = connect(uri)

  await conn
    .then(() => t.is(conn._state, 'open'))
    .then(() => conn.close())
    .then(() => t.is(conn._state, 'closed'))
    .then(() => conn.close())
    .then(() => t.is(conn._state, 'closed', 'close closed'))

  const con2 = connect(uri)
  await con2.close().then(() => t.pass('close once opened'))

  const con3 = connect(uri)
  await new Promise(r => {
    con3.on('close', r)
    con3.close()
  })
})

test('executeWhenOpened', async t => {
  const { uri } = t.context
  const conn = new Connection(uri)

  return conn
    .then(() => t.is(conn._state, 'open'))
    .then(() => conn.close(true))
    .then(() => t.is(conn._state, 'closed'))
    .then(() => conn.executeWhenOpened())
    .then(() => t.is(conn._state, 'open', 'reopens'))
    .then(() => conn.close())
})
