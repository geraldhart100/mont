const yiwn = require('yiwn/full')

const {
  assoc,
  assocTo,
  cond,
  identity,
  isNilOrEmpty,
  isObj,
  isString,
  pick,
  propSatisfies,
  reduce,
  stubUndefined,
  toPairs
} = yiwn

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
