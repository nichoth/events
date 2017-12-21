var xtend = require('xtend')
var curry = require('curry')

// emit events when you make a http request

// `evs` should be { start, resolve, error }
// `fns` is an object of async functions of (data, cb)

// this emits 3 types of event
// (evs.start, { cid, type: fnKey, req: data })
// (evs.resolve, { cid, type: fnKey, req: data, res: response })
// (evs.error, { cid, type: fnKey, req: data, error })
var HttpEffects = curry(function (evs, bus, fns) {
    var cid = 0

    return Object.keys(fns).reduce(function (acc, k) {
        acc[k] = function (data) {
            var _id = cid++
            var evData = {
                cid: _id,
                type: k,
                req: data
            }
            bus.emit(evs.start, evData)

            fns[k](data, function onResponse (err, res) {
                if (err) return bus.emit(evs.error, xtend(evData, {
                    error: err
                }))

                bus.emit(evs.resolve, {
                    cid: _id,
                    type: k,
                    res: res,
                    req: data
                })
            })
        }
        return acc
    }, {})
})

module.exports = HttpEffects

