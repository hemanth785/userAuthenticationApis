const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router
    .post("/signup",authController.signup)
    .post("/login",authController.login)
    .post("/forgotPassword",authController.forgotPassword)
    .patch("/resetPassword/:token",authController.resetPassword)


module.exports = router;