
import path from "path"
import fs from "fs"
import passport from "passport";

import dotenv from 'dotenv'
import GameController from "../controllers/GameController.js";
import UserController from "../controllers/UserController.js";
import Game from "../service/Game.js";


export default class Routes {

    constructor() {
        dotenv.config()

        this.gameController = new GameController({
            dbName: 'games'
        })
        this.userController = new UserController({
            dbName: 'users'
        })

        this.setRoutes()

        passport.use(new ZombieServer.googleStrategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:3000/auth/google/callback"
            },
            (accessToken, refreshToken, profile, done) => {
                this.userController.insert(profile)
                return done(null, profile);
            }
        ));
    }

    setRoutes() {
        ZombieServer.app.get('/', (req, res) => {
            if (this.isUserConnected(req)) {
                res.redirect('/lobbies');
            } else {
                res.render('home');
            }
        })

        ZombieServer.app.get('/lobbies', (req, res) => {
            if (this.isUserConnected(req)) {
                res.render('lobby');
            } else {
                res.redirect('/')
            }
        })

        ZombieServer.app.get('/lp/refresh', (req, res) => {
            const games = []
            let i = 0;
            for (const [key, val] of ZombieServer.GAMES) {
                if (val.private === false && val.status === Game.STATUS.PAUSED) {
                    games[i] = {}
                    games[i].id = key
                    games[i].name = val.name ?? 'Untitled'
                    games[i].map = val.mapName ?? 'No map'
                    games[i].status = val.status
                    games[i].players = val.PLAYERS.size
                    games[i].ping = 25
                    i++
                }
            }
            res.json(games);
        })

        ZombieServer.app.get('/lp/maps', (req, res) => {
            fs.readdir(path.join(ZombieServer.__dirname, '../../src/client/assets/gltf/maps'), (err, data) => {
                res.json(data);
            })
        })

        // create game
        ZombieServer.app.get('/create/:name/:map/:private', (req, res) => {

            if (this.isUserConnected(req)) {
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

            if (this.isUserConnected(req)) {
                let owner

                if (req.session.passport !== undefined && req.session.passport.user !== undefined) {
                    owner = req.session.passport.user.id
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
            if (this.isUserConnected(req)) {
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
                    ZombieServer.app.set('views', ZombieServer.__dirname + '\\vue\\');
                } else {
                    res.redirect('/')
                }
            } else {
                res.redirect('/')
            }
        })

        // start game
        ZombieServer.app.get('/game/start/:id', (req, res) => {
            if (this.isUserConnected(req)) {
                res.json({succes: ZombieServer.startGame(req.params.id)})
            } else {
                res.redirect('/')
            }
        })

        /**
         * OAuth to Google
         */
        ZombieServer.app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        ZombieServer.app.get('/auth/google/callback',
            passport.authenticate('google', { failureRedirect: '/' }),
            (req, res) => {
                // Successful authentication, redirect success.

                res.redirect('/lobbies');
            });
    }

    isUserConnected(req) {
        return req.session.passport && req.session.passport.user !== undefined || !ZombieServer.isOnlineMode
    }

}