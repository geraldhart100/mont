const FN = require('yiwn/full')

const {
  partialRight,
  isArray,
  reduce,
  isString,
  split,
  curry,
  assocTo,
  compose,
  when
} = FN

/**
 * @sig
 *
 * mapTo :: v -> [a] -> { k: v }
 *
 */

const mapTo = curry(
  function (v, ks) {
    const it = partialRight(assocTo, [v])
    return reduce(it, {}, ks)
  }
)

/**
 * @sig
 *
 * parse :: * -> {a}
 *
 */

const parse = compose(
  when(isArray, mapTo(1)),
  when(isString, split(' '))
)

module.exports = parse
