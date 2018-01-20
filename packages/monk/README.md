# mont

MongoDB client layer with middleware support.

## Install

```sh
npm install mont
```

## Usage

```js
const Mont = require('mont')

const db = Mont('localhost/app')

db.get('colors')
  .insert({ id: 'blue', body: { hex: '#00ff00' } })
  .then(console.log)

// { id: 'blue',
//   type: 'colors',
//   body: { hex: '#00ff00' } }
```

## Test

```sh
npm test
```

## Docs

Consult [Monk API docs][monk-doc] and [Koa middleware guide][koa-doc]

[monk-doc]: https://automattic.github.io/monk/
[koa-doc]: https://github.com/koajs/koa/blob/master/docs/guide.md

## License

MIT
