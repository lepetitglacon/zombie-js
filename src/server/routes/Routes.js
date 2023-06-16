import ZombieGameServer from "../ZombieGameServer.js";
import path from "path"
import fs from "fs"
import passport from "passport";
import MongooseSchemas from "../database/mongoose/Schemas.js";

import dotenv from 'dotenv'
dotenv.config()

export default class Routes {

    constructor() {

        this.mongoose = new MongooseSchemas()
        this.mongoose.init()

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

        ZombieServer.app.get('/', (req, res) => {
            res.sendFile(path.join(ZombieServer.__dirname, '../../src/server/html/LandingPage.html'));
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
            res.redirect(`/game/${ZombieServer.createGame({
                 name: req.params.name,
                 map: req.params.map,
                 private: req.params.private === 'true'
             }
             )}`)
        })

        // play game
        ZombieServer.app.get('/game/:id', (req, res) => {
            if (ZombieServer.GAMES.has(req.params.id)) {
                res.sendFile(path.join(ZombieServer.__dirname, '../../dist/index.html'));
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
                const newUser = new this.mongoose.User({ username: "jean", email: "estebangagneur@tutu.com", googleId:"diqnzfoqznfzq" });
                newUser.save()
                    .then(() => {
                        res.send('User registered successfully!');
                    })
                    .catch(error => {
                        res.status(500).send('An error occurred while registering the user.');
                    });

                res.redirect('/');
            });
    }



}