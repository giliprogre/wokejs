import woke from './woke'

function Hello() {

    const countTo1 = () => {
        woke.debug("Counter1: %o", this.counter)
        if (this.counter < 1) {
            this.increment()
            //setTimeout(countTo10, 1000)
        }
    }

    //countTo1()

    return (
        <div>
            <p>{this.test}</p>
            <p>2nd paragraph</p>
            <button onClick={this.tarnishComponent}>Click</button>
        </div>
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
