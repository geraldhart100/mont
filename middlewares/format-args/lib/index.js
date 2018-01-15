const { evolve } = require('yiwn/full')

const options = require('./options')
const query = require('./query')
const update = require('./update')
const fields = require('./fields')

const formatData = require('./data')

const format = evolve({
  options,
  update,
  fields,
  query
})

function formatArgs (ctx, next) {
  ctx.args = format(ctx.args)

  const { type } = ctx.collection

  ctx.args.data = formatData({ type }, ctx.args.data)

  return next()
}

module.exports = () => formatArgs
