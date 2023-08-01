
import path from "path"

import dotenv from 'dotenv'
import AuthRoutes from "./auth/AuthRoutes.js";
import LobbyRoutes from "./lobby/LobbyRoutes.js";
import Server from "../Server.js";
import AdminMapRoutes from "./admin/map/AdminMapRoutes.js";
import GameRoutes from "./game/GameRoutes.js";


export default class RoutesHandler {

    constructor() {
        dotenv.config()

        // admin routes
        this.adminMapRoutes = new AdminMapRoutes()



        this.authRoutes = new AuthRoutes()
        this.gameRoutes = new GameRoutes()
        this.lobbyRoutes = new LobbyRoutes()



        this.setRoutes()
    }

    setRoutes() {
        ZombieServer.app.get('/', (req, res) => {
            if (req.isAuthenticated()) {
                res.redirect('/lobbies');
            } else {
                res.render('home');
            }
        })

        //The 404 Route (ALWAYS Keep this as the last route)
        ZombieServer.app.get('*', function(req, res){
            res.redirect('/')
        });


    }

}