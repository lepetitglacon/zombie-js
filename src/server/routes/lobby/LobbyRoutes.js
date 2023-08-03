import dotenv from "dotenv";
import passport from "passport";
import path from "path";
import fs from "fs";
import User from "../../database/models/UserModel.js";
import Game from "../../services/game/Game.js";
import Server from "../../Server.js";
import GameModel, {GameState} from "../../database/models/GameModel.js";

export default class LobbyRoutes {

    constructor() {
        dotenv.config()

        this.bind()
    }

    bind() {

        ZombieServer.app.get('/lobbies', (req, res) => {
            if (req.isAuthenticated()) {
                res.render('lobbies', {
                    user: req.session.passport.user
                });
            } else {
                res.redirect('/')
            }
        })

        ZombieServer.app.get('/lp/refresh', async (req, res) => {
            const games = await GameModel.find({'state': GameState.LOBBY })
            res.json(games);
        })

        /**
         * Send available maps
         */
        ZombieServer.app.get('/lp/maps', (req, res) => {
            fs.readdir(path.join(Server.__dirname, './resources/gltf/maps'), (err, data) => {
                return res.json(data);
            })
        })

        ZombieServer.app.post('/player/username/set', async (req, res) => {
            if (req.isAuthenticated()) {
                let user = await User.findOne({_id: req.session.passport.user._id})
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
