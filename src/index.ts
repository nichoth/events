interface Listener {
    (any):any
}

interface StarListener {
    (evName:string, data:any): any
}

type ValuesOf<T extends any[]>= T[number];
// type AllowedEvent<T extends Array<string>> = ValuesOf<T>

// interface Emitter<T extends string[]> {
//     on<K extends AllowedEvent<T>>
//       (eventName: K, fn: Listener): any;
//     emit<K extends AllowedEvent<T>>
//       (eventName:K, params:any): void;
// }

export type Events = ({ _?:string[] } & { [k:string]:Events }|string[])

export type NamespacedEvents = {
    [key:string]:string|NamespacedEvents
}

// type Flatten<T> = T extends string[] ? T[number] : T;

// export class Bus<T extends Array<string>> /* implements Emitter<T> */ {
export class Bus<T extends Array<string>> /* implements Emitter<T> */ {
    _starListeners:StarListener[];
    _listeners:Record<string, Listener[]>;
    _validEvents:T|null;
    // _validEvents:ValuesOf<T>|null;
    // _validEvents:AllowedEvent<T>|null;
    // _validEvents:Flatten<T>|null;
    // _validEvents:T[number]|null;

    /**
     * @constructor
     * @param {EvNames} [validEvents] An array of valid event names.
     * Will throw if you emit or listen for an event not in the list.
     */
    constructor (validEvents?:T|NamespacedEvents) {
        this._starListeners = []
        this._listeners = {}
        this._validEvents = null
        if (validEvents) {
            this._validEvents = (Array.isArray(validEvents) ?
                validEvents :
                Bus.flatten<T>(validEvents))
        }
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
     * Return an array of leaf nodes of an object. Use this to get an array
     * of event names from a given nexted object of event names.
     * @param events Namespaced events (the return value of `Bus.createEvents`)
     * @param {string[]} [existing] Previous array to concat with
     * @returns {string[]}
     */
    static flatten<T extends string[]> (
        events:NamespacedEvents|string,
        existing:string[] = []
    ):T {
        if (typeof events === 'string') {
            return ((existing).concat([events as T[number]])) as T
        }

        return Object.keys(events).reduce((acc, key) => {
            return Bus.flatten(events[key], acc)
        }, existing as T) as const
    }

    /**
     * Listen for an event
     * @param {T} evName Name of the event, or '*' for all events
     * @param listener Function to call with the event
     * @returns {()=>void} function `off` -- call this to remove the listener
     */
    // on (evName:string, listener:Listener|StarListener):() => void {
    on (evName:ValuesOf<T>|'*', listener:Listener|StarListener):() => void {
        if (evName === '*') {
            this._starListeners.push(listener)
        } else {
            if (this._validEvents && !this._validEvents.includes(evName)) {
                throw new Error('Invalid event name subscribed to')
            }

            if (!this._listeners[evName]) this._listeners[evName] = []
            this._listeners[evName].push(listener as Listener)
        }

        const self = this

        return function off () {
            if (evName === '*') {
                self._starListeners = self._starListeners.filter(fn => {
                    return fn !== listener
                })
            } else {
                self._listeners[evName] = self._listeners[evName].filter(fn => {
                    return fn !== listener
                })
            }
        }
    }

    /**
     * Emit an event.
     * @param {T[number]} evName The event name to emit
     * @param {any?} data The data to pass to event listeners
     */
    emit (evName:T[number], data?:any):any {
        const self = this

        if (this._validEvents && !this._validEvents.includes(evName)) {
            throw new Error('Invalid event name emitted')
        }

        // curry
        if (data === undefined) {
            return function (data:any) {
                return self.emit(evName, data)
            }
        }

        const listeners = this._listeners[evName] || []

        if (listeners && listeners.length > 0) {
            this._emit(listeners, evName, data, false)
        }

        if (this._starListeners.length > 0) {
            this._emit(this._starListeners, evName, data, true)
        }

        return this
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
