
import GameMapModel from "../../../database/models/GameMapModel.js";

export default class MapRoutes {

    constructor(props) {
        this.server = props.server

        this.bind()
    }

    bind() {

        /**
         * Create a game
         */
        ZombieServer.app.get('/api/availableMaps', async (req, res) => {
            if (!req.isAuthenticated())
                return res.json({success: false, message: 'Not authenticated'})

            const maps = await GameMapModel.find(
                {playable: true},
                ['_id', 'name', 'preview']
            )

            res.json({
                success: true,
                maps: maps
            })
        })
    }
}