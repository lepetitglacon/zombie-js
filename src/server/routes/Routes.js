import ZombieGameServer from "../ZombieGameServer.js";
import path from "path"
import fs from "fs"

export default class Routes {

    constructor() {

        ZombieServer.app.get('/', (req, res) => {
            res.sendFile(path.join(ZombieServer.__dirname, '../../src/server/html/LandingPage.html'));
        })

        ZombieServer.app.get('/lp/refresh', (req, res) => {
            const games = []
            let i = 0;
            for (const [key, val] of ZombieServer.GAMES) {
                if (val.private === false) {
                    console.log(val.name, val.private)

                    games[i] = {}
                    games[i].id = key
                    games[i].name = val.name ?? 'Untitled'
                    games[i].map = val.map ?? 'No map'
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
            console.log('route', req.params.private)
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
    }



}