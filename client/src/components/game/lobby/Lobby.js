import './lobby.css'

import {useContext, useEffect, useRef, useState} from "react";

import axios from "axios";
import moment from "moment";

import ENV from "../../../ENV";
import AuthContext from "../../../context/AuthContext";

function Lobby({socket}) {

    const {user} = useContext(AuthContext)

    const [maps, setMaps] = useState([])
    const [currentMap, setCurrentMap] = useState()
    const [isOwner, setIsOwner] = useState()
    const [countdown, setCountdown] = useState(null)
    const [countdownTimer, setCountdownTimer] = useState([])
    const [ready, setReady] = useState(true)
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])

    const chatContainerRef = useRef()
    const chatTextareaRef = useRef()
    const readyButton = useRef()

    useEffect(() => {
        const fetchMaps = async () => {
            try {
                const res = await axios.get(ENV.SERVER_HOST + 'api/availableMaps', {
                    withCredentials: true
                })
                if (res.data.success) {
                    setMaps(res.data.maps)
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchMaps()
        return () => {
            // TODO cancel fetch
        }
    }, [])

    useEffect(() => {
        socket.emit('init')
        socket.on('messages', onMessages)
        socket.on('message', onMessage)
        socket.on('players', onPlayers)
        socket.on('player-connect', onPlayerConnect)
        socket.on('player-disconnect', onPlayerDisconnect)
        socket.on('game-counter', onGameCounter)
        socket.on('stop-game-counter', onStopGameCounter)
        socket.on('owner', onOwner)
        return () => {
            console.log('clear listeners')
            socket.off('messages', onMessages)
            socket.off('message', onMessage)
            socket.off('players', onPlayers)
            socket.off('player-connect', onPlayerConnect)
            socket.off('player-disconnect', onPlayerDisconnect)
            socket.off('game-counter', onGameCounter)
            socket.off('stop-game-counter', onStopGameCounter)
            socket.off('owner', onOwner)
        }
    }, [])

    useEffect(() => {
        chatContainerRef.current.scroll({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
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

        // reset textarea
        chatTextareaRef.current.selectionStart = 0;
        chatTextareaRef.current.selectionEnd = 0;
        chatTextareaRef.current.value = null
        console.log('msg emitted')
    }

    const handleReady = async () => {
        await setReady(ready => !ready)
        console.log('ready', ready)
        socket.emit('player-ready', {
            ready: ready
        })
    }

    const handleChatInput = () => {
        chatTextareaRef.current.style.height = "auto"
        chatTextareaRef.current.style.height = `${chatTextareaRef.current.scrollHeight}px`
    }

    const handleChatKeys = (e) => {
        if (e.code === "Enter" || e.code === "NumpadEnter") {
            e.preventDefault()
            handleSendMessage()
        }
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
        setUsers(users => [...users, player])
    }
    function onPlayerDisconnect(player) {
        console.log('player disconnected', player); // true
        setUsers(users => users.filter(user => user._id.toString() !== player._id.toString()))
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
    function onOwner(isOwner) {
        console.log('you are owner'); // true
        setIsOwner(isOwner)
    }

    return (
        <div className="container-fluid h-100">
            <h2>Lobby</h2>

            <div className="row">

                <div className="col">

                    {isOwner &&
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
                    }


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
                        <h3>Players <span>{users.length}/4</span></h3>
                        <ul>
                            {
                                users.map((user) => {
                                    return <li key={user._id.toString()} data-id={user._id}>{user.gamename}</li>
                                })
                            }
                        </ul>
                    </div>

                    <div>
                        <h3>Chat</h3>
                        <div ref={chatContainerRef} className="chat-container">
                            <ul  id="chat">
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
                        </div>
                        <div className="mb-3">
                            <label htmlFor="chat-textarea" className="form-label sr-only">Example textarea</label>
                            <textarea ref={chatTextareaRef}
                                      id="chat-textarea"
                                      className="form-control"
                                      rows="1"
                                      placeholder="Press enter to send"
                                      onInput={handleChatInput}
                                      onKeyDown={handleChatKeys}
                            >
                            </textarea>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Lobby;