const { when, has, dissoc } = require('ramda')
const { isArray } = require('ramda-adjunct')

const { rejectHttp } = require('./helpers')

const commands = require('./commands')

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
  const cmd = commands[ctx.method]

  if (!cmd) return rejectHttp(501)

  return cmd(ctx.col, ctx.args)
    .then(resolve)
    .catch(reject)
}

module.exports = () => execCommand
