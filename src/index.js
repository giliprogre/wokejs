import woke from './js/woke'
import createJoke from "./js/createJoke"
import "./styles/main.scss"
import logo from './assets/logo.jpg'
import Video from './js/video'

woke.awake = () => {

    /*
    const jokeBtn = document.getElementById("jokeBtn")
    jokeBtn.addEventListener('click', createJoke)

    createJoke()
    */
    return (
        <div>
            <img id="laughImg" alt="" src={logo}/>
            <h3>You're a fucking white male!</h3>
            <br />
            {Video()}
            <br />
            {createJoke()}
            <br />
        </div>
    )
}

woke.run("woke")