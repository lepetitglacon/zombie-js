import './lobby.css'

import {useContext, useEffect, useRef, useState} from "react";
import { useParams } from 'react-router-dom'

import axios from "axios";
import moment from "moment";

import Socket from "../../../socket/Socket";
import ENV from "../../../ENV";
import AuthContext from "../../../context/AuthContext";

function Lobby({socket}) {

    const {user} = useContext(AuthContext)

    const [maps, setMaps] = useState([])
    const [currentMap, setCurrentMap] = useState()
    const [countdown, setCountdown] = useState(null)
    const [countdownTimer, setCountdownTimer] = useState([])
    const [ready, setReady] = useState(true)
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])

    const chatTextareaRef = useRef()
    const chatUl = useRef()
    const readyButton = useRef()

    useEffect(() => {
        const fetchMaps = async () => {
            const res = await axios.get(ENV.SERVER_HOST + 'api/availableMaps', {
                withCredentials: true
            })
            if (res.data.success) {
                setMaps(res.data.maps)
            }
        }
        fetchMaps()
    }, [])

    useEffect(() => {
        socket.emit('init')
        socket.on('messages', onMessages)
        socket.on('message', onMessage)
        socket.on('player-connect', onPlayerConnect)
        socket.on('player-disconnect', onPlayerDisconnect)
        socket.on('game-counter', onGameCounter)
        socket.on('stop-game-counter', onStopGameCounter)
        return () => {
            socket.off('messages', onMessages)
            socket.off('message', onMessage)
            socket.off('player-connect', onPlayerConnect)
            socket.off('player-disconnect', onPlayerDisconnect)
            socket.off('game-counter', onGameCounter)
            socket.off('stop-game-counter', onStopGameCounter)
        }
    }, [])

    useEffect(() => {
        chatUl.current.scroll({ top: chatUl.current.scrollHeight, behavior: 'smooth' });
    }, [messages])

    useEffect(() => {
        if (countdown !== null) {
            const interval = setInterval(() => {
                if (countdown <= 1) {
                    setCountdown('LETSGO')
                    clearInterval(interval)
                } else {
                    setCountdown(count => count - 1)
                }
            }, 1000)
            setCountdownTimer(interval)

            return () => clearInterval(interval)
        }
    }, [countdown])

    const handleSendMessage = async () => {
        console.log('message')
        const message = chatTextareaRef.current.value
        if (message === '') return;
        await socket.emit('message', {
            userId: user._id.toString(),
            message: message,
            date: Date.now(),
        })
        chatTextareaRef.current.value = ''
        console.log('msg emitted')
    }

    const handleReady = async () => {
        await setReady(ready => !ready)
        console.log('ready', ready)
        socket.emit('player-ready', {
            ready: ready
        })
    }

    function onMessages(messages) {
        console.log('onMessages')
        setMessages(messages)
    }
    function onMessage(message) {
        console.log('onMessage')
        setMessages((msgs) => {
            return [...msgs, message]
        })
    }
    function onPlayers(players) {
        console.log('players', players); // true
        setUsers(players)
    }
    function onPlayerConnect(player) {
        console.log('player connected'); // true
        const userInArray = users.filter((user) => {
            return user._id.toString() !== player._id.toString()
        })
        setUsers([...userInArray, player])
        console.log(users)
    }
    function onPlayerDisconnect(player) {
        console.log('player disconnected'); // true
        const filteredUsers = users.filter((user) => {
            return user._id.toString() !== player._id.toString()
        })
        setUsers(filteredUsers)
    }
    function onGameCounter() {
        console.log('start countdown'); // true
        setCountdown(10)
    }
    function onStopGameCounter() {
        console.log('stop countdown'); // true
        setCountdown(null)
        clearInterval(countdownTimer)
    }

    return (
        <div>
            <h2>Lobby</h2>

            <div className="row">

                <div className="col">
                    <div>
                        <h3>Maps</h3>

                        <div id="carouselExampleSlidesOnly" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-inner">

                                {maps.map((map, i) => {
                                    return  <div key={map._id} className={i === 0 ? 'carousel-item active' : 'carousel-item'}>
                                        <img src={ENV.SERVER_HOST + 'assets/img/map-preview/' + map.preview}
                                             className="d-block img-preview" alt="..."/>
                                    </div>
                                })}

                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls"
                                    data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls"
                                    data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={!ready ? "btn btn-primary ready" : "btn btn-primary"} htmlFor="btn-check">Ready</label>
                        <input ref={readyButton}
                               onClick={handleReady}
                               type="checkbox"
                               className="btn-check"
                               id="btn-check"
                               autoComplete="off"/>
                    </div>

                    {countdown && <div>
                        <p>All players are ready</p>
                        <p>Starting game in <span>{countdown}</span></p>
                    </div>}

                </div>

                <div className="col">
                    <div>
                        <h3>Players</h3>
                        <ul>
                            {
                                users.map((user) => {
                                    return <li key={user._id} data-id={user._id}>{user.gamename}</li>
                                })
                            }
                        </ul>
                    </div>

                    <div>
                        <h3>Chat</h3>
                        <ul ref={chatUl} id="chat">
                            {messages.map(message => {
                                return <li key={message._id}>
                                        <span className="chat-date">
                                            [{moment(message.dateReceived).format('kk:mm:ss')}]
                                        </span>
                                    <span className="chat-username">{message.user.gamename}</span>
                                    <span className="chat-text">{message.text}</span>
                                </li>
                            })}
                        </ul>
                        <textarea ref={chatTextareaRef}></textarea>
                        <input type="submit" onClick={handleSendMessage} value="Send"></input>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Lobby;