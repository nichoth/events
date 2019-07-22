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

var bus = Bus()
var demoStore = DemoStore()
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

// should replace the existing event handler
sub.on('example', 'baz')
bus.emit('example', 'hey')
console.log('replace', demoStore.state())
assert.equal(demoStore.state().calls.foo, 1)
assert.equal(demoStore.state().calls.baz, 1)

sub.close()
bus.emit('example', 'test')
console.log(demoStore.state().hello)
assert.equal(demoStore.state().hello, 'bazhey', 'should unsubscribe')

// ## Sub.extend
// A factory function
var ExampleSub = Sub.extend(function () {
    var { evs } = this
    this.on(evs.foo, 'foo')
        .on(evs.bar, 'bar')
}, {
    // map every event object
    map: function (ev) {
        return ev.value
    }
})

// any properties on the third options arg are added to `this`
var demoStore2 = DemoStore()
var sub = ExampleSub(demoStore2, bus, {
    evs: { foo: 'example.foo', bar: 'example.bar' }
})

bus.emit('example.foo', { value: 'foo' })
assert.deepEqual(demoStore2.state(), {
    hello: 'foo',
    calls: { foo: 1, bar: 0, baz: 0 }
})

bus.emit('example.bar', { value: 'bar' })
assert.deepEqual(demoStore2.state(), {
    hello: 'bar',
    calls: { foo: 1, bar: 1, baz: 0 }
})


// ---------------------

var MapExample = ExampleSub.extend({
    map: function (data, evName, method) {
        assert.equal(method, 'foo')
        assert.equal(evName, 'example.foo')
        assert.deepEqual(data, { value: 'foo' })
        return data.value
    }
})

var mapExampleStore = DemoStore()
var mapExample = MapExample(mapExampleStore, bus, {
    evs: { foo: 'example.foo', bar: 'example.bar' }
})

bus.emit('example.foo', { value: 'foo' })
assert.deepEqual(mapExampleStore.state(), {
    hello: 'foo',
    calls: { foo: 1, bar: 0, baz: 0 }
})

mapExample.close()








