const { when, isNil, compose } = require('ramda')
const { rejectP } = require('ramda-adjunct')

const createError = require('http-errors')

const rejectHttp = compose(rejectP, createError)

const rejectNotFound = () => rejectHttp(404)
const rejectConflict = () => rejectHttp(409)
const rejectNotImplemented = () => rejectHttp(501)

const assertNotNil = when(isNil, rejectNotFound)

module.exports = {
  assertNotNil,
  rejectHttp,
  rejectNotFound,
  rejectNotImplemented
}
