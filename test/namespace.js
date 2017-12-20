var namespace = require('../namespace')
var flatten = require('../flatten')
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

