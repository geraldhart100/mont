const { rejectNil } = require('yiwn/full')

const options = require('./options')
const query = require('./query')
const fields = require('./fields')

const formatData = require('./data')
const formatUpdate = require('./update')

function formatArgs (ctx, next) {
  const { args, collection } = ctx

  args.data = formatData(collection, args.data)
  args.update = formatUpdate(collection, args.update)

  args.options = options(args.options)
  args.fields = fields(args.fields)
  args.query = query(args.query)

  ctx.args = rejectNil(args)

  return next()
}

module.exports = () => formatArgs
