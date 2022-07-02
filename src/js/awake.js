import createJoke from "./createJoke"
import "../styles/main.scss"
import logo from '../assets/logo.jpg'

const awake = () => {
    const laughImg = document.getElementById("laughImg")
    laughImg.src = logo

    const jokeBtn = document.getElementById("jokeBtn")
    jokeBtn.addEventListener('click', createJoke)

    createJoke()
}

export default awake