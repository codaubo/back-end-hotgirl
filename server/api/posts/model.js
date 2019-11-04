const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content:{type: String},
    description: {type: String, required: true},
    like: {type: Number, default: 0},
    view: {type: Number, default: 0},
    imageUrl: {type: String, required: true},
    // gia tri cua author se tuong ung voi 1 ban ghi ben User
    author: {
        type: mongoose.Schema.Types.ObjectId,
        //ref: su lien quan, lien quan voi User
        ref: "User" // noi sang bang User model
    },
}, {
    timestamps: true,
}); 

const postModel = mongoose.model('Post', postSchema);
module.exports = postModel; 