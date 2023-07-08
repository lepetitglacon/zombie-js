import dotenv from "dotenv";
import passport from "passport";
import path from "path";
import fs from "fs";
import User from "../../database/models/UserModel.js";
import Game from "../../services/game/Game.js";

export default class LobbyRoutes {

    constructor() {
        dotenv.config()

        this.bind()
    }

    bind() {

        ZombieServer.app.get('/lobbies', (req, res) => {
            if (req.isAuthenticated()) {
                console.log(req.session.passport.user)
                res.render('lobby', {
                    user: req.session.passport.user
                });
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

        /**
         * Send available maps
         */
        ZombieServer.app.get('/lp/maps', (req, res) => {
            fs.readdir(path.join(ZombieServer.__dirname, '../../src/client/assets/gltf/maps'), (err, data) => {
                return res.json(data);
            })
        })

        ZombieServer.app.post('/player/username/set', async (req, res) => {
            if (req.isAuthenticated()) {
                let user = await User.findOne({_id: req.session.passport.user._id})
                console.log(req.body)
                if (user && req.body.gamename) {
                    user.gamename = req.body.gamename
                    await user.save()
                    req.session.passport.user.gamename = req.body.gamename
                    console.log(`[AUTH][PURE] user ${user.username} rennamed ${user.gamename}`)
                    return res.json({'succes': true})
                } else {
                    return res.json({'succes': false})
                }
            }
        })

    }

}
