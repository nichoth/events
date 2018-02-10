function Subscription (store, bus) {
    if (!(this instanceof Subscription)) return new Subscription(store, bus)
    this._store = store
    this._bus = bus
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

module.exports = Subscription

