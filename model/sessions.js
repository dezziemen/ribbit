const mongoose = require('mongoose');

const sessions = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    nonce: {
        type: String,
        required: true,
    },
    cookie: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Sessions', sessions);
