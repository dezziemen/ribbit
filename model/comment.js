const mongoose = require('mongoose');
const { Schema } = require("mongoose");
const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
});

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    replies: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    vote: [{
        type: Schema.Types.ObjectId,
        ref: 'CommentVote',
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

var autoPopulateChildren = function(next) {
    this.populate('replies');
    next();
}

var autoPopulateAuthor = function(next) {
    this.populate({
        path: 'author',
        select: ['_id', 'username']
    });
    next();
}

var dateString = function(doc) {
    console.log(`this: ${ doc }`);
    console.log(`createdAt: ${ doc.createdAt }`);
    // this.dateString = dateFormatter.format(Date.parse(this.createdAt));
    // next();
    // assert.ok(doc instanceof mongoose.Document);
    doc.dateString = dateFormatter.format(Date.parse(doc.createdAt));
}

commentSchema
    .pre(/^find/, autoPopulateChildren)
    .pre(/^find/, autoPopulateAuthor)
    // .post(/^find/, dateString);

module.exports = mongoose.model('Comment', commentSchema);
