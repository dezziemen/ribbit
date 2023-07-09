const express = require('express');
const morgan = require("morgan");
const User = require('../model/user');
const Topic = require('../model/topic');
const Post = require('../model/post');
const { createHash, randomBytes } = require('crypto');
const router = express.Router();
const loggedIn = require('./middlewares/loggedIn');
const getUser = require('./middlewares/getUser');

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

/* GET home page. */
router.get('/', async (req, res, next) => {
    const user = await User.findById(req.session.userId).exec();
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
    const error = {};

    req.session.destroy((err) => {
        console.log('Logged out');
    });
    res.redirect('/');
});

router.post('/topic', async (req, res) => {
    const { topicName } = req.body;
    const userId = req.session.userId;
    const error = {};

    console.log(`Topic created: ${ topicName }`);

    try {
        const creator = await User.findById(userId);
        console.log(`Creator: ${ creator._id }:${ creator.username }`);
        const topic = await Topic.create({
            creator: creator._id,
            name: topicName
        });
        console.log(`POST request create topic: ${ topicName }\nCreator: ${ userId }`);
        res.redirect(`/t/${ topicName }`);
    } catch (err) {
        console.error(`Create topic validation error: ${ topicName } by user ${ userId }\nError: ${ err }`);
        res.sendStatus(500);
    }
});

router.get('/t/:topic', getUser, async (req, res) => {
    const topicName = req.params.topic;
    const user = res.locals.user;
    try {
        const topic = await Topic.findOne({
            name: topicName
        }).exec();
        res.render('topic', { topic, user })
    } catch (err) {
        console.error(`Topic ${ topicName } not found.`);
        res.sendStatus(404);
    }
});

router.get('/post', getUser, async (req, res) => {
    const user = res.locals.user;
    console.log(user);
    res.render('createPost', { user });
});

router.post('/post', getUser, async (req, res) => {
    console.log(req.session);
    console.log(req.session.userId);
    const { topicName, postTitle, postBody } = req.body;
    try {
        const topic = await Topic.findOne({
            name: topicName
        });
        if (!topic) {
            console.error(`Topic not found.`);
            res.sendStatus(500);
        }
        else {
            const post = await Post.create({
                content: {
                    title: postTitle,
                    body: postBody
                },
                topic,
                author: res.locals.user
            });
            console.log(`Request created: ${ postTitle }, ${ postBody }`);
            res.redirect(`/t/${ topic.name }/${ post._id }`);
        }
    } catch (err) {
        console.error(`Post can not be created.`);
        res.sendStatus(500);
    }

});

router.get('/t/:topicName/:postId', getUser, async (req, res) => {
    const { topicName, postId } = req.params;
    const user = res.locals.user;
    try {
        console.log(`Finding topic ${ topicName }, post ${ postId }`);
        const post = await Post.findById(postId).exec();
        const topic = await Topic.findOne({
            name: topicName
        });
        console.log(`post.topic: ${ post.topic }`);
        console.log(`topic._id: ${ topic._id }`);
        if (toString(post.topic) === toString(topic._id)) {
            console.log(`Post found: ${ post }`);
            res.render('post', { post, user });
        }
        else {
            console.log(`Wrong topic: ${ post }`);
            res.sendStatus(404);
        }
    } catch (err) {
        console.error(`Post ${ postId } not found.`);
        res.sendStatus(404);
    }
});

router.post('/t/:topicName/subscribe', getUser, async (req, res) => {
    const { topicName } = req.params;
    console.log('Subscribe success');
    const user = res.locals.user;
    const topic = await Topic.findOne({
        name: topicName
    }).exec();
    if (!user.subscribed.includes(topic._id)) {
        user.subscribed.push(topic);
        console.log(`User subscribed updated: ${ user.subscribed }`);
        user.save();
    }
    else {
        console.log(`User already subscribed to ${ topic.name }`);
    }
});

module.exports = router;
