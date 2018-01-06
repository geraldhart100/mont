const FN = require('yiwn/full')

/**
 * Util
 */

const {
  cond,
  identity,
  map,
  omit,
  has,
  when,
  isArray,
  isObj
} = FN

const omitOid = when(
  has('_id'),
  omit([ '_id' ])
)

const strip = cond([
  [isArray, map(omitOid)],
  [isObj, omitOid],
  [FN.T, identity]
])

function handleResponse (context) {
  return next => (args, method) => {
    return next(args, method)
      .then(strip)
  }
}

/**
 * Expose
 */

module.exports = handleResponse

