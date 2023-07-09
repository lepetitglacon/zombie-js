import Server from "../../Server.js";
import GameMap from "../../database/models/GameMapModel.js";
import path from "path";

export default class GameRoutes {

    constructor() {


        this.bind()
    }

    bind() {
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

            if (!req.isAuthenticated())
                return res.redirect('/')

            let owner = req.session.passport.user._id
            res.redirect(`/game/${ZombieServer.createGame({
                    name: req.params.name,
                    owner: owner,
                    private: req.params.private === 'true'
                }
            )}`)
        })

        // play game
        ZombieServer.app.get('/game/:id', async (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')

            if (!ZombieServer.GAMES.has(req.params.id))
                return res.redirect('/')

            const game = ZombieServer.GAMES.get(req.params.id)

            if (game.PLAYERS.size >= 4)
                return res.redirect('/lobbies');

            let user = req.session.passport.user

            ZombieServer.app.set('views', path.join(Server.__dirname, '../../dist/'));
            res.render('index', {
                game: game,
                user: user,
                maps: await GameMap.find({})
            })
            ZombieServer.app.set('views', Server.__dirname + '/views/');
        })

        // start game
        ZombieServer.app.get('/game/start/:id', (req, res) => {
            if (req.isAuthenticated()) {
                res.json({succes: ZombieServer.startGame(req.params.id)})
            } else {
                res.redirect('/')
            }
        })
    }
}