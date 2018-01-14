import test from 'ava'

import mongodb from 'mongodb'

import { MongoDBServer } from 'mongomem'

import Manager from '..'

test.before(MongoDBServer.start)

test.beforeEach(async t => {
  t.context.uri = await MongoDBServer.getConnectionString()
})

test('collection', async t => {
  const { uri } = t.context
  const manager = new Manager(uri)

  const col = manager.get('users')

  t.truthy(col)
})
