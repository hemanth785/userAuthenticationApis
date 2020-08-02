const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const userSchema = new Schema({
    name : { 
        type: String,
        required: [true, "Please tell you name"]
    },
    email : {
        type: String,
        required: [true, "Please provide an email address"],
        unique: true,
        lowercase: true,
        validate : [validator.isEmail, "Please provide valid email"]
    },
    photo: String,
    role: {
        type: String,
        enum: ['user','admin','guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: 8,
        select: false
    },
    passwordConfirm : {
        type: String,
        required: true,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not same!"
        }
    },
    passwordChangedAt : {
        type: Date,
        default: new Date()
    },
    passwordResetToken : String,
    passwordResetExpires :Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
});

const User = mongoose.model('User',userSchema);

module.exports = User;