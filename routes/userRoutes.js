const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route("/")
      .get(userController.getAllUsers);

router.patch("/updateMe",authController.protect,userController.updateMe);
router.delete("/deleteMe",authController.protect,userController.deleteMe);

router
    .post("/signup",authController.signup)
    .post("/login",authController.login)
    .post("/forgotPassword",authController.forgotPassword)
    .patch("/resetPassword/:token",authController.resetPassword)
    .patch("/updateMyPassword/:id",authController.protect,authController.updatePassword);


module.exports = router;