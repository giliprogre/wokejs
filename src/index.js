import woke from './js/woke'
import Joke from "./js/Joke"
import "./styles/main.scss"
import logo from './assets/logo.png'
import Video from './js/Video'

woke.app = () => {

    return (
        <div>
            <img id="laughImg" alt="" src={logo}/>
            <br />
            {Video()}
            <br />
            {Joke()}
            <br />
        </div>
    )
}

woke.awake("woke")