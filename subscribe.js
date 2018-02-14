var mxtend = require('xtend/mutable')
var inherits = require('inherits')

function Subscription (store, bus, opts) {
    if (!(this instanceof Subscription)) return new Subscription(store, bus)
    this._store = store
    this._bus = bus
    mxtend(this, opts || {})
    this._listeners = {}
}

Subscription.prototype.on = function (ev, fn) {
    var self = this
    this._bus.on(ev, listener)

    function listener (data) {
        if (typeof fn === 'function') return fn.call(self._store, data)
        self._store[fn](data)
    }

    var oldListener = this._listeners[ev]
    if (oldListener) this._bus.removeListener(ev, oldListener)
    this._listeners[ev] = listener
    return this
}

Subscription.prototype.close = function () {
    var self = this
    Object.keys(this._listeners).forEach(function (evName) {
        self._bus.removeListener(evName, self._listeners[evName])
    })
}

Subscription.use = function (fn) {
    function ExtendedSubscription (store, bus, opts) {
        if (!(this instanceof ExtendedSubscription)) {
            return new ExtendedSubscription(store, bus, opts)
        }
        Subscription.apply(this, arguments)
        fn(this)
    }
    inherits(ExtendedSubscription, Subscription)
    return ExtendedSubscription
}

module.exports = Subscription

