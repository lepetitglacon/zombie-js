import ZombieGameServer from "../ZombieGameServer.js";
import path from "path"

export default class Routes {

    constructor() {

        ZombieServer.app.get('/', (req, res) => {
            res.sendFile(path.join(ZombieServer.__dirname, '../../src/server/html/LandingPage.html'));
        })

        ZombieServer.app.get('/lp/refresh', (req, res) => {
            const games = []
            let i = 0;
            for (const [key, val] of ZombieServer.GAMES) {
                games[i] = {}
                games[i].id = key
                games[i].name = val.name ?? 'Untitled'
                games[i].map = val.map
                games[i].players = val.PLAYERS.size
                games[i].ping = 25
                i++
            }
            res.json(games);
        })

        // create game
        ZombieServer.app.get('/create/:name', (req, res) => {
             res.redirect(`/game/${ZombieServer.createGame(req.params.name)}`)
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