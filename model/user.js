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
    password: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: false,
    },
    subscribed: [mongoose.ObjectId],
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
