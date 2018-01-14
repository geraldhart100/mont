const { when, isNil, compose } = require('ramda')

const { rejectP } = require('ramda-adjunct')

const createError = require('http-errors')

const rejectHttp = compose(
  rejectP,
  createError
)

const assertNotNil = when(isNil, () => rejectHttp(404))

module.exports = {
  rejectHttp,
  assertNotNil
}
