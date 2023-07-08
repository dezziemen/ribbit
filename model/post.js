const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
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
        type: mongoose.ObjectId,
        required: true,
    },
    // topic: {
    //     type: mongoose.ObjectId,
    //     required: true
    // },
}, {
        timestamps: true,
    });

module.exports = mongoose.model('Post', postSchema);
