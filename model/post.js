const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    content: {
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: false,
        },
        // media: {
        //
        // }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    vote: [{
        type: Schema.Types.ObjectId,
        ref: 'PostVote',
    }],
    comment: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
}, {
        timestamps: true,
    });

module.exports = mongoose.model('Post', postSchema);
