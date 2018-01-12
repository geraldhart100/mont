const FN = require('yiwn/full')

const cast = require('./cast')

module.exports = function () {

  return async (ctx, next) => {
    const options = {
      context: {
        type: ctx.collection.type
      }
    }

    const cast = res => schema.validate(res, options)

    const { data, update } = ctx.args

    try {
      if (data) {
        ctx.args.data = await cast(data)
      }

      if (update && update.$set) {
        ctx.args.update.$set = await cast(update.$set)
      }

      return next(null, ctx)
    } catch (err) {
      return next(err)
    }
  }
}
