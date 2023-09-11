import { FunctionComponent, render } from 'preact'
import { useMemo } from 'preact/hooks'
import { Bus } from '../src/index.js'
import { useSignal } from '@preact/signals'

// bus is created *outside* the render loop
const bus = new Bus('example')

let parentRenders = 0
let childRenders = 0

/**
 * Child knows nothings about its event namespace. It only knows its local
 * event names.
 */
function Child ({ emit, state }):FunctionComponent {
    childRenders++

    return (<div className="child">
        <p>{state.value.hello}</p>
        <p>Child renders: {childRenders}</p>
        <p>
            <button onClick={emit.hello} data-message="hey there">
                say hello
            </button>
        </p>
    </div>)
}

Child.events = ['hello', 'foo']

// click should re-render the child component only, not the parent

function Example ():FunctionComponent {
    parentRenders++

    const state = useSignal({ hello: 'hello' })

    // handle subscriptions in `useMemo`, because we only want
    // this function to run once. This creates the state tree
    //
    // parent needs to know the event names that child components will emit
    const emitter = useMemo(() => {
        const emit = bus.emitter(Child.events, 'childEmitter')

        bus.on(emit.events.hello, ev => {
            ev.preventDefault()
            const msg = ev.target.dataset.message
            state.value = { hello: msg }
        })

        return emit
    }, [])

    return (<div>
        <p>
            Notice the state & logic are controlled by the parent component, but
            changing the state does not cause the parent to re-render, only
            the child.
        </p>

        <p>
            This is different than using <code>useState</code> in the parent
            component, which would cause a full re-render of every component.
        </p>

        <p>
            Because of the `signal` model, the state is never updated -- it is
            always a tree of objects. The object values are the only part of
            state that changes, thus only the child re-renders since that is
            the only place we read the value of the signal.
        </p>

        <p>
            This model of Signals + a single state store 
            allows us to keep the top-down flow
            of application state. That is important because if you simply
            update state from
            anywhere in the view tree (which is possible -- we are simply
            setting a value), then you lose the uni-directional flow of state +
            events. That is the sole benefit of something like React. Otherwise
            we are back to two-directional data, aka the thing that made
            client-side programming difficult in the past.
        </p>

        <p>parentRenders: {parentRenders}</p>
        <Child emit={emitter} state={state} />
    </div>)
}

render(<Example />, document.getElementById('root')!)
