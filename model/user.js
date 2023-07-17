const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String,
        required: false,
    },
    post: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }],
    comment: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    subscribed: [{
        type: Schema.Types.ObjectId,
        ref: 'Topic',
    }],
    postVote: [{
        type: Schema.Types.ObjectId,
        ref: 'PostVote'
    }],
        // post: {
        //     type: Post,
        //     required: true,
        // },
        // direction: {
        //     type: String,
        //     required: true,
        // },
        // time: {
        //     type: Date,
        //     required: true,
        //     default: Date.now(),
        // }
    // }],
    commentVote: [{
        type: Schema.Types.ObjectId,
        ref: 'CommentVote'
    }],
    settings: {
        darkMode: {
            type: Boolean,
            default: true,
        },
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
