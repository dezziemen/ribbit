const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
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
    subscribed: [mongoose.ObjectId],
    postVote: [{
        post: {
            type: mongoose.ObjectId,
        },
        direction: {
            type: String,
            required: true,
        },
        time: {
            type: Date,
        }
    }],
    commentVote: [{
        comment: {
            type: mongoose.ObjectId,
        },
        direction: {
            type: String,
            required: true,
        },
        time: {
            type: Date,
        }
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
