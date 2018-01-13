const { rejectP } = require('ramda-adjunct')

const commands = require('./commands')

const rejectP501 = () => rejectP({ code: 501 })

function command (ctx) {
  const cmd = commands[ctx.method] || rejectP501

  return cmd(ctx.col, ctx.args)
}

module.exports = command
