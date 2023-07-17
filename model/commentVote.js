const mongoose = require('mongoose');
const Comment = require('./comment');
const User = require('./user');


const commentSchema = new mongoose.Schema({
    comment: {
        type: Comment,
        required: true,
    },
    user: {
        type: User,
        required: true,
    },
    direction: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        required: true,
        default: Date.now(),
    }
});

module.exports = mongoose.model('Comment', commentSchema);
