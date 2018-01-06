const FN = require('yiwn/full')

const formatFields = require('./fields')

const {
  when,
  either,
  isString,
  isArray,
  assocTo,
  compose,
  reduce,
  merge,
  map,
  paths,
  assocPath,
  evolve,
  over,
  lens
} = FN

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
 * getter :: {a} -> {b}
 */

const getter = compose(
  reduce(merge, {}),
  map(normalize),
  paths([
    ['collection', 'options'],
    ['args', 'options']
  ])
)

/**
 * @sig
 *
 * setter :: a -> {a} -> {a}
 */

const setter = assocPath(['args', 'options'])


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

module.exports = over(lens(getter, setter), format)
