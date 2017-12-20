# events

An event bus and helpers

## install

    $ npm install @nichoth/events

## bus

Pass in a list of event names when you create a bus, then throw an error if you subscribe to an event that's not in the list. If you don't pass in any event names, then you can subscribe to anything.

This inherits from [nanobus](https://github.com/yoshuawuyts/nanobus), and has the same API, except for the constructor.

### example

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

## namespace

Recursively namespace an object of event names

### example

Take an object of event name strings and return an object of namespaced
strings.

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

