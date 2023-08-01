import Server from "../../Server.js";
import GameMap from "../../database/models/GameMapModel.js";
import path from "path";

export default class GameRoutes {

    constructor() {


        this.bind()
    }

    bind() {
        // create game
        // ZombieServer.app.get('/create/:name/:map/:private', (req, res) => {
        //
        //     if (req.isAuthenticated()) {
        //         res.redirect(`/game/${ZombieServer.createGame({
        //                 name: req.params.name,
        //                 map: req.params.map,
        //                 private: req.params.private === 'true'
        //             }
        //         )}`)
        //     } else {
        //         res.redirect('/')
        //     }
        // })

        /**
         * Create a game
         */
        ZombieServer.app.post('/game/create', (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')

            let ownerId = req.session.passport.user._id

            const gameId = ZombieServer.createGame({
                name: req.body.name,
                ownerId: ownerId,
                private: req.body.private
            })

            res.json({
                gameId: gameId
            })
        })

        /**
         * Start an existing game
         */
        ZombieServer.app.get('/game/start/:id', (req, res) => {
            if (!req.isAuthenticated())
                res.redirect('/')

            res.json({succes: ZombieServer.startGame(req.params.id)})
        })

        /**
         * Play on an existing game
         */
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
    }
}