const shortid = require('shortid')

const FN = require('yiwn/full')

const {
  lens,
  headNotNil,
  paths,
  assocPath,
  isObj,
  compose,
  over,
  when,
  isArray,
  ifElse,
  map,
  isNil,
  lensProp,
  lensSatisfies
} = FN

const updateLens = lensProp('update')
const dataLens = lensProp('data')

const idLens = lensProp('id')

const ensureOne = when(isNil, shortid)

const ensureData = ifElse(
  isArray,
  map(over(idLens, ensureOne)),
  over(idLens, ensureOne)
)

const upsertIdLens = lens(
  compose(
    headNotNil,
    paths([
      ['update', '$set', 'id'],
      ['update', '$setOnInsert', 'id']
    ])
  ),
  assocPath(['update', '$setOnInsert', 'id'])
)

const ensureUpdate = when(
  lensSatisfies(isNil, upsertIdLens),
  over(upsertIdLens, ensureOne)
)

const parse = compose(
  ensureUpdate,
  over(dataLens, ensureData)
)

module.exports = function () {
  return (ctx, next) => {
    ctx.args = parse(ctx.args)
    return next(null, ctx)
  }
}
