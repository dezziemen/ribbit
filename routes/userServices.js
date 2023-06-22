const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const User = require('../model/user');

/* READ one user */
router.get('/:username', async(req, res) => {
    const { username } = req.params;

    console.log(`API call GET request read one username: ${ username }`)

    const user = await User.findOne({
        username
    }).exec();
    return res.json(user);
});

/* READ all users */
router.get('/', async(req, res) => {
    console.log(`API call GET request read all users`)

    const users = await User.find({});
    return res.json(users);
});


/* CREATE users listing. */
router.post('/', async(req, res) => {
    const { username } = req.body;
    const { email } = req.body;
    const { password } = req.body;

    console.log(`API call POST request create user: ${ username }:${ email }:${ password }`);

    try {
        const user = await User.create({
            username,
            email,
            password
        });
        return res.json(user);
    } catch (err) {
        console.error(err.errors);
        return res.json(err);
    }
});

/* UPDATE one user */
router.patch('/:username', async(req, res) => {
    const username = req.params.username;
    const { email } = req.body;
    const { password } = req.body;
    const { bio } = req.body;

    console.log(`API call PATCH request update user: ${ email }:${ username }:${ password }`)

    const user = await User.findOne({
        username
    }).exec();

    if (email !== undefined) {
        user.email = email;
    }
    if (password !== undefined) {
        user.password = password;
    }
    if (bio !== undefined) {
        user.bio = bio;
    }

    await user.save();
    return res.json(user);
});

/* DELETE one user */
router.delete('/:username', async(req, res) => {
    const { username } = req.params;

    console.log(`API call DELETE request delete user: ${ username }`);

    await User.findOneAndDelete({
        username
    });

    return res.json({ success: true });
});

module.exports = router;
