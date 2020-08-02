const User = require("./../models/userModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require('util');
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRETE,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSentToken = (user,statusCode,res) => {
    const token = signToken(user._id);

    res.status(statusCode)
       .json({
           status: 'success',
           token,
           data: {
               user
           }
       })
}

exports.signup = catchAsync(async (req, res, next) => {
    
    //const newUser = await User.create(req.body);

    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSentToken(newUser,201,res);
});
