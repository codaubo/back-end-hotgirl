const mongoose = require('mongoose'); // video 56m:57s Rest API 1

const userSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
    firstName: {type: String,},
    lastName: {type: String},
    facebookAccount: {
        uid: {type: String}, // unique hoat dong thi xoa collection tao lai
        email: {type: String},
    },
    avatarUrl: {type: String},
    // createdAt: Date,
    permissions: [String],
    }, {
        timestamps: true, // tu dong them ngay thang, createdAt - updatedAt
    });

// ten model chu cai dau viet hoa, ko co 's'
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
