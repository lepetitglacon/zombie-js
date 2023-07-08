
import path from "path"
import fs from "fs"
import passport from "passport";

import dotenv from 'dotenv'
import GameController from "../controllers/GameController.js";
import UserController from "../controllers/UserController.js";
import Game from "../services/game/Game.js";
import AuthRoutes from "./auth/AuthRoutes.js";
import LobbyRoutes from "./lobby/LobbyRoutes.js";


export default class RouteHandler {

    constructor() {
        dotenv.config()

        this.authRoutes = new AuthRoutes()
        this.lobbyRoutes = new LobbyRoutes()
        this.setRoutes()
    }

    setRoutes() {
        ZombieServer.app.get('/', (req, res) => {
            if (req.isAuthenticated()) {
                res.redirect('/lobbies');
            } else {
                res.render('home');
            }
        })

        // create game
        ZombieServer.app.get('/create/:name/:map/:private', (req, res) => {

            if (req.isAuthenticated()) {
                res.redirect(`/game/${ZombieServer.createGame({
                        name: req.params.name,
                        map: req.params.map,
                        private: req.params.private === 'true'
                    }
                )}`)
            } else {
                res.redirect('/')
            }

        })

        // create game
        ZombieServer.app.get('/game/create/:name/:private', (req, res) => {

            if (req.isAuthenticated()) {
                let owner

                if (req.session.passport !== undefined && req.session.passport.user !== undefined) {
                    console.log('test', req.session.passport.user)
                    owner = req.session.passport.user._id
                } else {
                    owner = 'offline'
                }

                res.redirect(`/game/${ZombieServer.createGame({
                        name: req.params.name,
                        owner: owner,
                        private: req.params.private === 'true'
                    }
                )}`)
            } else {
                res.redirect('/')
            }
        })

        // play game
        ZombieServer.app.get('/game/:id', (req, res) => {
            if (req.isAuthenticated()) {
                if (ZombieServer.GAMES.has(req.params.id)) {
                    const game = ZombieServer.GAMES.get(req.params.id)

                    if (game.PLAYERS.size >= 4) {
                        res.redirect('/lobbies');
                        return;
                    }

                    let user
                    if (req.session.passport !== undefined && req.session.passport.user !== undefined) {
                        user = req.session.passport.user
                    } else {
                        user = 'offline'
                    }

                    ZombieServer.app.set('views', path.join(ZombieServer.__dirname, '../../dist/'));
                    res.render('index', {
                        game: game,
                        user: user,
                    })
                    ZombieServer.app.set('views', ZombieServer.__dirname + '\\views\\');
                } else {
                    res.redirect('/')
                }
            } else {
                res.redirect('/')
            }
        })

        // start game
        ZombieServer.app.get('/game/start/:id', (req, res) => {
            if (req.isAuthenticated()) {
                res.json({succes: ZombieServer.startGame(req.params.id)})
            } else {
                res.redirect('/')
            }
        })

        //The 404 Route (ALWAYS Keep this as the last route)
        ZombieServer.app.get('*', function(req, res){
            res.redirect('/')
        });


    }

    isUserConnected(req) {
        return req.session.passport && req.session.passport.user !== undefined || !ZombieServer.isOnlineMode
    }

}