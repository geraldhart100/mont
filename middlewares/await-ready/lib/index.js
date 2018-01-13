function awaitReady () {
  return (ctx, next) => {
    const { monkInstance, collection } = ctx

    const getCol = db => db.collection(collection.name)

    const resolve = col => {
      const args = ctx.args || {}

      args.col = col
      ctx.args = args

      return next()
    }

    return monkInstance
      .executeWhenOpened()
      .then(getCol)
      .then(resolve)
  }
}

module.exports = awaitReady
