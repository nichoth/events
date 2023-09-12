interface Listener {
    (any): any
}

interface StarListener {
    (evName:string, data:any): any
}

// type Events = Record<string, any[]|Events>

// type EventArr = {
//     [_:'_']: string[]
// }

// type Events = Partial<EventArr & {
//     [key:string]: Events
// }> | string[]

// interface Events extends EventArr {
//     [key:string]:Events
// }

// interface Events {
//     _:string[],
//     [key:string]:Events|undefined
// }

// type Events = Partial<{
//     _:string[],
//     [key:string]:Events|undefined
// } | { [key:string]:Events }>

// type Events = {
//     _:string[],
//     [key:string]:Events|undefined
// }

// type Key = '_'
// const key:Key = '_'

type _ = '_'

type Events = {
    [k in _]: string
}

// type Events = Partial<EventArr & {
//     [key:string]:Events
// }>

type NamespacedEvents = {
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
    static createEvents (events:Events, prefix:string):NamespacedEvents {
        return Object.keys(events).reduce((acc, key) => {
            if (key === '_') {
                // namespace event names
                // return an object of strings: [a,b,c] => { a:'a', b:'b', c:'c'}
                return (events[key] as string[]).reduce((_acc, val) => {
                    _acc[val] = (prefix ? prefix + '.' + val : val)
                    return _acc
                }, {})
            }

            // can pass an array as a node
            // { a: { b: ['foo', 'bar'] } }
            if (Array.isArray(events[key])) {
                return (events[key] as string[]).reduce((_acc, ev) => {
                    acc[ev] = (prefix + '.' + ev)
                    return acc
                }, {})
            }

            // key is not _, and not array
            acc[key] = Bus.createEvents(events[key] as Events, key)
            return acc
        }, {})

        /**
         * { a: {
         *     _: ['a', 'b', 'c'],
         *     b: {
         *       c: {
         *         _: ['d', 'e', 'f']
         *       }
         *     }
         *   }
         * }
         */

        // return evs.reduce((acc, ev) => {
        //     acc[ev] = (prefix ? (prefix + '.' + ev) : ev)
        //     return acc
        // }, {})
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
            this._listeners[evName].push(listener as Listener)
        }

        const self = this

        return function off () {
            if (evName === '*') {
                const i = self._starListeners.findIndex(fn => {
                    return fn === listener
                })
                self._starListeners.splice(i, 1)
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
        const listeners = this._listeners[evName]
        const self = this

        if (listeners && listeners.length > 0) {
            self._emit(listeners, evName, data)
        }

        if (this._starListeners.length > 0) {
            self._emit(this._starListeners, evName, data)
        }
    }

    _emit (arr:Listener[]|StarListener[], evName:string, data:any) {
        if (arr.length === 0) return

        if (evName === '*') {
            data = [evName].concat(data)
            this._starListeners.forEach(listener => {
                listener.call(listener, evName, data)
            })
            return
        }

        arr.forEach(listener => {
            (listener as Listener).call(listener, data)
        })
    }
}
