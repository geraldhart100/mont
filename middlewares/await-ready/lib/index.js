function awaitReady (ctx, next) {
  const { collection } = ctx

  const resolve = col => {
    ctx.col = col
    return next()
  }

  return collection
    .resolveCol()
    .then(resolve)
}

module.exports = () => awaitReady
