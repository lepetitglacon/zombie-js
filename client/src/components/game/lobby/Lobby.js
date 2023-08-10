import './lobby.css'

import {useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

import axios from "axios";
import moment from "moment";

import ENV from "../../../ENV";
import AuthContext from "../../../context/AuthContext";
import {GAMESTATE} from "../Game";
import GameContext from "../../../context/GameContext";

function Lobby({socket}) {

    const {user} = useContext(AuthContext)
    const {clientState, setClientState} = useContext(GameContext)

    const navigate = useNavigate()

    const [maps, setMaps] = useState([])
    const [currentMap, setCurrentMap] = useState()
    const [isOwner, setIsOwner] = useState(false)
    const [countdown, setCountdown] = useState(null)
    const [countdownTimer, setCountdownTimer] = useState([])
    const [ready, setReady] = useState(true)
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])

    const chatContainerRef = useRef()
    const chatTextareaRef = useRef()
    const readyButton = useRef()
    const mapCarouselRef = useRef()

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
        socket.on('set-map', onSetMap)
        socket.on('game-deleted', onGameDeleted)
        socket.on('game-start', onGameStart)
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
            socket.off('set-map', onSetMap)
            socket.off('game-deleted', onGameDeleted)
            socket.off('game-start', onGameStart)
        }
    }, [])

    useEffect(() => {
        const fetchMaps = async () => {
            try {
                const res = await axios.get(ENV.SERVER_HOST + 'api/availableMaps', {
                    withCredentials: true
                })
                if (res.data.success) {
                    setMaps(res.data.maps)
                    setCurrentMap(res.data.maps[0])
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
        if (isOwner) {
            sendMapChangeEvent()
        }
    }, [currentMap, isOwner])

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

    const handleReady = async () => {
        await setReady(ready => !ready)
        console.log('ready', ready)
        socket.emit('player-ready', {
            ready: ready
        })
    }

    const onMapItemHover = (e) => {
        console.log(e)

    }
    const onMapItemClick = (e) => {
        console.log(e)
        const newMap = maps.filter(map => {
            return map._id === e.target.dataset.id
        })
        setCurrentMap(newMap[0] ?? null)
    }
    const sendMapChangeEvent = () => {
        console.log('try sending map info')
        if (currentMap) {
            console.log('sending map info to server', currentMap)
            socket.emit('map', {mapId: currentMap._id})
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
    function onGameCounter(e) {
        console.log('start countdown'); // true
        setCountdown(e.timeInSec)
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
    function onSetMap(e) {
        console.log('set map'); // true
        console.log(maps)
        if (maps) {
            const newMap = maps.filter(map => {
                return map._id === e.mapId
            })
            setCurrentMap(newMap[0])
        }
    }
    function onGameDeleted() {
        navigate('/')
    }
    function onGameStart() {
        setClientState(GAMESTATE.LOADING)
    }

    return (
        <div className="container-fluid h-100">

            <div className="row h-100">

                <div className="col d-flex flex-column justify-content-around">

                    {isOwner &&
                        <div>
                            <h3>Maps</h3>
                            <div ref={mapCarouselRef}  className="d-flex maps-container">
                                <ul className="w-100">
                                    {maps.map((map, i) => {
                                        return (
                                            <li
                                                key={map._id}
                                                data-id={map._id}
                                                className={currentMap._id === map._id ? 'active map-item' : 'map-item'}
                                                onMouseOver={onMapItemHover}
                                                onClick={onMapItemClick}
                                            >{map.name}</li>
                                        )
                                    })}

                                    <li className='map-item'>...</li>
                                    <li className='map-item'>...</li>
                                    <li className='map-item'>...</li>
                                </ul>
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

                    <div className="d-flex">
                        <div className="col">
                            <h3>Players <span>{users.length}/4</span></h3>
                            <ul>
                                {
                                    users.map((user) => {
                                        return <li key={user._id.toString()} data-id={user._id}>{user.gamename}</li>
                                    })
                                }
                            </ul>
                        </div>

                        <div className="col">
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

                <div className="col">

                    <div id="current-map">
                        {currentMap &&
                            <div>
                                <p id="current-map-name">{currentMap.name}</p>
                                <img src={ENV.SERVER_HOST + 'assets/img/map-preview/' + currentMap.preview}
                                    className="d-block img-preview" alt="..."/>
                            </div>
                        }
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Lobby;