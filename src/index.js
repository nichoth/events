// @ts-check
import removeItems from './remove-array-items.js'

export class Bus {
    _name
    _prefix
    _starListeners
    _listeners
    events  // <-- { update: 'something.foo.update' }

    /**
     * @constructor
     * @param {string} name Name for this. This is not used currently.
     * @param {string[]} [allowedEvents] Array of event names that may
     * be emitted
     */
    constructor (name, allowedEvents) {
        if (!allowedEvents) {
            allowedEvents = null
        }
        this._name = name
        this._listeners = {}
        this._starListeners = []
        this._prefix = ''
        this.events = (allowedEvents ? Bus.createEvents(allowedEvents, '') : null)
    }

    static createEvents (evs, prefix) {
        return evs.reduce((acc, ev) => {
            acc[ev] = (prefix ? (prefix + '.' + ev) : ev)
            return acc
        }, {})
    }

    /**
     * Create an event emitter function
     * Return a function that will emit events on this bus
     *   - has emit functions indexed by event name
     *   - `events` -- an object of valid event names
     * @param {string[]} evs A list of event names that may be emitted
     * @param {string} prefix A string with which to namespace this event emitter
     * @returns A function that will emit events on the parent bus when called.
     * Also it includes emit functions that are indexed as properties of
     * event names on the function.
     */
    emitter (evs, prefix) {
        const evNames = Bus.createEvents(evs, prefix)
        const self = this

        function emitFn (evName, data) {
            self.emit(prefix ? (prefix + '.' + evName) : evName, data)
        }

        // attach all the emit functions, indexed by event name
        const fn = evs.reduce((acc, evName) => {
            acc[evName] = (data) => {
                self.emit(evNames[evName], data)
            }
            return acc
        }, emitFn)

        // attach other properties to the function
        const newEmitter = Object.assign(fn, {
            _prefix: prefix || '',
            events: evNames,
            createChild: function (events, prefix) {
                return self.emitter(events, newEmitter._prefix + '.' + prefix)
            }
        })

        return newEmitter
    }

    /**
     * Subscribe to event names.
     * @param {string} eventName Event name to listen for
     * @param {(data) => void} listener Function to call on `eventName`
     * @returns {()=>void} A function that will unsibscribe the given listener.
     */
    on (eventName, listener) {
        let starIndex = null
        let index = null
        const self = this

        if (eventName === '*') {
            starIndex = (self._starListeners.push(listener) - 1)
        } else {
            if (!self._listeners[eventName]) {
                self._listeners[eventName] = []
            }
            index = (self._listeners[eventName].push(listener) - 1)
        }

        function off () {
            if (eventName === '*') {
                removeItems(self._starListeners, starIndex, 1)
                return self
            } else {
                removeItems(self._listeners[eventName], index, 1)
            }
        }

        return off
    }

    /**
     * Emit an event.
     * @param {string} evName The event name to emit
     * @param {any} data The data to pass to event listeners
     */
    emit (evName, data) {
        const listeners = this._listeners[evName]

        if (listeners && listeners.length > 0) {
            this._emit(this._listeners[evName], evName, data, false)
        }

        if (this._starListeners.length > 0) {
            this._emit(this._starListeners, evName, data, true)
        }
    }

    _emit (arr, evName, data, isStar) {
        if (arr.length === 0) return

        if (isStar) {
            data = [evName].concat(data)
            this._starListeners.forEach(listener => {
                listener.apply(listener, [evName].concat([data]))
            })
            return
        }

        const length = arr.length
        for (let i = 0; i < length; i++) {
            const listener = arr[i]
            listener(data)
        }
    }
}
