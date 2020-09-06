const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const filterObj = (obj, ...allowedFilds) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFilds.includes(el)){
            newObj[el] = obj[el];
        }
    });
    return newObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users  = await User.find();
    
    //SENDING RESPONSE
    res.status(201).json({
        status: "success",
        results: users.length,
        data: {
            users: users
        }
    });
});

exports.updateMe = catchAsync( async (req, res, next) => {
    // 01) create error if user posts password data
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('this is not a route for password updates',400))
    }

    // 02) filter out unwanted fields that are not allowed to updated.
    const filteredBody = filterObj(req.body,'name','email');

    // 03) update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody, {new: true, runValitors: true});

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });

})

exports.deleteMe = catchAsync( async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: "success",
        data: null
    })
});