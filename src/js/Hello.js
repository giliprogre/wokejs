import woke from './woke'

function Hello() {

    return (
        <div>
            <p>{this.test}</p>
            <p>2nd paragraph</p>
        </div>
    )
}

Hello.defaultState = class extends woke.State {
    #test = 'Hello, World!'
    get test() { return this.#test }
    set test(_test) { this.tarnishComponent(); this.#test = _test }
}

export default Hello
