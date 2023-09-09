// @ts-check
'use strict'
import { test } from '@socketsupply/tapzero'
import { Bus } from '../src/index.js'

let bus
test('create a bus', t => {
    bus = new Bus()
    t.ok(bus, 'create an event bus')
    t.equal(typeof bus.on, 'function', 'should have .on')
    t.equal(typeof bus.emit, 'function', 'should have .emit')
    t.equal(bus.events, null, 'by default has null as allowed event names')
})

let emitter
test('create child event emitters', t => {
    const emit = emitter = bus.emitter(['foo', 'bar'], 'testEmitter')
    t.equal(typeof emit, 'function', 'should return a function')
    t.deepEqual(emit.events, {
        foo: 'testEmitter.foo',
        bar: 'testEmitter.bar'
    }, 'has the expected events object')

    // how to rm the error on `foo`?
    // this could be caught at compile time
    t.equal(typeof emit.foo, 'function',
        'should return curried functions, indexed by event name')
})

let emit2
test('create another child', async t => {
    emit2 = emitter.createChild(['ok', 'example'], 'child-two')
    t.equal(typeof emit2, 'function', 'should create a new emitter')
    t.deepEqual(emit2.events, {
        ok: 'testEmitter.child-two.ok',
        example: 'testEmitter.child-two.example'
    }, 'should have the right events object')
})

test('subscribe to bus', t => {
    bus.on(emit2.events.ok, (data) => {
        console.log('args', data)
        t.equal(data, 'test data', 'should hear the event')
    })

    const evs = emit2.events
    bus.emit(evs.ok, 'test data')
})
