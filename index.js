var Nanobus = require('nanobus')
var inherits = require('inherits')

// take an array of strings that are the allowed event names
function Bus (evs) {
    if (!(this instanceof Bus)) return new Bus(evs)
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

module.exports = Bus

