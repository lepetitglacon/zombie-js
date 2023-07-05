import dotenv from "dotenv";
import bodyParser from 'body-parser'
import passport from "passport";
import bcrypt from "bcrypt";
import {OAuth2Strategy} from "passport-google-oauth";
import {Strategy as LocalStrategy} from 'passport-local'

import User from "../../database/models/UserModel.js";

export default class AuthRoutes {

    constructor() {
        dotenv.config()

        ZombieServer.app.use(bodyParser.urlencoded({ extended: true }));

        // enable local
        passport.use(new LocalStrategy(async (username, password, done) => {
            try {
                const user = await User.findOne({ username });

                if (!user) {
                    console.log(`[AUTH][PURE] user ${username} not found`)
                    return done(null, false, { message: 'Invalid username.' });
                }

                const passwordMatch = await bcrypt.compare(password, user.password);

                if (passwordMatch) {
                    console.log(`[AUTH][PURE] user ${username} password matches`)
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
        passport.use(new OAuth2Strategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://82.64.177.251:3000/auth/google/callback"
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
         * login
         */
        ZombieServer.app.post('/login', async (req, res, next) => {
            const { username, password } = req.body;

            if (username === '' && password === '') {
                res.redirect('/')
            }

            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    // Authentication failed, handle the error
                    // For example, you can display an error message on the login page
                    return res.redirect('/');
                }
                // Authentication succeeded, log in the user
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect('/lobbies');
                });
            })(req, res, next);
        })

        /**
         * login
         */
        ZombieServer.app.get('/logout', async (req, res) => {
            req.session.destroy();
            res.redirect('/');
        })

        /**
         * register
         */
        ZombieServer.app.get('/register', (req, res) => {
            res.render('register');
        })

        /**
         * register
         */
        ZombieServer.app.post('/register', async (req, res) => {
            const { username, password } = req.body;

            console.log(username, password)

            if (username !== '' && password !== '') {
                try {
                    let user = await User.findOne({ username })

                    if (user) {
                        if (user.password !== undefined) {
                            console.log(`[AUTH][PURE] user ${username} already registered`)
                        } else {
                            let hashedPassword = await bcrypt.hash(password, 10)
                            user.password = hashedPassword
                            await user.save();
                            console.log(`[AUTH][PURE] user ${username} password saved`)
                        }
                        res.redirect('/');
                        return
                    }

                    const hashedPassword = await bcrypt.hash(password, 10);

                    user = new User({ username, password: hashedPassword });
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

        /**
         * OAuth to Google
         */
        ZombieServer.app.get('/auth/google',
            passport.authenticate('google', { scope : ['profile', 'email'] })
        );

        ZombieServer.app.get('/auth/google/callback',
            passport.authenticate('google', { failureRedirect: '/' }),
            (req, res) => {
                // Successful authentication, redirect success.
                res.redirect('/lobbies');
            });



    }

}
