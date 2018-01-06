const FN = require('yiwn/full')

const {
  evolve
} = FN

const query = require('./query')
const update = require('./update')
const fields = require('./fields')

module.exports = function () {
  const format = evolve({
    update,
    fields,
    query
  })

  return (ctx, next) => {
    ctx.args = format(ctx.args)

    return next(null, ctx)
  }
}
