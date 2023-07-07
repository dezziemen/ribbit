const mongoose = require('mongoose');
const Post = require('/model/post')

const topicSchema = new mongoose.Schema({
    post: {
        type: Number,
        required: false,
    },
    wiki: {
        type: String,
        required: false,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema);

