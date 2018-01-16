const yiwn = require('yiwn/full')

const monet = require('monet')

const shortid = require('yiwn-shortid')

const { Maybe } = monet

const {
  always,
  any,
  applySpec,
  assoc,
  assocTo,
  compose,
  curry,
  dissoc,
  dissocPath,
  identity,
  isObj,
  keys,
  path,
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

const ensureDollarWrapped = when(
  hasDollarProp,
  assocTo({}, '$set')
)

/**
 * @sig
 *
 * getter :: {a} -> {a}
 *
 */

const parse = function (params, update) {
  const $set = yiwn.pick([
    'id',
    'type',
    'body',
    'meta',
    'refs',
    'links'
  ])

  const $setOnInsert = always({
    id: shortid(),
    type: params.type
  })

  const wrap = applySpec({
    $set,
    $setOnInsert
  })

  const fixId = when(
    path(['$set', 'id']),
    dissocPath(['$setOnInsert', 'id'])
  )

  const fixType = yiwn.dissocPath(['$set', 'type'])

  return Maybe
    .fromNull(update)
    .map(wrap)
    .map(fixId)
    .map(fixType)
    .orSome(null)
}

/**
 * Expose parser
 */

module.exports = curry(parse)
