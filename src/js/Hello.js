import woke from './woke'

function Hello() {

    const countTo2 = () => {
        woke.debug("Counter1: %o", this.counter)
        if (this.counter < 2) {
            this.increment()
        }
    }

    countTo2()

    return (
        <>
            <p>{this.test}</p>
            <p>2nd paragraph</p>
            <p>{this.counter}</p>
            <button onClick={this.tarnishComponent}>Click</button>
        </>
    )
}

Hello.defaultState = class extends woke.State {
    #pronouns = "he/him/his"
    get pronouns() { return this.#pronouns }

    #test = 'Hello, World!'
    get test() { return this.#test }
    set test(_test) { this.tarnishComponent(); this.#test = _test }

    #counter = 0
    get counter() { return this.#counter }
    set counter(_counter) { woke.debug("Setting counter"); this.tarnishComponent(); this.#counter = _counter }
    increment() { this.counter = this.counter + 1 }
}

export default Hello
