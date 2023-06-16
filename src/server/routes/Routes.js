
import path from "path"
import fs from "fs"
import passport from "passport";

import dotenv from 'dotenv'
dotenv.config()

export default class Routes {

    constructor() {

        this.setRoutes()

        this.user = null

        passport.use(new ZombieServer.googleStrategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:3000/auth/google/callback"
            },
            (accessToken, refreshToken, profile, done) => {
                this.user = profile;
                console.log(profile)
                return done(null, this.user);
            }
        ));
    }

    setRoutes() {
        ZombieServer.app.get('/', (req, res) => {
            console.log(req.session)
            if (this.isUserConnected(req)) {
                res.redirect('/lobbies');
            } else {
                res.render('home');
            }
        })

        ZombieServer.app.get('/lobbies', (req, res) => {
            console.log(req.session)
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
                if (val.private === false) {
                    games[i] = {}
                    games[i].id = key
                    games[i].name = val.name ?? 'Untitled'
                    games[i].map = val.mapName ?? 'No map'
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

        // play game
        ZombieServer.app.get('/game/:id', (req, res) => {
            if (this.isUserConnected(req)) {
                if (ZombieServer.GAMES.has(req.params.id)) {
                    const game = ZombieServer.GAMES.get(req.params.id)
                    ZombieServer.app.set('views', path.join(ZombieServer.__dirname, '../../dist/'));
                    // TODO changer le template par du ejs
                    res.render('index', {
                        game: game
                    })
                    ZombieServer.app.set('views', ZombieServer.__dirname + '\\vue\\');
                    // res.sendFile(path.join(ZombieServer.__dirname, '../../dist/index.html'));
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
                if (ZombieServer.GAMES.has(req.params.id)) {
                    ZombieServer.GAMES.get(req.params.id).run()
                    // res.redirect('/game/' + req.params.id)
                    res.json({status: 'ok'})
                } else {

                }
            } else {
                res.redirect('/')
            }

        })

        console.log(passport)

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
        return req.session.passport && req.session.passport.user !== undefined
    }

}