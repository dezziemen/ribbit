const mongoose = require('mongoose');
const { Schema } = mongoose;

const postUpvoteSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    direction: {
        type: String,
        enum: ['up', 'down'],
        required: true,
    },
    time: {
        type: Date,
        required: true,
        default: Date.now(),
    }
});

module.exports = mongoose.model('PostUpvote', postUpvoteSchema);
