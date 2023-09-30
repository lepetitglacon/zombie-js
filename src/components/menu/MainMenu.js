import './mainmenu.css'

import {useContext, useState} from "react";
import {Link} from "react-router-dom";
import AuthContext from "../../context/AuthContext.js";
import LogoutButton from "../auth/logout/LogoutButton.js";
import ENV from "../../ENV.js";
import {useVolume} from "../../context/AudioContext.js";

function MainMenu() {

    const {user} = useContext(AuthContext)
    const {toggleMute} = useVolume()

    const [buttons, setButtons] = useState([
        {id: 0, title: 'Lobby', link: '/'},
        {id: 1, title: 'Profile', link: '/me'},
        {id: 2, title: 'Leaderboard', link: '/leaderboard'},
        {id: 3, title: 'Settings', link: '/settings'},
    ])

    const handleClick = (e, id) => {
        let btns = [...buttons]
        btns.forEach(btn => {
            btn.active = btn.id === id;
        })
        setButtons(btns)
    }

    return (

        <nav className="navbar navbar-expand navbar-dark bg-dark">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">Navbar</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                        {buttons.map(button => {
                            return <li key={button.id} className="nav-item">
                                <Link
                                    to={button.link}
                                    onClick={(e) => {handleClick(e, button.id)}}
                                    className={button.active ? 'active nav-link' : 'nav-link'}>
                                    {button.title}
                                </Link>
                            </li>
                        })}

                    </ul>
                </div>

                <div className="right d-flex">

                    <div id="audio-mute-button-container"
                        className="d-flex justify-content-center align-items-center"
                         onClick={() => toggleMute()}
                    >
                        <img id="audio-mute-button" src={ENV.SERVER_HOST + 'assets/img/icons/mute.png'} width="24"/>
                    </div>

                    {user && <LogoutButton/>}
                    {/*<input*/}
                    {/*    type="range"*/}
                    {/*    min="0"*/}
                    {/*    max="1"*/}
                    {/*    step="0.01"*/}
                    {/*    value={}*/}
                    {/*    onChange={}*/}
                    {/*/>*/}

                </div>

            </div>
        </nav>
    );
}

export default MainMenu;