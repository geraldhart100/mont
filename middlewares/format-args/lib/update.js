const FN = require('yiwn/full')

const {
  curry,
  unless,
  assocTo,
  startsWith,
  any,
  compose,
  keys,
  when,
  isObj
} = FN

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
