const express = require('express');
const morgan = require("morgan");
const { createHash, randomBytes } = require('crypto');
const router = express.Router();
const loggedIn = require('./middlewares/loggedIn');
const getUser = require('./middlewares/getUser');
const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
});
const helper = require('../public/javascripts/helper');

// Models
const PostVote = require('../model/postVote');
const User = require('../model/user');
const UserCredentials = require('../model/userCredentials');
const Topic = require('../model/topic');
const Post = require('../model/post');
const Comment = require('../model/comment');

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
        const posts = await Post.find({
            '_id': {
                $in: topic.post
            }
        });
        console.log(posts);
        res.render('topic', { topic, username: user.username, isSubscribed, posts });
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
    if (topicName === '') {
        console.log(`Select a topic...`);
    }
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
            topic.post.push(post._id);
            topic.save();
            console.log(`Request created: ${ postTitle }, ${ postBody }`);
            res.redirect(`/t/${ topic.name }/${ post._id }`);
        }
    } catch (err) {
        console.error(`Post can not be created. ${ err }`);
        res.sendStatus(500);
    }

});

// GET post
router.get('/t/:topicName/:postId', getUser, async (req, res) => {
    const { topicName, postId } = req.params;
    try {
        const user = await User.findOne({ username: req.session.username })
        const post = await Post.findById(postId).populate({
            path: 'vote',
            model: 'PostVote',
            select: 'direction',
        });
        const topic = await Topic.findOne({
            name: topicName
        }, { name: 1 });
        const postVote = await PostVote.findOne({
            post: post._id,
            user: user._id,
        });
        const comments = await Comment.find({
            replyTo: {
                $exists: false
            }
        });
        console.log(comments);
        // TODO: Figure out a way to make checkbox checked on page load

        const vote = { voteDirection: '' };
        if (postVote) {
            vote['voteDirection'] = postVote.direction;
        }
        if (post.topic.equals(topic._id)) {
            res.render('post', { post, user: user.username, topic, vote, comments, helper });
        }
        else {
            console.log(`Wrong topic: ${ post }`);
            res.sendStatus(404);
        }
    } catch (err) {
        console.error(`Post ${ postId } not found.\n${ err }`);
        res.sendStatus(404);
    }
});

// POST user click subscribe button
router.post('/t/:topicName/subscribe', getUser, async (req, res) => {
    const { topicName } = req.params;
    const user = await User.findOne({ username: req.session.username });
    const topic = await Topic.findOne({
        name: topicName
    });
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
    });
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

async function createPostVote(post, user, direction) {
    const postVote = await PostVote.create({
        post,
        user,
        direction,
    });
    user.postVote.push(postVote);
    post.vote.push(postVote);
    user.save();
    post.save();
}

async function removePostVote(post, user) {
    const postVote = await PostVote.findOne({ post: post._id });
    user.postVote.pull(postVote);
    post.vote.pull(postVote);
    await PostVote.findOneAndDelete({ post: post._id });
    user.save();
    post.save();
}

async function convertVote(post, user, direction) {
    const postVote = await PostVote.findOneAndUpdate({
        post: post._id, user: user._id
    }, {
        $set:
            {
                direction,
                time: Date.now()
            }
    });
    postVote.save();
}

// POST user upvote post
router.post('/t/:topicName/:postId/upvote', getUser, async (req, res) => {
    const post = await Post.findById(req.params.postId);
    let user = await User.findOne({ username: req.session.username }).populate({ path: 'postVote', model: PostVote }).exec();
    const postIndex = user.postVote.findIndex(x => x.post.equals(post._id));

    // If postVote does not exist, create new
    if (postIndex === -1) {
        await createPostVote(post, user, 'up');
        res.json({ direction: 'up' });
    }
    // If already upvoted, remove upvote
    else if (user.postVote[postIndex].direction === 'up') {
        await removePostVote(post, user);
        res.json({ direction: '' });
    }
    // If already downvoted, convert to upvote
    else if (user.postVote[postIndex].direction === 'down') {
        await convertVote(post, user, 'up');
        res.json({ direction: 'up' });
    }
});

// POST user downvote post
router.post('/t/:topicName/:postId/downvote', getUser, async (req, res) => {
    const post = await Post.findById(req.params.postId);
    let user = await User.findOne({ username: req.session.username }).populate({ path: 'postVote', model: PostVote }).exec();
    const postIndex = user.postVote.findIndex(x => x.post.equals(post._id));

    // If postVote does not exist, create new
    if (postIndex === -1) {
        await createPostVote(post, user, 'down');
        res.json({ direction: 'down' });

    }
    // If already upvoted, remove downvote
    else if (user.postVote[postIndex].direction === 'down') {
        await removePostVote(post, user);
        res.json({ direction: '' });
    }
    // If already upvoted, convert to downvote
    else if (user.postVote[postIndex].direction === 'up') {
        await convertVote(post, user, 'down');
        res.json({ direction: 'down' });
    }
});

router.post('/t/:topicName/:postId/comment', getUser, async (req, res) => {
    try {
        const topic = await Topic.findOne({ name: req.params.topicName });
        const post = await Post.findOne({ topic, _id: req.params.postId });
        const user = await User.findOne({ username: req.session.username });

        const commentText = req.body.postComment;
        const comment = await Comment.create({
            content: commentText,
            author: user,
            post: post,
        });

        console.log(`Posted comment: ${ commentText }`);
        res.json({ success: true, commentText });
    } catch (err) {
        console.error(`Unable to find post.\n${ err }`);
        res.sendStatus(300);
    }
});

async function getRootCommentsByPost(postId) {
    const comments = await Comment.find({
        post: postId,
        replyTo: {
            $exists: false
        }
    }).populate({
        path: 'author',
        model: 'User',
        select: ['_id', 'username']
    }).lean();
    // comments?.forEach((comment, index) => {
    //     comment["dateString"] = dateFormatter.format(Date.parse(comment["createdAt"]));
    // });
    return comments;
}

router.get('/commentTest', getUser, async (req, res) => {
    const comments = await Comment.find({
        replyTo: {
            $exists: false
        }
    });
    // comments?.forEach((comment, index) => {
    //     comment["dateString"] = dateFormatter.format(Date.parse(comment["createdAt"]));
    // });
    console.log(comments);
    res.render('commentTest', { comments });
});

module.exports = router;
