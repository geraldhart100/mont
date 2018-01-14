const { evolve } = require('yiwn/full')

const options = require('./options')
const query = require('./query')
const update = require('./update')
const fields = require('./fields')

const format = evolve({
  options,
  update,
  fields,
  query
})

function formatArgs (ctx, next) {
  ctx.args = format(ctx.args)
  return next()
}

module.exports = () => formatArgs
