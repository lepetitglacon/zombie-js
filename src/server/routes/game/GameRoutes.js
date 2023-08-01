import Server from "../../Server.js";
import GameMap from "../../database/models/GameMapModel.js";
import path from "path";

export default class GameRoutes {

    constructor() {


        this.bind()
    }

    bind() {

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
        ZombieServer.app.post('/game/start', (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')

            const succes = ZombieServer.startGame({
                gameId: req.body.gameId,
                mapName: req.body.mapName
            })
            return res.json({succes: succes})
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