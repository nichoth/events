import test from 'tape'
import { Bus } from '../dist/index.js'
let bus

test('create a bus', t => {
    bus = new Bus()
    t.ok(bus, 'create an event bus')
    t.equal(typeof bus.on, 'function', 'should have .on')
    t.equal(typeof bus.emit, 'function', 'should have .emit')
    t.end()
})

let events
test('create event names', t => {
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
    })
})

test('subscribe to bus', t => {
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
