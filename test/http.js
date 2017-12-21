var HttpEffects = require('../http')
var Bus = require('../')
var test = require('tape')

test('http effects', function (t) {
    t.plan(1)
    var bus = Bus()
    var fns = {
        foo: function (arg, cb) {
            process.nextTick(function () {
                cb(null, 'world')
            })
        }
    }

    var evs = {
        start: 'start',
        error: 'error',
        resolve: 'resolve'
    }

    var result = []
    var fx = HttpEffects(evs, bus, fns)

    bus.on('*', function (ev, data) {
        result.push([ev, data])
        if (result.length === 2) {
            t.deepEqual(result, [
                ['start', { cid: 0, type: 'foo', req: 'hello' }],
                ['resolve', {
                    cid: 0, type: 'foo', res: 'world', req: 'hello' }]
            ], 'should emit the right events')
        }
    })

    fx.foo('hello')
})

