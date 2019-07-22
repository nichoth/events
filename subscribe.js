var mxtend = require('xtend/mutable')
var inherits = require('inherits')
function id (ev) {
    return ev
}

function Subscription (store, bus, opts) {
    if (!(this instanceof Subscription)) {
        return new Subscription(store, bus, opts)
    }
    mxtend(this, opts || {})
    this.store = store
    this.bus = bus
    this._listeners = {}
}

Subscription.prototype.map = id

Subscription.prototype.on = function (ev, fn) {
    var self = this
    this.bus.on(ev, listener)

    function listener (data) {
        if (typeof fn === 'function') {
            return fn.call(self.store, self.map.call(self, data, ev, fn.name))
        }
        // `fn` is string
        self.store[fn](self.map.call(self, data, ev, fn))
    }

    var oldListener = this._listeners[ev]
    if (oldListener) this.bus.removeListener(ev, oldListener)
    this._listeners[ev] = listener
    return this
}

Subscription.prototype.close = function () {
    var self = this
    Object.keys(this._listeners).forEach(function (evName) {
        self.bus.removeListener(evName, self._listeners[evName])
    })
}

Subscription.extend = function (fn, _opts, _super) {
    if (typeof fn === 'object') {
        _opts = fn
        fn = function noop () {}
    }

    function ExtendedSubscription (store, bus, opts) {
        if (!(this instanceof ExtendedSubscription)) {
            return new ExtendedSubscription(store, bus, opts)
        }
        (_super || Subscription).apply(this, arguments)
        fn.apply(this, arguments)
    }
    inherits(ExtendedSubscription, _super || Subscription)

    mxtend(ExtendedSubscription.prototype, _opts || {})

    ExtendedSubscription.extend = function (fn, opts) {
        return Subscription.extend(fn, opts, ExtendedSubscription)
    }
    return ExtendedSubscription
}

module.exports = Subscription

