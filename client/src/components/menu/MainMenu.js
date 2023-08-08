import {useContext, useState} from "react";
import {Link} from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import LogoutButton from "../auth/logout/LogoutButton";

function MainMenu() {

    const {user} = useContext(AuthContext)

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

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
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

                {user && <LogoutButton/>}

            </div>
        </nav>
    );
}

export default MainMenu;