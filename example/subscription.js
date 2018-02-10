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

