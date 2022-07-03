import woke from './woke'
import axios from 'axios'

function createJoke() {
    
    const getJoke = () => {
        const config = {
            headers: {
                Accept: 'application/json'
            }
        }

        axios.get('https://icanhazdadjoke.com', config).then(res => {
            document.getElementById('joke').innerHTML = res.data.joke
        })
    }

    getJoke()

    return (
        <div>
            <div id="joke" class="joke"></div>
            <button id="jokeBtn" onClick="getJoke" class="btn">Get a new joke</button>
        </div>
    )
}

export default createJoke