import woke from './woke'
import axios from 'axios'

let jokeText = ""

function Joke() {

    const getJoke = () => {
        const config = {
            headers: {
                Accept: 'application/json'
            }
        }

        axios.get('https://icanhazdadjoke.com', config).then(res => {
            jokeText = woke.updateState(res.data.joke)
        })
    }

    return (
        <div>
            <div id="joke" class="joke">{jokeText}</div>
            <button id="jokeBtn" onEvent={['click', getJoke]} class="btn">Get a new joke</button>
        </div>
    )
}

export default Joke
