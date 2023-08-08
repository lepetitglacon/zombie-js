import './App.css';

import {useContext, useEffect, useState} from "react";
import {Routes, Route, useNavigate} from "react-router-dom";
import Cookies  from "js-cookie";

import MainMenu from "./components/menu/MainMenu";
import MainLobby from "./components/mainlobby/MainLobby";
import Game from "./components/game/Game";
import Profile from "./components/profile/Profile";
import Leaderboard from "./components/leaderboard/Leaderboard";
import Auth from "./components/auth/Auth";
import Login from "./components/auth/login/Login";
import Signin from "./components/auth/signin/Signin";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import axios from "axios";
import LogoutButton from "./components/auth/logout/LogoutButton";
import AuthContext from "./context/AuthContext";

function App() {

    const {user} = useContext(AuthContext)

    return (
        <div className="App">

            {user && <MainMenu/>}

                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute >
                            <MainLobby/>
                        </ProtectedRoute>
                    }/>

                    <Route path="/game/:id" element={
                        <ProtectedRoute >
                            <Game/>
                        </ProtectedRoute>
                    }/>

                    <Route path="/me" element={
                        <ProtectedRoute >
                            <Profile/>
                        </ProtectedRoute>
                    }/>
                    <Route path="/leaderboard" element={
                        <ProtectedRoute >
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
                    </Route>
                </Routes>
        </div>
    );
}

export default App;
