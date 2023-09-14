# events ![tests](https://github.com/nichoth/events/actions/workflows/nodejs.yml/badge.svg)
An event emitter and helpers

__featuring__
* 0 production dependencies
* CJS and ESM versions
* 469 bytes minified and gzipped

## install
```bash
npm i -S @nichoth/events
```

## example

### create an event bus
```js
import { Bus } from '@nichoth/events'
const bus = new Bus()

// you can pass in a list of event names that are allowed.
// If you subscribe or emit something not in the list, it will throw an error.
const bus2 = new Bus(['valid', 'events'])
```

### Bus.flatten
Get an array of the leaf node values of an object of any shape, for example the return value of `Bus.createEvents`.

It's recommended to use the `.flatten` static function to get the event name values after calling `.createEvents`. Or, if you pass in anything that is not an array, the constructor will call `.flatten` on it.
```js
import { Bus } from '@nichoth/events'

const events = Bus.createEvents({
    a: {
        _: [1, 2, 3]
        b: {
            c: [1,2,3]
        }
    }
})

const bus = new Bus(Bus.flatten(events))
// is the same as
const bust2 = new Bus(events)
```

### create namespaced events
Take an object of arrays of strings, and return a new object where the leaf nodes are strings containing the full object path.

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
//     b: {
//       c: {
//         1: 'a.b.c.1',
//         2: 'a.b.c.2',
//         3: 'a.b.c.3'
//       }
//     }
//   },
// }
//
```

### subscribe
```js
import { Bus } from '@nichoth/events'
const bus = new Bus()

const off = bus.on(events.a['1'], (data) => {
    t.equal(data, 'test data', 'first listener gets the event')
    off()  // unsubscribe
})
```

### emit events
```js
import { Bus } from '@nichoth/events'
const bus = new Bus()

bus.emit(events.a['1'], 'test data')
```

You can partially apply the the `.emit` function
```js
const emitFoo = bus.emit('foo')

bus.on('foo', data => {
    console.log(data)
    // => { example: 'data' }
})

emitFoo({ example: 'data' })

```

## develop
Install dev deps with `--legacy-peer-deps`. 

```bash
npm i --legacy--peer-deps
```

## test
```bash
npm test
```
