module.exports = [
  require('mont-middleware-format-args')(),
  require('mont-middlewares-ensure-schema')(),
  require('mont-middleware-await-ready')()
]
