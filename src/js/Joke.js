import woke from './woke'
import axios from 'axios'

function Joke() {

    return (
        <>
            <div id="joke" class="joke">{this.jokeText}</div>
            <button id="jokeBtn" onClick={() => { this.getJoke() }} class="btn">Get a new joke</button>
        </>
    )
}

Joke.defaultState = class extends woke.State {
    #pronouns = "he/him/his"
    get pronouns() { return this.#pronouns }

    #jokeText = ''
    get jokeText() { return this.#jokeText }
    set jokeText(_jokeText) { this.#jokeText = _jokeText; this.tarnishComponent() }
    getJoke() {
        const config = {
            headers: {
                Accept: 'application/json'
            }
        }

        axios.get('https://icanhazdadjoke.com', config).then(res => {
            this.jokeText = res.data.joke
        })
    }
}

export default Joke
