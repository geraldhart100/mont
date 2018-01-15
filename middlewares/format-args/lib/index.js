const { rejectNil } = require('yiwn/full')

const options = require('./cast-options')
const query = require('./cast-query')
const fields = require('./cast-fields')

const castData = require('./cast-data')
const castUpdate = require('./cast-update')

function formatArgs (ctx, next) {
  const { args, collection } = ctx

  args.data = castData(collection, args.data)
  args.update = castUpdate(collection, args.update)

  args.options = options(args.options)
  args.fields = fields(args.fields)
  args.query = query(args.query)

  ctx.args = rejectNil(args)

  return next()
}

module.exports = () => formatArgs
