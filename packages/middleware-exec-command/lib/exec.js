const { curry, unless } = require('ramda')
const { isFunction } = require('ramda-adjunct')

const { rejectNotImplemented } = require('./helpers')

const commands = require('./commands')

const ensafe = unless(isFunction, () => rejectNotImplemented)

const exec = (key, args, ctx) => {
  const fn = ensafe(commands[key])
  return fn(ctx, args)
}

module.exports = curry(exec)
