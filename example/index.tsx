import { FunctionComponent, render } from 'preact'
import { useMemo } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { Bus } from '../src/index.js'

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

    // state here is decoupled from the view tree
    const state = useSignal({ hello: 'hello' })

    // handle subscriptions in `useMemo`, because we only want
    // this function to run once. This creates the state tree
    //
    // parent needs to know the event names that child components will emit
    const emitter = useMemo(() => {
        const child = bus.emitter(Child.events, 'childEmitter')

        bus.on(child.events.hello, ev => {
            ev.preventDefault()
            const msg = ev.target.dataset.message
            state.value = { hello: msg }
        })

        return child
    }, [])

    return (<div>
        <p>parentRenders: {parentRenders}</p>
        <Child emit={emitter} state={state} />
    </div>)
}

render(<Example />, document.getElementById('root')!)
