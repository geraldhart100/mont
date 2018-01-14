const { when, isNil, compose } = require('ramda')

const { rejectP } = require('ramda-adjunct')

const createError = require('http-errors')

const rejectHttp = compose(
  rejectP,
  createError
)

const rejectHttp404 = () => rejectHttp(404)

const assertNotNil = when(isNil, rejectHttp404)

module.exports = {
  assertNotNil
}
