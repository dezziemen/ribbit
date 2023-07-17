const mongoose = require('mongoose');
const { Schema } = require("mongoose");

const topicSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    replies: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    post: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }],
    vote: [{
        type: Schema.Types.ObjectId,
        ref: 'CommentVote',
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema);

