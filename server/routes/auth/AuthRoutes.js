import dotenv from "dotenv";
import express from "express";
import bodyParser from 'body-parser'
import passport from "passport";
import bcrypt from "bcrypt";
import {OAuth2Strategy} from "passport-google-oauth";
import LocalStrategy from 'passport-local'

import User from "../../database/models/UserModel.js";
import Server from "../../Server.js";
import UserModel from "../../database/models/UserModel.js";
import jwt from "jsonwebtoken";

export default class AuthRoutes {

    constructor(props) {
        dotenv.config()
        this.server = props.server

        this.server.app.use(express.json());

        this.server.passport.serializeUser(function(user, done) {
            console.log('serialize user ' + user._id)
            done(null, user._id);
        });
        this.server.passport.deserializeUser(async (userId, done) => {
            console.log('deserialize user ' + userId)
            const user = await UserModel.findById(userId)
            done(null, user);
        });

        // enable local
        this.server.passport.use(new LocalStrategy(async (username, password, done) => {
            try {
                const user = await User.findOne({ username });
                if (!user) {
                    console.log(`[AUTH][PURE] user ${username} not found`)
                    return done(null, false, { message: 'Invalid username.' });
                }
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (passwordMatch) {
                    console.log(`[AUTH][PURE] user ${username} password matches, authenticated`)
                    return done(null, user);
                } else {
                    console.log(`[AUTH][PURE] user ${username} invalid password`)
                    return done(null, false, { message: 'Invalid password.' });
                }
            } catch (error) {
                return done(error);
            }
        }));

        // enable Google Oauth
        this.server.passport.use(new OAuth2Strategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `http://localhost:${Server.__port}/auth/google/callback`
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({googleId: profile.id});

                    if (user) {
                        // User is already registered with Google OAuth
                        console.log(`[AUTH][GOOGLE] user ${profile.emails[0].value} logged in`)
                        return done(null, user);
                    }

                    // Check if the user is registered locally with the same email
                    user = await User.findOne({username: profile.emails[0].value});

                    if (user) {
                        // Merge the Google OAuth account with the local account
                        user.googleId = profile.id;
                        user.googleToken = accessToken;
                        await user.save();
                        console.log(`[AUTH][GOOGLE] user ${profile.emails[0].value} merged account`)
                        return done(null, user);
                    }

                    // Create a new user with Google OAuth details
                    user = new User({
                        username: profile.emails[0].value,
                        googleId: profile.id,
                        googleToken: accessToken
                    });

                    await user.save();
                    console.log(`[AUTH][GOOGLE] user ${profile.emails[0].value} created account`)

                    return done(null, user);
                } catch (errors) {
                    return done(errors)
                }
            }
        ));

        this.bind()
    }

    bind() {

        /**
         * Request OAuth to Google
         */
        ZombieServer.app.get('/auth/google',
            passport.authenticate('google', { scope : ['profile', 'email'] }));

        /**
         * Google will call this callback on login with the user data
         */
        ZombieServer.app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login-failed' }),
            (req, res) => {
                return res.redirect('http://localhost:3000/auth?login=google')
            }
        );

        // ZombieServer.app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failed' }),
        //     (req, res) => {
        //
        //     })

        /**
         * login
         */
        ZombieServer.app.post('/login',
            bodyParser.urlencoded({ extended: false }), async (req, res, next) => {

            const { username, password } = req.body;
            console.log(`[AUTH] Login attempt from ${username}`)

            if (username === '' || password === '') {
                return res.json({
                    success: false,
                    message: 'missing username or password'
                })
            }

            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    console.log(err)
                    return next(err);
                }
                if (!user) {
                    return res.json({
                        success: false,
                        message: 'user not found'
                    })
                }

                const token = jwt.sign(user._id.toString(), 'z3d-secret')
                res.cookie('z3d-connect', token)

                req.login(user, (err) => {
                    if (err) {
                        console.log(err)
                        return next(err);
                    }
                    return res.json({
                        success: true,
                        message: 'authenticated',
                        user: user
                    })
                });
            })(req, res, next);
        })

        /**
         * login
         */
        ZombieServer.app.get('/api/user/logout', async (req, res) => {
            req.session.destroy();
            res.redirect('http://localhost:3000');
        })


        ZombieServer.app.get('/register', (req, res) => {
            res.render('register');
        })
        ZombieServer.app.post('/register', bodyParser.urlencoded({ extended: false }), async (req, res) => {
            const { username, gamename, password } = req.body;

            if (username !== '' && password !== '') {
                try {
                    let user = await User.findOne({ username })

                    if (user) {
                        if (user.password !== undefined) {
                            console.log(`[AUTH][PURE] user ${username} already registered`)
                        } else {
                            let hashedPassword = await bcrypt.hash(password, 10)
                            user.password = hashedPassword
                            user.gamename = gamename
                            await user.save();
                            console.log(`[AUTH][PURE] user ${username} password saved`)
                        }
                        res.redirect('/');
                        return
                    }

                    const hashedPassword = await bcrypt.hash(password, 10);

                    user = new User({ username, password: hashedPassword, gamename: gamename });
                    await user.save();

                    console.log(`[AUTH][PURE] user ${username} registered`)

                    // req.flash('message', 'Signup successful. You can now log in.');
                    res.redirect('/lobbies');
                } catch (error) {
                    // req.flash('message', 'Failed to signup. Please try again.');
                    res.redirect('/');
                }
            } else {
                console.log(`[AUTH][PURE] user ${username} not registered`)
                res.redirect('/');
            }
        })

        ZombieServer.app.get('/api/user/session', (req, res) => {

            if (req.isAuthenticated()) {
                res.json({user: req.user});
            } else {
                res.json({user: null});
            }
        })

    }

}
