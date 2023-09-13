# events ![tests](https://github.com/nichoth/events/actions/workflows/nodejs.yml/badge.svg)
An event emitter and helpers

## install
```bash
npm i -S @nichoth/events
```

## example

### create namespaced events
Take an object of arrays of strings, and return a new object where the leaf nodes are strings containing the full object path as a string.

```js
import { Bus } from '@nichoth/events'

Bus.createEvents({
    a: {
        _: [1, 2, 3]
        b: {
            c: [1,2,3]
        }
    }
})

// => {
//   a: {
//     1: 'a.1',
//     2: 'a.2',
//     3: 'a.3
//   },
//   b: {
//     c: {
//       1: 'b.c.1',
//       2: 'b.c.2',
//       3: 'b.c.3'
//     }
//   }
// }
//
```

## develop
Install dev deps with `--legacy-peer-deps` because of a problem with dependencies.

```bash
npm i --legacy--peer-deps
```

## test
```bash
npm test
```
