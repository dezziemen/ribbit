const express = require('express');
const morgan = require("morgan");
const User = require('../model/user');
const { createHash, randomBytes } = require('crypto');
const router = express.Router();
const loggedIn = require('./middlewares/loggedIn');

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

/* GET home page. */
router.get('/', async (req, res, next) => {
    const user = await User.findOne({
        _id: req.session.userId
    }).exec();
    // If logged in
    if (user) {
        res.render('home', { title: 'Ribbit', user });
    } else {
        res.render('home', { title: 'Ribbit' });
    }
});

/* GET register page */
router.get('/register', (req, res) => {
    const error = {};
    res.render('register', { error, email: '', username: '' } );
});

/* POST register page */
router.post('/register', async (req, res) => {
    const { username } = req.body;
    const { email } = req.body;
    const salt = randomBytes(16).toString('hex');   // Generate random salt
    const passwordRaw = req.body.password + salt;
    console.log(passwordRaw);
    const password = hash(passwordRaw);
    const error = {};

    // Prevent duplicate users
    try {
        const user = await User.create({
            username,
            email,
            password,
            salt
        });

        console.log(`POST request create user: ${ username }:${ email }:${ password }:${ salt }`);
        return res.redirect(`/u/${ username }`);
    } catch (err) {
        console.error(`Create user validation error: ${ username }:${ email }:${ password }:${ salt }\nError: ${ err }`);
        res.render('register', { error: err.keyValue, username, email });
    }
});

/* GET login page */
router.get('/login', (req, res) => {
    const error = {};
    res.render('login', { error, userEmail: '' })
});

/* POST login page */
router.post('/login', async (req, res) => {
    const { userEmail } = req.body;
    const passwordRaw = req.body.password;
    const error = {};

    if (userEmail && passwordRaw) {
        try {
            const loginUser = await User.findOne({
                username: userEmail
            }).exec();

            const password = hash(req.body.password + loginUser.salt);

            // Password match
            if (loginUser.password === password) {
                console.log(`Password matched: ${ password }, user logged in`);
                req.session.userId = loginUser._id;
                return res.redirect('/');
            }
            // Password not match
            else {
                console.error(`Password not matched: ${ password }, user not logged in`);
            }
        } catch (err) {
            console.error(`Login credential error: ${ userEmail }:${ passwordRaw }`);
        }
    }
    // Login failed
    error.credentialsError = true;
    return res.render('login', { error, userEmail });
});

/* GET logout */
router.get('/logout', async (req, res) => {
    req.session.destroy((err) => {
        console.log('Logged out');
    });
    res.redirect('/');
});

module.exports = router;