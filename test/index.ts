import { test } from '@nichoth/tapzero'
import { Bus } from '../src/index.js'
let bus

test('create a bus', t => {
    bus = new Bus()
    t.ok(bus, 'create an event bus')
    t.equal(typeof bus.on, 'function', 'should have .on')
    t.equal(typeof bus.emit, 'function', 'should have .emit')
})

let events
test('create namespaced event names', t => {
    t.plan(1)

    events = Bus.createEvents({
        a: {
            _: ['1', '2', '3'],
        },
        b: {
            c: { _: ['4', '5', '6'] }
        },
        d: {
            _: ['7', '8', '9'],
            e: ['10', '11']
        }
    }, '')

    t.deepEqual(events, {
        a: { 1: 'a.1', 2: 'a.2', 3: 'a.3' },
        b: {
            c: {
                '4': 'b.c.4',
                '5': 'b.c.5',
                '6': 'b.c.6'
            }
        },
        d: {
            '7': 'd.7',
            '8': 'd.8',
            '9': 'd.9',

            e: { '10': 'd.e.10', '11': 'd.e.11' }
        }
    }, 'should create the right object shape')
})

test('flatten an object of events', t => {
    t.plan(2)
    const arr = Bus.flatten(events)
    const expected = [
        'a.1', 'a.2',
        'a.3', 'b.c.4',
        'b.c.5', 'b.c.6',
        'd.7', 'd.8',
        'd.9', 'd.e.10',
        'd.e.11'
    ]

    t.ok(Array.isArray(arr), 'should return an array')
    t.deepEqual(arr, expected, 'should create the right array')
})

test('subscribe and emit events', t => {
    t.plan(2)
    const off = bus.on(events.a['1'], (data) => {
        t.equal(data, 'test data', 'first listener gets the event')
        off()
    })

    const unlisten = bus.on(events.a['1'], (data) => {
        t.equal(data, 'test data', 'second listner gets the event')
        unlisten()
    })

    bus.emit(events.a['1'], 'test data')

    // should only get 1 event each, because we call `off` after
    bus.emit(events.a['1'], 'test data')
})

test('subscribe to *', t => {
    t.plan(2)
    const bus = new Bus()
    bus.on('*', (ev, data) => {
        t.equal(ev, 'foo')
        t.equal(data, 'bar')
    })
    bus.emit('foo', 'bar')
})

test('Curry the emit function', t => {
    t.plan(2)
    const bus = new Bus()
    const emitFoo = bus.emit('foo')
    t.equal(typeof emitFoo, 'function', 'should return a new function')

    bus.on('foo', data => {
        t.equal(data.example, 'test data',
            'should hear the event from curried function')
    })

    if (typeof emitFoo !== 'function') return  // for ts
    emitFoo({ example: 'test data' })
})

test('valid event names', t => {
    t.plan(4)
    const events = Bus.createEvents({
        foo: ['bar', 'baz']
    })
    const bus = new Bus(events)
    bus.emit('foo.bar', 'testing')
    t.ok('should not throw with a valid event name')

    t.throws(() => bus.emit('bla', 'test data'), null,
        'should throw emitting a bad event name')

    bus.on('foo.bar', () => null)
    t.ok('should not throw subscribing to a valid event name')

    t.throws(() => bus.on('baloney', () => null),
        'should throw subscribing to a bad even name')
})

test('emit a null event', t => {
    t.plan(2)
    const bus = new Bus()
    bus.on('foo', (ev) => {
        t.ok(!ev, 'event listener was called')
        t.equal(ev, null, 'should get null as the event')
    })
    bus.emit('foo', null)
})

test('star listener', t => {
    t.plan(2)
    const bus = new Bus(['foo', 'bar'])

    bus.on('*', function (name:string, data) {
        t.equal(name, 'foo', 'should get the event name')
        t.equal(data, 'hello', 'should get the event data')
    })

    bus.emit('foo', 'hello')
})

// type ValuesOf<T extends any[]>= T[number];

test('event types', t => {
    const eventTree = Bus.createEvents({
        a: ['b', 'c', 'd'],
        b: {
            _: ['e', 'f'],
            c: ['1', '2', '3']
        }
    })

    const flat = Bus.flatten(eventTree)
    const bus2 = new Bus<typeof flat>(flat)
    // const bus2 = new Bus<Array<typeof flat[number]>>(flat)
    // const tester = new Bus<typeof flat>(flat)
    // tester.on('qcb', () => {})

    t.throws(() => {
        bus2.on('qqqqq', (data) => console.log(data))
    }, 'should throw because the event name is invalid')

    const arr = ['a', 'b', 'c']
    const bus3 = new Bus<typeof arr>()
    bus3.emit('aaaa', 'data')

    const bus = new Bus<['a', 'b', 'c']>()

    // should see TS errors in vscode
    // but should not throw, because we did not pass events as an argument
    bus.emit('bad event', { data: 'data' })
    bus.on('aaaaa', data => console.log(data))

    // should not see TS error here
    bus.emit('a', 'test')
})
