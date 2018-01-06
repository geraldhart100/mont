const FN = require('yiwn/full')

const {
  identity,
  stubUndefined,
  isObj,
  cond,
  propSatisfies,
  pick,
  when,
  isString,
  assocTo,
  reduce,
  isNilOrEmpty,
  assoc,
  toPairs
} = FN

/**
 * @sig
 *
 * normalize :: String -> Object
 */

const normalize = when(
  isString,
  assocTo({}, 'id')
)

/**
 * @sig
 *
 * format :: {a} -> {a}
 */

function format (query) {
  const { refs } = query

  delete query.refs

  const getRef = pick(['id', 'type'])

  const one = (q, pair) => {
    const [ name, value ] = pair
    return assoc(`refs.${name}`, getRef(value), q)
  }

  return reduce(one, query, toPairs(refs))
}

const parse = cond([
  [isNilOrEmpty, stubUndefined],
  [isString, assocTo({}, 'id')],
  [propSatisfies(isObj, 'refs'), format],
  [isObj, identity],
])

module.exports = parse
