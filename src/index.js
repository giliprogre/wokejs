import woke from './js/woke'
import createJoke from "./js/createJoke"
import "./styles/main.scss"
import logo from './assets/logo.png'
import Video from './js/video'

woke.awake = () => {

    return (
        <div>
            <img id="laughImg" alt="" src={logo}/>
            <br />
            {Video()}
            <br />
            {createJoke()}
            <br />
        </div>
    )
}

woke.run("woke")