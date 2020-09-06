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
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    createSentToken(newUser,201,res);
});

exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 01) get user based on posted Email
    const user = await User.findOne({email: req.body.email});
    if(!user) return next(new AppError('There is no user with email address',404));

    // 02) generate random reset signToken
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave : false});

    // 03) send it to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password?  send a patch request with new password and passwordConfirm to ${resetURL}`;
    try{
        await sendEmail({
            email: user.email,
            subject: 'your password reset token,valid for 10 mins',
            message
        });
    
        res.status(200)
           .json({
               status: 'success',
               message: 'Token sent to mail'
           });
    
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({validateBeforeSave : false});

        return next(new AppError("There was a error sending a email",500));
    }
    
});

exports.resetPassword = catchAsync(async (req, res, next) => {

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken : hashedToken, passwordResetExpires : {$gt : Date.now()}});

    if(!user){
        return next(new AppError("Token is invalid or expired"));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSentToken(user,200,res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 01) Get user from the collection
    const user = await User.findById(req.params.id).select('+password');

    // 02) check if posted current user is correct
    const correct = await user.correctPassword(req.body.currentPassword,user.password)
    if(!correct){
        return next(new AppError('Incorrect current password',402));
    }

    // 03) if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save()

    // 04) Log user in, send JWT
    createSentToken(user,200,res);
});
