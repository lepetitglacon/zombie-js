import dotenv from 'dotenv'
import AuthRoutes from "./auth/AuthRoutes.js";
import LobbyRoutes from "./lobby/LobbyRoutes.js";
import AdminMapRoutes from "./admin/map/AdminMapRoutes.js";
import GameRoutes from "./game/GameRoutes.js";
import passport from "passport";
import cors from "cors";
import express from "express";
import session from "express-session";
import Server from "../Server.js";

export default class RoutesHandler {

    constructor(props) {
        this.server = props.server
        
        dotenv.config()

        this.server.app.use(cors())
        // this.server.app.use(express.static('dist/src/client/assets'));
        this.server.app.use('/', express.static(Server.__dirname + '/resources'));

        this.server.app.set('view engine', 'ejs');
        this.server.app.set('views', Server.__dirname + '/views/');

        this.server.app.use(session({
            name: 'z3d-connect',
            resave: false,
            saveUninitialized: true,
            secret: 'z3d-secret' // process.env.GOOGLE_CLIENT_SECRET
        }));

        this.server.app.use(passport.initialize());
        this.server.app.use(passport.session());

        this.passport = passport;

        this.passport.serializeUser(function(user, done) {
            done(null, user);
        });
        this.passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        // admin routes
        this.adminMapRoutes = new AdminMapRoutes({
            server: this.server
        })

        // user routes
        this.authRoutes = new AuthRoutes({
            server: this.server
        })
        this.gameRoutes = new GameRoutes({
            server: this.server
        })
        this.lobbyRoutes = new LobbyRoutes({
            server: this.server
        })

        this.setGlobalRoutes()
    }

    setGlobalRoutes() {
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