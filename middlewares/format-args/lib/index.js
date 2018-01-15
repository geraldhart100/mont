const { rejectNil } = require('yiwn/full')

const options = require('./options')
const query = require('./query')
const update = require('./update')
const fields = require('./fields')

const formatData = require('./data')

function formatArgs (ctx, next) {
  const { args, collection } = ctx

  args.data = formatData(collection, args.data)

  args.options = options(args.options)
  args.update = update(args.update)
  args.fields = fields(args.fields)
  args.query = query(args.query)

  ctx.args = rejectNil(args)

  return next()
}

module.exports = () => formatArgs
