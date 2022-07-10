import woke from './woke'

function Hello() {

    const countTo2 = () => {
        if (this.counter < 2) {
            this.increment()
        }
    }

    countTo2()

    /*
    return (
        <>
            <p>{this.counter}</p>
        </>
    )
    */

    return (
        <>
            <p>{this.test}</p>
            <p>2nd paragraph</p>
            <p>{this.counter}</p>
            <button class="btn" onClick={() => {this.increment()}}>Click</button>
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
    set counter(_counter) { this.#counter = _counter; this.tarnishComponent(); }
    increment() {
        this.counter = this.counter + 1
    }
}

export default Hello
