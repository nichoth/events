# events ![tests](https://github.com/nichoth/events/actions/workflows/nodejs.yml/badge.svg)
An event bus and helpers

__featuring__
* 0 production dependencies
* CJS and ESM versions

## install
```bash
npm i -S @nichoth/events
```

## develop
See an example of using this in a front-end app

```bash
npm start
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

### bus.emitter (events, namespace)
This will return a function that can emit events within the given namespace.
*Namespace* here means prefixing event names with a given string; they are all
emitted on a single bus.

Note the new function cannot subscribe to events, only emit them.

### emitter.createChild (events, prefix)
Create a new `emit` function, with a new prefix.

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
See [./example](./example/index.tsx) -- use in frontend JS.

Notice the state & logic are controlled by the parent component, but
changing the state does not cause the parent to re-render, only
the child.

This is different than calling `useState` in the parent
component, which would cause a full re-render of every component.

Because of the `signal` model, the state is never updated -- it is
always a tree of objects. The object values are the only part of
state that changes, thus only the child re-renders since that is
the only place we read the value of the signal.

This model of Signals + a single state store allows us to keep a top-down
flow of application state -- state travels downward, events up.

That is important because if you simply update state from anywhere in the view
tree (which is possible, we are simply setting a value), then you lose the
uni-directional flow of state + events, which is the sole benefit of something
like React. Otherwise we are back to two-directional data binding, or mutable
state, aka the thing that made client-side programming difficult in the past.


```js
// src/example/index.tsx

let parentRenders = 0
let childRenders = 0

/**
 * Child knows nothings about its event namespace or parent components.
 * It only knows its local event names.
 */
function Child ({ emit, state }):FunctionComponent {
    childRenders++

    return (<div className="child">
        <p>{state.value.hello}</p>
        <p>Child renders: {childRenders}</p>
        <p>
            <button onClick={emit.hello} data-message="hey there">
                say hello
            </button>
        </p>
    </div>)
}

Child.events = ['hello', 'foo']

function Example ():FunctionComponent {
    parentRenders++

    const state = useSignal({ hello: 'hello' })

    // handle subscriptions in `useMemo`, because we only want
    // this function to run once.
    //
    // parent needs to know the event names that child components will emit
    const emitter = useMemo(() => {
        const emit = bus.emitter(Child.events, 'childEmitter')

        bus.on(emit.events.hello, ev => {
            ev.preventDefault()
            const msg = ev.target.dataset.message
            state.value = { hello: msg }
        })

        return emit
    }, [])

    return (<div>
        <p>parentRenders: {parentRenders}</p>
        <Child emit={emitter} state={state} />
    </div>)
}
```

### Create namespaced event emitters
Create a new child emit function, with namespaced event names. Pass in an
array of names -- `['ok', 'example']` -- and a new prefix string -- `'child-two'`.

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
 
