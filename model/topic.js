const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    post: [{
        type: Number,
        required: false,
    }],
    wiki: {
        type: String,
        required: false,
    },
    creator: {
        type: mongoose.ObjectId,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema);

