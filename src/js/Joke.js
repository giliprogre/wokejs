import woke from './woke'
import axios from 'axios'

function Joke() {

    return (
        <>
            <div id="joke" class="joke">{this.jokeText}</div>
            <button id="jokeBtn" onClick={() => {console.log("click")}} class="btn">Get a new joke</button>
        </>
    )
}

Joke.defaultState = class extends woke.State {
    #pronouns = "he/him/his"
    get pronouns() { return this.#pronouns }

    jokeText = ''
    get jokeText() { return this.jokeText }
    set jokeText(_jokeText) { this.tarnishComponent(); this.jokeText = _jokeText }
    getJoke() {
        woke.debug("Previous 'this.jokeTest': %o", this)
        woke.print("JOKE - CALLBACK - Getting new Joke")
        const config = {
            headers: {
                Accept: 'application/json'
            }
        }

        axios.get('https://icanhazdadjoke.com', config).then(res => {
            woke.print("JOKE - CALLBACK - Got a new Joke text: %o", res.data.joke)
            woke.print("JOKE - CALLBACK - Setting new Joke text")
            woke.debug("Storing into 'this.jokeTest': %o", this)
            this.jokeText = res.data.joke
        })
    }
}

export default Joke
