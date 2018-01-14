const yiwn = require('yiwn/full')

const {
  any,
  assocTo,
  compose,
  curry,
  isObj,
  keys,
  startsWith,
  unless,
  when
} = yiwn

/**
 * @sig
 *
 * hasDollarProp :: {a} -> Boolean
 *
 */

const hasDollarProp = compose(
  any(startsWith('$')),
  keys
)

/**
 * @sig
 *
 * ensureDollarWrapped :: {a} -> {b}
 *
 */

const ensureDollarWrapped = unless(
  hasDollarProp,
  assocTo({}, '$set')
)

/**
 * @sig
 *
 * getter :: {a} -> {a}
 *
 */

const parse = when(
  isObj,
  compose(
    ensureDollarWrapped
  )
)


/**
 * Expose parser
 */

module.exports = parse
