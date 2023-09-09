// @ts-check

// type Listener = (data:any) => any

// export type Emitter<Evs extends ReadonlyArray<string>> = {
//     [Key in Evs[number]]:((data:any)=>void)
// } & ((name:string, data:any)=>void) & { events: Record<string, string> };

// export type Emitter<Evs extends ReadonlyArray<string>> = Record<
//     (Evs[number]),
//     ((data:any) => void)
// > & { events: Record<string, string> & ((name:string, data:any)=>void)}

// export type Emitter<Evs extends ReadonlyArray<string>> = (
//     ((name:string, data:any)=>void) &
//     Record<(Evs[number]), ((data:any) => void)> &
//     {
//         events: Record<string, string>;
//         createChild:(childEvs:string[], prefix)=>Emitter<typeof childEvs>;
//         _prefix:string;
//     }
// )

// export interface EmitFn<Evs extends ReadonlyArray<string>> {
//     (name:string, data:any):void;
//     // events:Record<keyof Evs, string>;
//     // events:{ [evName:string]:string }|null  // <-- { update: 'something.foo.update' }
//     events:{ [K in keyof Evs]:string }|null  // <-- { update: 'something.foo.update' }
//     _prefix:string;
//     createChild:(evs:string[], prefix:string) => EmitFn<typeof evs>
// }

// type Emitter<Evs extends ReadonlyArray<string>> = EmitFn<Evs> & {
//     [K in keyof Evs]:(data:any) => void
// }

export class Bus {
    _name
    _prefix
    _starListeners
    _listeners
    events  // <-- { update: 'something.foo.update' }

    constructor (name, allowedEvents) {
        if (!name) {
            name = allowedEvents
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

    on (eventName, listener) {
        if (eventName === '*') {
            this._starListeners.push(listener)
        } else {
            if (!this._listeners[eventName]) {
                this._listeners[eventName] = []
            }
            this._listeners[eventName].push(listener)
        }
        return this
    }

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
