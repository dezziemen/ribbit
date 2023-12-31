const mongoose = require('mongoose');
const { Schema } = mongoose;

const topicSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    post: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: false
    }],
    wiki: {
        type: String,
        required: false,
    },
    subscribers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema);

