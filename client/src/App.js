import './App.css';

import {useContext, useEffect, useState} from "react";
import {Routes, Route, useNavigate, useLocation, useParams, useSearchParams} from "react-router-dom";

import AuthContext from "./context/AuthContext";

import MainMenu from "./components/menu/MainMenu";
import MainLobby from "./components/mainlobby/MainLobby";
import Game from "./components/game/Game";
import Profile from "./components/profile/Profile";
import Leaderboard from "./components/leaderboard/Leaderboard";
import Auth from "./components/auth/Auth";
import Login from "./components/auth/login/Login";
import Signin from "./components/auth/signin/Signin";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {

    const {user, setUser} = useContext(AuthContext)

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
                            console.log(data.user)
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

    return (
        <div className="App">

            {user && <MainMenu/>}

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
