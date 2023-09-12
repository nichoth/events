import test from 'tape'
import { Bus } from '../dist/index.js'
let bus

test('create a bus', t => {
    bus = new Bus()
    t.ok(bus, 'create an event bus')
    t.equal(typeof bus.on, 'function', 'should have .on')
    t.equal(typeof bus.emit, 'function', 'should have .emit')
    // t.equal(bus.events, null, 'by default has null as allowed event names')
    t.end()
})

test('create event names', t => {
    t.plan(1)

    const events = Bus.createEvents({
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
        a: { 1: 'a.1', 2: 'a,2', 3: '1.3' }
    })
})

// // test('create event names', t => {
// //     const evs = Bus.createEvents(['foo', 'bar'], 'myPrefix')

// //     t.deepEqual(evs, {
// //         foo: 'myPrefix.foo',
// //         bar: 'myPrefix.bar'
// //     }, 'should create the right events')

// //     t.end()
// // })

// // let emitter
// // test('create child event emitters', t => {
// //     const emit = emitter = bus.emitter(['foo', 'bar'], 'testEmitter')
// //     t.equal(typeof emit, 'function', 'should return a function')
// //     t.deepEqual(emit.events, {
// //         foo: 'testEmitter.foo',
// //         bar: 'testEmitter.bar'
// //     }, 'has the expected events object')

// //     t.equal(typeof emit.foo, 'function',
// //         'should return curried functions, indexed by event name')
// //     t.end()
// // })

// // let emit2
// // test('create another child', t => {
// //     emit2 = emitter.createChild(['ok', 'example'], 'child-two')
// //     t.equal(typeof emit2, 'function', 'should create a new emitter')
// //     t.deepEqual(emit2.events, {
// //         ok: 'testEmitter.child-two.ok',
// //         example: 'testEmitter.child-two.example'
// //     }, 'should have the right events object')
// //     t.end()
// // })

// test('subscribe to bus', t => {
//     t.plan(2)
//     const off = bus.on(emit2.events.ok, (data) => {
//         t.equal(data, 'test data', 'should hear the event')
//         off()
//     })

//     const unlisten = bus.on('testEmitter.child-two.ok', (data) => {
//         t.equal(data, 'test data', 'can subscribe via string')
//         unlisten()
//     })

//     const evs = emit2.events
//     bus.emit(evs.ok, 'test data')
// })

// test('Use indexed `emit` functions', t => {
//     t.plan(1)
//     bus.on(emit2.events.ok, (data) => {
//         t.equal(data, 'test data 2', 'should get the event from indexed function')
//     })

//     emit2.ok('test data 2')
// })
