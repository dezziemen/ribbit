const express = require('express');
const morgan = require("morgan");
const { createHash, randomBytes } = require('crypto');
const router = express.Router();
const loggedIn = require('./middlewares/loggedIn');
const getUser = require('./middlewares/getUser');

// Models
const User = require('../model/user');
const UserCredentials = require('../model/userCredentials');
const Topic = require('../model/topic');
const Post = require('../model/post');

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

// GET home page.
router.get('/', getUser, async (req, res, next) => {
    const user = await User.findOne({ username: req.session.username });
    const topics = await Topic.find();
    // If logged in
    if (user) {
        res.render('home', { title: 'Ribbit', username: user.username, topics });
    } else {
        res.render('home', { title: 'Ribbit', topics });
    }
});

// GET register page
router.get('/register', (req, res) => {
    const error = {};
    res.render('register', { error, email: '', username: '' } );
});

// POST register page
router.post('/register', async (req, res) => {
    const { username, email } = req.body;
    const salt = randomBytes(16).toString('hex');   // Generate random salt
    const passwordRaw = req.body.password + salt;
    const password = hash(passwordRaw);
    const error = {};

    // Prevent duplicate users
    try {
        const userCredentials = await UserCredentials.create({
            username,
            password,
            salt
        });
        const user = await User.create({
            username,
            email
        });

        console.log(`POST request create user: ${ username }:${ email }:${ password }:${ salt }`);
        return res.redirect(`/u/${ username }`);
    } catch (err) {
        console.error(`Create user validation error: ${ username }:${ email }:${ password }:${ salt }\nError: ${ err }`);
        res.render('register', { error: err.keyValue, username, email });
    }
});

// GET login page
router.get('/login', (req, res) => {
    const error = {};
    // Redirect to home if user is already logged in
    if (typeof req.session.username !== 'undefined') {
        res.redirect('/');
    }
    else {
        res.render('login', { error, username: '' })
    }
});

// POST login page
router.post('/login', async (req, res) => {
    const { username } = req.body;
    const passwordRaw = req.body.password;
    const error = {};

    if (username && passwordRaw) {
        try {
            const loginUser = await UserCredentials.findOne({
                username
            });
            const password = hash(req.body.password + loginUser.salt);

            // Password match
            if (loginUser.password === password) {
                console.log(`User ${ username } logged in`);
                const nonce = randomBytes(16).toString('hex');
                // const cookie = username
                // const session = await Sessions.create({
                //     username,
                //     nonce,
                //     cookie
                // });
                req.session.username = username;
                return res.redirect('/');
            }
            // Password not match
            else {
                console.error(`Password not matched: ${ password }, user not logged in`);
            }
        } catch (err) {
            console.error(`Login credential error: ${ username }:${ passwordRaw }`);
        }
    }
    // Login failed
    error.credentialsError = true;
    return res.render('login', { error, username });
});

// GET logout
router.get('/logout', async (req, res) => {
    const error = {};

    req.session.destroy((err) => {
        console.log('Logged out');
    });
    res.redirect('/');
});

// GET topic
router.get('/t/:topic', getUser, async (req, res) => {
    const topicName = req.params.topic;
    const user = await User.findOne({ username: req.session.username });
    try {
        const topic = await Topic.findOne({
            name: topicName
        });
        const isSubscribed = user.subscribed.includes(topic._id);
        res.render('topic', { topic, username: user.username, isSubscribed });
    } catch (err) {
        console.error(`Topic ${ topicName } not found.`);
        res.sendStatus(404);
    }
});

// POST topic
router.post('/topic', getUser, async (req, res) => {
    const { topicName } = req.body;
    const user = await User.findOne({ username: req.session.username });
    const error = {};

    console.log(`Topic created: ${ topicName }`);

    try {
        const topic = await Topic.create({
            creator: user._id,
            name: topicName
        });
        console.log(`POST request create topic: ${ topicName }\nCreator: ${ user }`);
        res.redirect(`/t/${ topicName }`);
    } catch (err) {
        console.error(`Create topic validation error: ${ topicName } by user ${ user }\nError: ${ err }`);
        res.sendStatus(500);
    }
});

// GET post creation
router.get('/post', getUser, async (req, res) => {
    const username = req.session.username;
    const user = await User.findOne({ username });
    const topics = await Topic.find({
        '_id': {
            $in: user.subscribed
        }
    }, { name: 1, _id: 0 });
    console.log(topics);
    res.render('createPost', { username, topics });
});

// POST post creation
router.post('/post', getUser, async (req, res) => {
    const { topicName, postTitle, postBody } = req.body;
    try {
        const user = await User.findOne({ username: req.session.username });
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
                author: user
            });
            console.log(`Request created: ${ postTitle }, ${ postBody }`);
            res.redirect(`/t/${ topic.name }/${ post._id }`);
        }
    } catch (err) {
        console.error(`Post can not be created.`);
        res.sendStatus(500);
    }

});

// GET post
router.get('/t/:topicName/:postId', getUser, async (req, res) => {
    const { topicName, postId } = req.params;
    const user = req.session.user;
    try {
        const post = await Post.findById(postId).exec();
        const topic = await Topic.findOne({
            name: topicName
        });
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

// POST user click subscribe button
router.post('/t/:topicName/subscribe', getUser, async (req, res) => {
    const { topicName } = req.params;
    const user = await User.findOne({ username: req.session.username });
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
    res.json({ subscribed: user.subscribed.includes(topic._id) });
});

// POST user click unsubscribe button
router.post('/t/:topicName/unsubscribe', getUser, async (req, res) => {
    const { topicName } = req.params;
    const user = await User.findOne({ username: req.session.username });
    const topic = await Topic.findOne({
        name: topicName
    }).exec();
    if (user.subscribed.includes(topic._id)) {
        const index = user.subscribed.indexOf(topic._id);
        user.subscribed.splice(index, 1);
        console.log(`User subscribed updated: ${ user.subscribed }`);
        user.save();
    }
    else {
        console.log(`User already unsubscribed to ${ topic.name }`);
    }
    res.json({ subscribed: user.subscribed.includes(topic._id) });
});

module.exports = router;
