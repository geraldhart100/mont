module.exports = [
  require('mont-middleware-format-args')(),
  require('mont-middleware-apply-schema')(),
  require('mont-middleware-await-ready')()
]
