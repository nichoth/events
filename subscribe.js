function Subscription (store, bus) {
    if (!(this instanceof Subscription)) return new Subscription(store, bus)
    this._store = store
    this._bus = bus
    this._listeners = []
}

Subscription.prototype.on = function (ev, fn) {
    var self = this
    this._bus.on(ev, listener)

    function listener (data) {
        if (typeof fn === 'function') return fn.call(self._store, data)
        self._store[fn](data)
    }

    this._listeners.push([ev, listener])
    return this
}

Subscription.prototype.close = function () {
    var self = this
    this._listeners.forEach(function (l) {
        self._bus.removeListener(l[0], l[1])
    })
}

// convenient event name curry
Subscription.withEvents = function (evs) {
    return function (store, bus) {
        var sub = Subscription(store, bus)
        Object.keys(evs).forEach(function (k) {
            sub.on(evs[k], k)
        })
        return sub
    }
}

module.exports = Subscription

