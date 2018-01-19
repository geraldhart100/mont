const R = require('ramda')
const RA = require('ramda-adjunct')
const WN = require('yiwn')

const createError = require('http-errors')

/**
 * Helpers
 */

const rejectHttp = R.compose(RA.rejectP, createError)

const rejectNotFound = () => rejectHttp(404)
const leftConflict = () => rejectHttp(409)
const leftNotImplemented = () => rejectHttp(501)

const assertNotNil = R.when(R.isNil, rejectNotFound)

const skipOid = R.dissoc('_id')

/**
 * Commands
 */

function deleteOne (args, col) {
  const { query, options } = args
  return col.deleteOne(query, options)
}

function deleteMany (args, col) {
  const { query, options } = args
  return col.deleteMany(query, options)
}

function drop (args, col) {
  return col.drop()
}

function insertOne (args, col) {
  const { data, options } = args

  return col
    .insertOne(data, options)
    .then(R.prop('ops'))
    .then(R.head)
    .then(skipOid)
}

function insertMany (args, col) {
  const { data, options } = args

  return col
    .insertMany(data, options)
    .then(R.prop('ops'))
    .then(R.map(skipOid))
}

function find (args, col) {
  const { query, options } = args

  // pick identifier
  options.fields = {
    _id: 0,
    id: 1,
    type: 1
  }

  const find = () => col
    .find(query, options)
    .toArray()

  const resolve = (members) => {
    return {
      members
    }
  }

  return WN.allP([
      find()
    ])
    .then(R.apply(resolve))
}

function findOne (args, col) {
  const { query, options } = args

  return col
    .findOne(query, options)
    .then(assertNotNil)
    .then(skipOid)
}

function findOneAndUpdate (args, col) {
  const { query, update, options } = args

  return col
    .findOneAndUpdate(query, update, options)
    .then(R.prop('value'))
    .then(assertNotNil)
    .then(skipOid)
}

function findOneAndDelete (args, col) {
  const { query, options } = args

  return col
    .findOneAndDelete(query, options)
    .then(R.prop('value'))
    .then(assertNotNil)
    .then(skipOid)
}

function updateOne (args, col) {
  const { query, update, options } = args

  return col
    .updateOne(query, update, options)
    .then(R.prop('result'))
}

function updateMany (args, col) {
  const { query, update, options } = args

  return col
    .updateMany(query, update, options)
}

module.exports = {
  deleteOne,
  deleteMany,
  drop,
  insertOne,
  insertMany,
  find,
  findOne,
  findOneAndUpdate,
  findOneAndDelete,
  updateOne,
  updateMany
}
