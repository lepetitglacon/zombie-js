import './App.css';

import {useContext, useEffect, useState} from "react";
import {Routes, Route, useNavigate, useLocation, useParams, useSearchParams} from "react-router-dom";

import AuthContext from "./context/AuthContext.js";
import GameContext from "./context/GameContext.js";

import MainMenu from "./components/menu/MainMenu.js";
import MainLobby from "./components/mainlobby/MainLobby.js";
import Game, {GAMESTATE} from "./components/game/Game.js";
import Profile from "./components/profile/Profile.js";
import Leaderboard from "./components/leaderboard/Leaderboard.js";
import Auth from "./components/auth/Auth.js";
import Login from "./components/auth/login/Login.js";
import Signin from "./components/auth/signin/Signin.js";
import ProtectedRoute from "./components/auth/ProtectedRoute.js";
import Settings from "./components/settings/Settings.js";

function App() {

    const {user, setUser} = useContext(AuthContext)
    const {clientState} = useContext(GameContext)

    const location = useLocation()
    const navigate = useNavigate()
    let [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.has('login')) {
            if (searchParams.get('login') === 'google') {
                const getUserFromSession = async () => {
                    if (!user) {
                        try {
                            const res = await fetch('http://localhost:39000/api/user/session', {
                                credentials: 'include',
                                withCredentials: true
                            })
                            const data = await res.json()
                            setUser(data.user)
                            navigate('/')
                        } catch (e) {
                            console.log('fetch err', e)
                            setUser(null)
                        }
                    }
                }
                getUserFromSession()
            }
        }
    }, [location])

    useEffect(() => {
        if (user) {

        }
    }, [])

    return (
        <div className="App">

            {
                user &&
                (clientState !== GAMESTATE.LOADING &&
                clientState !== GAMESTATE.RUNNING)  &&
                <MainMenu/>
            }

            {
                // https://www.youtube.com/watch?v=vXJkeZf-4-4
                // protected route qui render le même item
            }

                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute user={user} >
                            <MainLobby/>
                        </ProtectedRoute>
                    }/>

                    <Route path="/game/:id" element={
                        <ProtectedRoute user={user} >
                            <Game/>
                        </ProtectedRoute>
                    }/>

                    <Route path="/me" element={
                        <ProtectedRoute user={user} >
                            <Profile/>
                        </ProtectedRoute>
                    }/>
                    <Route path="/leaderboard" element={
                        <ProtectedRoute user={user} >
                            <Leaderboard/>
                        </ProtectedRoute>
                    }/>

                    <Route path="/settings" element={
                        <ProtectedRoute user={user} >
                            <Settings/>
                        </ProtectedRoute>
                    }/>

                    <Route path="/auth" element={
                        <Auth/>
                    }>
                        <Route path="/auth/login" element={
                            <Login/>
                        }/>
                        <Route path="/auth/signin" element={
                            <Signin/>
                        }/>
                        <Route path="/auth/google/callback" element={
                            <div>hello</div>
                        }/>
                    </Route>
                </Routes>
        </div>
    );
}

export default App;