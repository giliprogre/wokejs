import woke from './js/woke'
import Hello from './js/Hello'
import "./styles/main.scss"
//import Joke from "./js/Joke"
//import logo from './assets/logo.png'
//import Video from './js/Video'

woke.app = () => {

    /*
    return (
        <div>
            <img id="laughImg" alt="" src={logo} />
            <br />
            {Video()}
            <br />
            {Joke()}
            <br />
        </div>
    )
    */

    /*
    return (
        <div>
            <Hello />
        </div>
    )
    */

    /*
   return (
    <p>hello</p>
   )
    */

    /*
    return (
        <div>
            <p>hello</p>
        </div>
    )
    */
   
    /*
    return (
        <>
            <p>hello</p>
        </>
    )
    */

    /*
    return (
        <div>
            <p>hello</p>
            <p>world</p>
        </div>
    )
    */

    return (
        <div>
            <>
                <p>hello</p>
                <p>world</p>
            </>
        </div>
    )
}

woke.awake("root")
//woke.tarnishVDOM()