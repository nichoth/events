var Sub = require('../subscribe')
var assert = require('assert')
var Store = require('@nichoth/state')
var Bus = require('../')

var DemoStore = Store.extend({
    _state: { hello: 'world' },
    foo: function (data) {
        this._state.hello = data
    },
    bar: function (data) {
        this._state.hello = data
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

sub.close()
bus.emit('example', 'test')
console.log(demoStore.state().hello)
assert.equal(demoStore.state().hello, 'moo', 'should unsubscribe')

// convenient helper
// keys are method names, values are event names
// this is useful if the event names are references, not strings
// for example { foo: something.something }
var WithEvs = Sub.withEvents({
    foo: 'example',
    bar: 'testEvent'
})

var _sub = WithEvs(demoStore, bus)
bus.emit('example', 'new data')
console.log(demoStore.state().hello)
assert.equal(demoStore.state().hello, 'new data', 'should subscribe')


