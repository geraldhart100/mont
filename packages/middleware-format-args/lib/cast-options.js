const yiwn = require('yiwn/full')

const {
  always,
  assocTo,
  compose,
  converge,
  defaultTo,
  either,
  evolve,
  ifElse,
  isArray,
  isString,
  merge,
  reduce,
  slice,
  split,
  startsWith,
  when
} = yiwn

/**
 * @sig
 *
 * formatFields :: a -> Idx -> Object
 *
 */

const formatFields = minus => {
  const build = (acc, name) => {
    const isMinus = startsWith('-', name)

    const key = isMinus
      ? slice(1, Infinity, name)
      : name

    const val = isMinus
      ? minus
      : 1

    return assocTo(acc, key, val)
  }

  return compose(
    when(isArray, reduce(build, {})),
    when(isString, split(' '))
  )
}

/**
 * @sig
 *
 * normalize :: * -> Object
 */

const normalize = when(
  either(isString, isArray),
  assocTo({}, 'fields')
)

/**
 * @sig
 *
 * format :: {a} -> {a}
 */

const format = evolve({
  fields: formatFields(0),
  sort: formatFields(-1)
})

/**
 * @sig
 *
 * formatOptions :: {a} -> {a}
 */

const parse = compose(
  format,
  normalize,
  defaultTo({})
)

module.exports = parse
