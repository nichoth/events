# events ![tests](https://github.com/nichoth/events/actions/workflows/nodejs.yml/badge.svg)
An event bus and helpers

__featuring__
* 0 production dependencies
* CJS and ESM versions

## install
```bash
npm i -S @nichoth/events
```

## API
### Create a bus
```js
import { Bus } from '@nichoth/events'
const bus = new Bus()
```

### emit events
```js
bus.emit('foo', 'my test data')
```

### subscribe to events
```js
bus.on('foo', function (data) {
    console.log('got a foo event', data)
})
```

### bus.emitter (evs, namespace)
This will return a function that can emit events within the given namespace.
*Namespace* here means prefixing event names with a given string; they are all
emitted on a single bus.

Note the new function cannot subscribe to events, only emit them.

```js
test('child event emitter', t => {
    // pass in valid event names -- ['foo', 'bar']
    // pass in a namespace -- 'testEmitter'
    const emitter = bus.emitter(['foo', 'bar'], 'testEmitter')

    t.equal(typeof emitter, 'function', 'should return a function')

    // event names are indexed at `.events`
    t.deepEqual(emitter.events, {
        foo: 'testEmitter.foo',
        bar: 'testEmitter.bar'
    }, 'has the expected events object')

    // calling this function will emit an event like `'testEmitter.foo'`
    t.equal(typeof emit.foo, 'function',
        'should return curried functions, indexed by event name')
})
```

## example
```js
import { Bus } from '@nichoth/events'

const bus = new Bus()

test('create a bus', t => {
    t.equal(bus.events, null, 'by default has null as allowed event names')
    t.end()
})
```

### Create namespaced event emitters
Create a new child emit function, with namespaced event names. Pass in an
array of names -- ['ok', 'example'] -- and a new prefix string -- 'child-two'.

Events are emitted on the parent bus, but the events are namespaced --
the given `prefix` is prepended to the event name.

Events are exposed at `child.events`, indexed by their short name, `ok` and
`example` in the following example. Each index maps to the fully namespaced
name. So here `ok` maps to `'testEmitter.child-two.ok'`

```js
// create a function that can emit events, but cannot subscribe
const emitter = bus.emitter(['foo', 'bar'], 'testEmitter')

const emit2 = emitter.createChild(['ok', 'example'], 'child-two')

test('subscribe to bus', t => {
    // return a function that will unsubscribe
    const off = bus.on(emit2.events.ok, (data) => {
        t.equal(data, 'test data', 'should hear the event')
        t.end()
        off()
    })

    const evs = emit2.events
    bus.emit(evs.ok, 'test data')
})
```

### emit events
Functions that emit data are indexed at `eventEmitter[eventName]`. So you can emit a namepsaced event by calling the indexed function.

For example,
```js
eventEmitter.ok('my data')
```
would emit an event like `'myNamespace.ok'`

```js
test('Use indexed `emit` functions', t => {
    // fully namespaced event names are exposed at `.events` on a child
    // event emitter
    bus.on(emit2.events.ok, (data) => {
        t.equal(data, 'test data 2', 'should hear the event from indexed function')
        t.end()
    })

    emit2.ok('test data 2')
})
```
 
