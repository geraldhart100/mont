import test from 'ava'

import mongodb from 'mongodb'

import { MongoDBServer } from 'mongomem'

import Connection from 'mont-connection'
import Collection from 'mont-collection'

import Manager from '..'

test.before(MongoDBServer.start)

test.beforeEach(async t => {
  t.context.uri = await MongoDBServer.getConnectionString()
})

test('constructor', async t => {
  const { uri } = t.context
  const manager = new Manager(uri)

  t.true(manager instanceof Connection)
})

test('collection', async t => {
  const { uri } = t.context
  const manager = new Manager(uri)

  const col = manager.get('users')

  t.true(col instanceof Collection)
})
