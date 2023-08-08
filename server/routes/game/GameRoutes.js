import Server from "../../Server.js";
import GameMap from "../../database/models/GameMapModel.js";
import path from "path";
import GameController from "../../controllers/GameController.js";
import GameModel from "../../database/models/GameModel.js";

export default class GameRoutes {

    constructor(props) {
        this.server = props.server

        this.bind()
    }

    bind() {
        this.gameController = new GameController({
            server: this.server
        })

        /**
         * Create a game
         */
        ZombieServer.app.post('/api/game/create', async (req, res) => {
            if (!req.isAuthenticated())
                return res.json({success: false, message: 'Not authenticated'})

            const ownerId = req.session.passport.user

            const gameId = await this.gameController.create({
                name: req.body.name,
                ownerId: ownerId,
                private: req.body.private
            })

            res.json({
                success: true,
                gameId: gameId
            })
        })

        /**
         * Start an existing game
         */
        ZombieServer.app.post('/game/start', async (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')

            const succes = await this.gameController.start({
                gameId: req.body.gameId,
                mapName: req.body.mapName
            })

            return res.json({succes: succes})
        })

        /**
         * Start an existing game
         */
        ZombieServer.app.get('/game/lobby/:id', async (req, res) => {
            const gameId = req.params.id

            if (!req.isAuthenticated())
                return res.redirect('/')

            // if (!ZombieServer.GAMES.has(gameId))
            //     return res.redirect('/')

            const user = req.session.passport.user

            const game = await GameModel.findOne({_id: gameId})

            await this.gameController.join(game, user)

            return res.render('lobby', {
                game: game,
                user: user,
                maps: await GameMap.find({}),
                assetsPath: Server.__assetsPath
            })
        })

        /**
         * Start an existing game
         */
        ZombieServer.app.get('/game/lobby/leave/:id', async (req, res) => {
            if (!req.isAuthenticated())
                return res.redirect('/')

            const user = req.session.passport.user

            const gameId = req.params.id
            const game = await GameModel.findById(gameId)

            await this.gameController.leave(game, user)

            return res.redirect('/lobbies')
        })

        /**
         * Play on an existing game
         */
        ZombieServer.app.get('/game/:id', async (req, res) => {
            const gameId = req.params.id

            if (!req.isAuthenticated())
                return res.redirect('/')

            if (!ZombieServer.GAMES.has(gameId))
                return res.redirect('/')

            const game = ZombieServer.GAMES.get(gameId)

            if (game.PLAYERS.size >= 4)
                return res.redirect('/lobbies');

            let user = req.session.passport.user

            ZombieServer.app.set('views', path.join(Server.__dirname, Server.VIEWS.FRONTEND));
            res.render('index', {
                game: game,
                user: user,
                maps: await GameMap.find({})
            })
            ZombieServer.app.set('views', Server.__dirname + Server.VIEWS.BACKEND);
        })
    }
}