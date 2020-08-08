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

userSchema.pre('save',async function(next){
    //ONly runs if the password is different
    if(!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password,12);

    //delete password confirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now - 1000;
});

userSchema.pre(/^find/,function(next){
    this.find({active: {$ne: false}});
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword) {
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);

        return JWTTimestamp < changedTimeStamp;
    } 

    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    //create plain text reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    //encrypt it to store in database
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    //return plain text token
    return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;