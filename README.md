# mont

Mirror of [Monk](https://github.com/Automattic/monk/)

## Install

```sh
npm install mont
```

## Usage

```js
const Mont = require('mont')

const db = new Mont('localhost/app')

const col = db.get('colors')

col
  .create({ id: 'blue', body: '#00ff00' })
  .then(console.log) // { id: 'blue', body: '#00ff00' }
```

## Docs

Consult [Monk's docs](https://automattic.github.io/monk/)
