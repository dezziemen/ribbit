const mongoose = require('mongoose');
const User = require('/model/user');

const postSchema = new mongoose.Schema({
    topicId: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: Number,
        required: true,
    },
}, {
        timestamps: true,
    });

module.exports = mongoose.model('Post', postSchema);
