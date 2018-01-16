const { when, has, dissoc, curry } = require('ramda')
const { isArray } = require('ramda-adjunct')

const { rejectHttp } = require('./helpers')

const exec = require('./exec')

const reject = err => {
  return err.code === 11000
    ? rejectHttp(409)
    : rejectHttp(err)
}

const resolve = res => {
  if (!res) return res

  const skipOid = when(has('_id'), dissoc('_id'))

  return isArray(res)
    ? res.map(skipOid)
    : skipOid(res)
}

function execCommand (ctx) {
  const { collection, method, args } = ctx

  return collection
    .resolveCol()
    .then(exec(method, args))
    .then(resolve)
    .catch(reject)
}

module.exports = () => execCommand
