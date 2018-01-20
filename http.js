var xtend = require('xtend')
var curry = require('curry')
var cid = 0

// emit events when you make a http request

// `evs` should be { start, resolve, error }
// `fn` is an async function

// this emits 3 types of event
// (evs.start, { cid, req: data })
// (evs.resolve, { cid, req: data, res: response })
// (evs.error, { cid, req: data, error })
var HttpEffects = curry(function (evs, bus, fn, req) {
    var _id = cid++
    var evData = {
        cid: _id,
        req: req
    }
    bus.emit(evs.start, evData)

    fn(req, function onResponse (err, res) {
        if (err) return bus.emit(evs.error, xtend(evData, {
            error: err
        }))

        bus.emit(evs.resolve, {
            cid: _id,
            res: res,
            req: req
        })
    })
})

module.exports = HttpEffects

