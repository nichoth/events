interface Listener {
    (any): any
}

interface StarListener {
    (evName:string, data:any): any
}

export type Events = ({ _?:string[] } & { [k:string]:Events }|string[])

export type NamespacedEvents = {
    [key:string]:string|NamespacedEvents
}

export class Bus {
    _starListeners:StarListener[]
    _listeners:Record<string, Listener[]>

    /**
     * @constructor
     */
    constructor () {
        this._starListeners = []
        this._listeners = {}
    }

    /**
     * Create an object with leaf nodes as fully namespaced strings.
     * @param evs An object of events
     * @returns A new object with the leaves as namespaced strings
     */
    static createEvents (events:Events, prefix?:string):NamespacedEvents {
        return (Array.isArray(events) ?
            // if lastPrefix is _,
            // then `events` is array
            (events.reduce((acc, ev) => {
                acc[ev] = (prefix ? prefix + '.' + ev : ev)
                return acc
            }, {})) :

            // events is object
            (Object.keys(events).reduce((acc, evName) => {
                if (evName === '_') {
                    return Object.assign(
                        acc,
                        Bus.createEvents(events[evName] as string[], (prefix || ''))
                    )
                }

                acc[evName] = Bus.createEvents(events[evName], (prefix ?
                    (prefix + '.' + evName) :
                    evName
                ))

                return acc
            }, {}))
        )
    }

    /**
     * Listen for an event
     * @param {string} evName Name of the event, or '*' for all events
     * @param listener Function to call with the event
     * @returns {()=>void} function `off` -- call this to remove the listener
     */
    on (evName:string, listener:Listener|StarListener):() => void {
        if (evName === '*') {
            this._starListeners.push(listener)
        } else {
            if (!this._listeners[evName]) this._listeners[evName] = []
            this._listeners[evName].push(listener as Listener)
        }

        const self = this

        return function off () {
            if (evName === '*') {
                const i = self._starListeners.findIndex(fn => {
                    return fn === listener
                })
                const newArr = Array.from(self._starListeners)
                newArr.splice(i, 1)
                self._starListeners = newArr
            } else {
                const listeners = self._listeners[evName]
                const i = listeners.findIndex(fn => {
                    return fn === listener
                })
                const newArr = Array.from(self._listeners[evName])
                newArr.splice(i, 1)
                self._listeners[evName] = newArr
            }
        }
    }

    /**
     * Emit an event.
     * @param {string} evName The event name to emit
     * @param {any} data The data to pass to event listeners
     */
    emit (evName:string, data:any) {
        const listeners = this._listeners[evName] || []

        if (listeners && listeners.length > 0) {
            this._emit(listeners, evName, data, false)
        }

        if (this._starListeners.length > 0) {
            this._emit(this._starListeners, evName, data, true)
        }
    }

    _emit (arr:Listener[]|StarListener[], evName:string, data:any, isStar:boolean) {
        if (arr.length === 0) return

        if (isStar) {
            this._starListeners.forEach(listener => {
                (listener as StarListener).call(listener, evName, data)
            })
            return
        }

        arr.forEach(listener => {
            (listener as Listener).call(listener, data)
        })
    }
}
