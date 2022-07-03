import woke from './woke'
import axios from 'axios'

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
            document.getElementById('joke').innerHTML = res.data.joke
        })
    }

    getJoke()

    return (
        <div>
            <div id="joke" class="joke"></div>
            <button id="jokeBtn" onClick={getJoke} class="btn">Get a new joke</button>
        </div>
    )
}

export default createJoke