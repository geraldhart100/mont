const monet = require('monet')

const W = require('yiwn/full')
const shortid = require('yiwn-shortid')

const { Maybe } = monet

const mapSafe = W.curry(
  (f, a) => W.isArray(a) ? W.map(f, a) : f(a)
)

function format (params, data) {
  const { type } = params

  const ensureId = W.when(
    W.propSatisfies(W.isNil, 'id'),
    W.assoc('id', shortid())
  )

  const assocType = W.assoc('type', type)

  const skipExtra = W.pick([
    'id',
    'type',
    'body',
    'meta',
    'refs',
    'links'
  ])

  const format = data =>
    Maybe
      .fromNull(data)
      .map(ensureId)
      .map(assocType)
      .map(skipExtra)
      .orJust(null)

  return mapSafe(format, data)
}

module.exports = W.curry(format)
