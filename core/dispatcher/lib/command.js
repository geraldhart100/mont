const createError = require('http-errors')

const { when, has, dissoc } = require('ramda')
const { rejectP, isArray } = require('ramda-adjunct')

const commands = require('./commands')

const rejectHttp = code => rejectP(createError(code))

const reject501 = () => rejectHttp(501)
const reject409 = () => rejectHttp(409)

const reject = err => {
  return err.code === 11000
    ? reject409()
    : rejectHttp(err)
}

const resolve = res => {
  if (!res) return res

  const skipOid = when(has('_id'), dissoc('_id'))

  return isArray(res)
    ? res.map(skipOid)
    : skipOid(res)
}

function command (ctx) {
  const cmd = commands[ctx.method] || reject501

  return cmd(ctx.col, ctx.args)
    .then(resolve)
    .catch(reject)
}

module.exports = command
