import woke from './woke'
import axios from 'axios'

let jokeText = ""

function createJoke() {

    const getJoke = () => {
        console.log('executing getJoke()')
        const config = {
            headers: {
                Accept: 'application/json'
            }
        }

        axios.get('https://icanhazdadjoke.com', config).then(res => {
            console.log('resetting joke\'s inner html')
            //document.getElementById('joke').innerHTML = res.data.joke
            console.log("The previous content of jokeTest was: %s", jokeText)
            jokeText = res.data.joke
            console.log("Now the content of jokeTest is: %s", jokeText)
        })
    }

    return (
        <div>
            <div id="joke" class="joke">{jokeText}</div>
            <button id="jokeBtn" onEvent={['click', getJoke]} class="btn">Get a new joke</button>
        </div>
    )
}

export default createJoke