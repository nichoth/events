var test = require('tape')
var Bus = require('../')

var bus = Bus({
    eventNames: ['hello']
})

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

test('curry emit method', function (t) {
    t.plan(2)
    var bus = Bus({
        eventNames: ['foo']
    })

    bus.on('foo', function (data) {
        t.equal(data, 'hello')
    })

    var emitFoo = bus.emit('foo')
    emitFoo('hello')

    function emitBar () { return bus.emit('bar') }
    t.throws(emitBar, 'should throw when you curry an invalid event name')
})

test('memoize the emitters', function (t) {
    t.plan(2)
    var bus = Bus({
        memo: true
    })

    var emitBar = bus.emit('bar')
    var emitBar2 = bus.emit('bar')
    var emitBar3 = bus.emit('bar')

    t.equal(emitBar, emitBar2, 'should return the same reference')
    t.equal(emitBar, emitBar3, 'should return the same reference')
})

