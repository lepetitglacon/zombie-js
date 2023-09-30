import './mainlobby.css'

import {useContext, useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Cookies from "js-cookie";

import LoadingSpinner from "../utils/LoadingSpinner.js";
import ENV from "../../ENV.js";
import {useVolume} from "../../context/AudioContext.js";


function MainLobby() {

    const {play} = useVolume()

    const refreshCooldown = 5000

    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now())

    const navigate = useNavigate();
    const refreshBtnRef = useRef(null)
    const createGameInput = useRef(null)

    useEffect(() => {
        let controller = new AbortController();

        getGamesFromServer(controller)

        return () => {
            // controller.abort()
            // console.log('axios stopped')
        }
    }, [])

    useEffect(() => {
        play()

        return () => {

        }
    }, [])

    async function getGamesFromServer(controller) {
        setLoading(true)
        try {
            const res = await fetch('http://localhost:39000/lp/refresh', {signal: controller.signal})
            const data = await res.json()
            setGames(data)
        } catch (e) {
            console.error(e)
        }
        setLastRefreshTime(Date.now())
        setLoading(false)
    }

    const handleCreateGame = async () => {
        const res = await fetch(ENV.SERVER_HOST + 'api/game/create', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: createGameInput.current.value,
                private: false
            }),
            credentials: 'include',
            withCredentials: true,
        })
        const data = await res.json()
        console.log(data)

        if (data.success) {
            navigate('/game/' + data.gameId)
        } else {

        }
    }

    return (
        <div id="landing-page" className="container-fluid h-100">

            <div className="row d-flex h-100">

                <div className="col d-flex flex-column justify-content-around">
                    <div className="row">
                        <div className="col d-flex">

                            <h1>Z3D</h1>
                            <img src="/img/logo.png"/>

                        </div>
                    </div>

                    <div className="row">
                        {/*<*/}
                        {/*%- include('partials/mainMenu', {user: user}) %>*/}
                    </div>

                    <div className="row d-flex flex-start">

                        <div className="col">
                            <h2>Last update</h2>
                            <div className="d-flex flex-column">
                                <img src="http://localhost:39000/assets/img/128.png" width="200"/>
                                <a href="https://google.fr">See more</a>
                            </div>
                        </div>
                        <div className="col">
                            <h2>Patch note</h2>
                            <div className="d-flex flex-column">
                                <img src="http://localhost:39000/assets/img/128.png" width="200"/>
                                <a href="https://google.fr">See more</a>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="col">

                    <div className="row">
                        <div className="col">
                            <div className="input-group mb-3">
                                <button className="btn btn-danger"
                                        type="button"
                                        onClick={handleCreateGame}
                                >Create room</button>

                                <input
                                    id="create-game-title"
                                    type="text"
                                    className="form-control"
                                    ref={createGameInput}
                                    placeholder=""
                                    aria-label="Example text with button addon"
                                    aria-describedby="button-addon1"/>

                                    <span className="input-group-text text-danger">Private</span>
                                    <div className="input-group-text">
                                        <input
                                            id="create-game-private"
                                            className="form-check-input mt-0"
                                            type="checkbox"
                                            value=""
                                            aria-label="Checkbox for following text input"/>
                                    </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">

                        <div className="row">
                            <div className="col d-flex justify-content-between">
                                <h2>Public games</h2>
                                <button ref={refreshBtnRef} onClick={getGamesFromServer} className="btn btn-secondary m-1" >{loading && <LoadingSpinner/>}Refresh</button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">

                                <table id="games-table" className="table table-dark">
                                    <thead>
                                    <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col">Players</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody id="public-games-tbody">

                                    {
                                        games.length > 0
                                            ? games.map(game => {
                                                    return (
                                                        <tr key={game._id}>
                                                            <td>{game.name}</td>
                                                            <td>{game.players.size ?? 0}</td>
                                                            <td><Link to={'/game/' + game._id} className="btn btn-danger">Join</Link></td>
                                                        </tr>
                                                    )
                                                })
                                            :
                                            <tr>
                                                <td colSpan="3">No public games available, create one using the button above</td>
                                            </tr>
                                    }

                                    </tbody>
                                </table>

                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default MainLobby;