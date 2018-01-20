var HttpEffects = require('../http')
var Bus = require('../')
var test = require('tape')

test('http effects', function (t) {
    t.plan(2)
    var bus = Bus()
    var fns = {
        foo: function (arg, cb) {
            process.nextTick(function () {
                cb(null, 'world')
            })
        },

        err: function (arg, cb) {
            process.nextTick(function () {
                cb('test')
            })
        }
    }

    var evs = {
        start: 'start',
        error: 'error',
        resolve: 'resolve'
    }

    var result = []
    var fooFx = HttpEffects(evs, bus, fns.foo)

    bus.on('*', function (ev, data) {
        result.push([ev, data])
        if (result.length === 4) {
            t.deepEqual(result, [
                ['start', { cid: 0, req: 'hello' }],
                ['start', { cid: 1, req: 'test' }],
                ['resolve', {
                    cid: 0, res: 'world', req: 'hello' }],
                ['resolve', {
                    cid: 1, res: 'world', req: 'test' }],
            ], 'should emit the right events')
            bus.removeAllListeners()
            testErr()
        }
    })

    fooFx('hello')
    fooFx('test')

    function testErr () {
        var errResult = []
        bus.on('*', function (ev, data) {
            errResult.push([ev, data])
            if (errResult.length === 2) {
                t.deepEqual(errResult, [
                    ['start', { cid: 2, req: {} }],
                    ['error', { cid: 2, req: {}, error: 'test'}]
                ], 'request with error response')
            }
        })
        HttpEffects(evs, bus, fns.err, {})
    }
})

