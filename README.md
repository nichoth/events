# events ![tests](https://github.com/nichoth/events/actions/workflows/nodejs.yml/badge.svg)
An event bus and helpers

__featuring__
* 0 production dependencies
* CJS and ESM versions

## API

## install
```bash
npm i -S @nichoth/events
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
Create a new child emit function. This will namespace the event names. Here
we pass in an array of names -- ['ok', 'example'] -- and a new
prefix string -- 'child-two'.

Events are all emitted on the same bus, but the event names are namespaced
by the 'child' event emitter.

Events are exposed at `child.events`, indexed by their short name, `ok` and
`example`. Each index maps to the fully namespaced name. So here
`ok` maps to `'testEmitter.child-two.ok'`

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
 
