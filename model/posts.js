const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Posts', postsSchema);
