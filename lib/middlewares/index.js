module.exports = [
  require('mont-middlewares-format-options')(),
  require('mont-middlewares-format-args')(),
  require('mont-middlewares-ensure-schema')(),
  require('mont-middleware-await-ready')()
]
