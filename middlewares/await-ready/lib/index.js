function awaitReady () {
  return (ctx, next) => {
    const { manager, collection } = ctx

    const getCol = db => db.collection(collection.name)

    const resolve = col => {
      ctx.col = col
      return next()
    }

    return manager
      .executeWhenOpened()
      .then(getCol)
      .then(resolve)
  }
}

module.exports = awaitReady
