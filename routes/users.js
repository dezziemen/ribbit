const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const User = require("../model/user");
const mongoose = require("mongoose");

/* READ one user */
router.get('/:username', async (req, res) => {
  const username = req.params.username;

  console.log(`GET request read one username: ${ username }`)

  const user = await User.findOne({
    username
  }).exec();

  return res.render('user', { user });
});

/* UPDATE one user */
router.patch('/:username', async (req, res) => {
  const username = req.params.username;
  const { email } = req.body;
  const { password } = req.body;
  const { bio } = req.body;

  // Prevent duplicate user

  // ######################

  console.log(`PATCH request update user: ${ email }:${ username }:${ password }`)

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
  return res.render('user', { user });
});

/* DELETE one user */
router.delete('/:username', async (req, res) => {
  const { username } = req.params;

  console.log(`DELETE request delete user: ${ username }`);

  await User.findOneAndDelete({
    username
  });

  return res.redirect('/', 200);
});

module.exports = router;
