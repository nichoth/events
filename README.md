# events

An event bus and helpers

## install

    $ npm install @nichoth/events

## bus

This inherits from [nanobus](https://github.com/yoshuawuyts/nanobus), and has the same API, except for the constructor, which takes a list of valid event names, and the `emit` method, which will return a curried function if you don't pass in a second argument.

### example

#### event emitter
Pass in a list of event names when you create a bus, then throw an error if you subscribe to an event that's not in the list. If you don't pass in any event names, then you can subscribe to anything.

```js
var test = require('tape')
var Bus = require('../')

var bus = Bus(['hello'])

test('bad event name', function (t) {
    t.plan(1)
    try {
        bus.on('foo', () => console.log('foo'))
    } catch (err) {
        t.equal(err.message, 'Invalid event name foo')
    }
})

test('good event name', function (t) {
    t.plan(1)
    bus.on('hello', function (data) {
        t.equal(data, 'world', 'subscriptions work')
    })
    bus.emit('hello', 'world')
})

test('dont throw if given no event names', function (t) {
    t.plan(1)
    var bus = Bus()
    bus.on('foo', function (data) {
        t.equal(data, 'bar')
    })
    bus.emit('foo', 'bar')
})
```

#### emit method
Return a curried function if you don't pass in a second argument.

```js
test('curry emit method', function (t) {
    t.plan(1)
    var bus = Bus()
    bus.on('foo', function (data) {
        t.equal(data, 'hello')
    })
    var emitFoo = bus.emit('foo')
    emitFoo('hello')
})
```

## namespace

Recursively namespace an object of event names

### example

```js
var namespace = require('@nichoth/events/namespace')
var test = require('tape')

var input = {
    events: {
        update: ['get', 'add', 'delete', 'edit'],
    },

    foo: {
        bar: {
            baz: ['a', 'b', 'c']
        }
    }
}

var expected = {
    events: {
        update: {
            get: 'events.update.get',
            add: 'events.update.add',
            delete: 'events.update.delete',
            edit: 'events.update.edit'
        }
    },
    foo: {
        bar: {
            baz: {
                a: 'foo.bar.baz.a',
                b: 'foo.bar.baz.b',
                c: 'foo.bar.baz.c'
            }
        }
    }
}

test('namespace', function (t) {
    t.plan(1)
    t.deepEqual(namespace(input), expected)
})
```

## flatten

Take an object of strings and return an array of the leaf nodes. The object can be any depth. 

### example

```js
var flatten  = reuqire('@nichoth/events/flatten')
var test = require('tape')

test('flatten', function (t) {
    t.plan(1)
    t.deepEqual(flatten(namespace(input)), [
        'events.update.get',
        'events.update.add',
        'events.update.delete',
        'events.update.edit',
        'foo.bar.baz.a',
        'foo.bar.baz.b',
        'foo.bar.baz.c'
    ])
})
```

## http

Take an async function and return a new function that emits events on the given bus

### example
```js

var HttpEffects = require('../http')
var Bus = require('../')
var test = require('tape')

test('http effects', function (t) {
    t.plan(2)
    var bus = Bus()
    var fns = {
        foo: function (arg, cb) {
            process.nextTick(function () {
                cb(null, 'world')
            })
        },

        err: function (arg, cb) {
            process.nextTick(function () {
                cb('test')
            })
        }
    }

    var evs = {
        start: 'start',
        error: 'error',
        resolve: 'resolve'
    }

    var result = []
    // the last argument is data that gets added to the event objects
    var fooFx = HttpEffects(evs, bus, fns.foo, {})

    bus.on('*', function (ev, data) {
        result.push([ev, data])
        if (result.length === 4) {
            t.deepEqual(result, [
                ['start', { cid: 0, req: 'hello' }],
                ['start', { cid: 1, req: 'test' }],
                ['resolve', {
                    cid: 0, res: 'world', req: 'hello' }],
                ['resolve', {
                    cid: 1, res: 'world', req: 'test' }],
            ], 'should emit the right events')
            bus.removeAllListeners()
            testErr()
        }
    })

    fooFx('hello')
    fooFx('test')

    function testErr () {
        var errResult = []
        bus.on('*', function (ev, data) {
            errResult.push([ev, data])
            if (errResult.length === 2) {
                t.deepEqual(errResult, [
                    ['start', { cid: 2, req: {} }],
                    ['error', { cid: 2, req: {}, error: 'test'}]
                ], 'request with error response')
            }
        })
        HttpEffects(evs, bus, fns.err, {}, {})
    }
})
```

## subscription

Subscribe to events and call methods with the right context

### example

#### constructor
```js
var Sub = require('../subscribe')
var assert = require('assert')
var Store = require('@nichoth/state')
var Bus = require('../')

var DemoStore = Store.extend({
    _state: { hello: 'world', calls: { foo: 0, bar: 0, baz: 0 } },
    foo: function (data) {
        this._state.calls.foo++
        this._state.hello = data
    },
    bar: function (data) {
        this._state.calls.bar++
        this._state.hello = data
    },
    baz: function (data) {
        this._state.calls.baz++
        this._state.hello = 'baz' + data
    }
})

// depend on an event emitter and context object
var bus = Bus()
var demoStore = DemoStore()
var sub = Sub(demoStore, bus)
```

#### .on(String eventName, String | method fn) => subscription
Listen for events and call methods with the right context

```js
var sub = Sub(demoStore, bus)
    .on('example', 'foo')
    .on('woo', demoStore.bar)

bus.emit('example', 'again')
console.log(demoStore.state().hello)
assert.equal(demoStore.state().hello, 'again',
    'should call method by string')

bus.emit('woo', 'moo')
console.log(demoStore.state().hello)
assert.equal(demoStore.state().hello, 'moo', 'should call fn')

// you can only have 1 listener per event
// new functions will replace the previous one
sub.on('example', 'baz')
bus.emit('example', 'hey')
console.log('replace', demoStore.state())
assert.equal(demoStore.state().calls.foo, 1)
assert.equal(demoStore.state().calls.baz, 1)
```

#### .close() => undefined
Remove all event listeners
```js
sub.close()
bus.emit('example', 'test')
console.log(demoStore.state().hello)
assert.equal(demoStore.state().hello, 'moo', 'should unsubscribe')
```

#### Subscription.use (function fn) => Subscription
Helper that extends `Subscription` by calling the giving function during construction.

```js
var MySubscription = Subscription.use(function (sub) {
    sub.on('foo', 'bar')
})

var sub = MySubscription(demoStore, bus)
bus.emit('foo', 'new data')
assert.equal(demoStore.state().hello, 'new data', 'should subscribe')
```

