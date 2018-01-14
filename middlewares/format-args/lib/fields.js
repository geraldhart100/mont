const yiwn = require('yiwn/full')

const {
  assocTo,
  compose,
  curry,
  isArray,
  isString,
  partialRight,
  reduce,
  split,
  when
} = yiwn

/**
 * @sig
 *
 * mapTo :: v -> [a] -> { k: v }
 *
 * @example
 *
 *      mapTo(1, ['a', 'b'])
 *      // > { a: 1, b: 1 }
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
 * @example
 *
 *      parse('a b')
 *      // > { a: 1, b: 1 }
 *
 *      parse(['a', 'b'])
 *      // > { a: 1, b: 1 }
 */

const parse = compose(
  when(isArray, mapTo(1)),
  when(isString, split(' '))
)

module.exports = parse
