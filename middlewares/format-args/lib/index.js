const { evolve } = require('yiwn/full')

const query = require('./query')
const update = require('./update')
const fields = require('./fields')

const format = evolve({
  update,
  fields,
  query
})

module.exports = function () {
  return function formatArgs (ctx, next) {
    ctx.args = format(ctx.args)
    return next(null, ctx)
  }
}
