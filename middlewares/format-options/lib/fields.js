const FN = require('yiwn/full')

const {
  curry,
  test,
  compose,
  defaultTo,
  reduce,
  ifElse,
  split,
  when,
  converge,
  slice,
  always,
  isString,
  assocTo
} = FN

const isMinus = test(/^\-/)

const parseList = ifElse(
  isString,
  split(' '),
  defaultTo([])
)

const builder = (minus = 0) => {
  const key = when(
    isMinus,
    slice(1, Infinity)
  )

  const val = ifElse(
    isMinus,
    always(minus),
    always(1)
  )

  return (acc, name) => {
    const put = converge(assocTo(acc), [key, val])

    return put(name)
  }
}

function fields (minus, obj) {
  const build = compose(
    reduce(builder(minus), {}),
    parseList
  )

  return build(obj)
}

module.exports = curry(fields)
