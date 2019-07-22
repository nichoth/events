var Nanobus = require('nanobus')
var inherits = require('inherits')

// eventNames -- optional list of allowed event names
// memo -- Boolean - return cached `emit` functions. We use this for
//   rendering with a virtual dom, so we don't create new functions on
//   each render. Default false
function Bus (opts) {
    if (!(this instanceof Bus)) return new Bus(opts)
    opts = opts || {}
    var evs = opts.eventNames
    this._memo = opts.memo
    if (opts.memo) this._memoFns = {}

    this._evs = evs ?
        evs.reduce(function (acc, ev) {
            acc[ev] = true
            return acc
        }, {}) :
        null

    Nanobus.call(this)
}
inherits(Bus, Nanobus)

Bus.prototype.on = function (name, fn) {
    if (this._evs && !this._evs[name]) {
        throw new Error('Invalid event name ' + name)
    }
    return Nanobus.prototype.on.apply(this, arguments)
}

Bus.prototype.emit = function (name, data) {
    var self = this
    if ((this._evs && !this._evs[name]) || name === undefined) {
        throw new Error('Invalid event name ' + name)
    }

    // return curried function
    if (data === undefined) {
        if (this._memo) {
            if (!this._memoFns[name]) {
                this._memoFns[name] = function (_data) {
                    return self.emit(name, _data)
                }
            }
            return this._memoFns[name]
        }

        return function (_data) {
            return self.emit(name, _data)
        }
    }

    return Nanobus.prototype.emit.call(this, name, data)
}

module.exports = Bus

