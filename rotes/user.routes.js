const router = require("express").Router()
const userController = require("../controllers/user.controller")
const { userProtected } = require("../middleware/protected")

router
    .post("/verify-user-email", userProtected, userController.verifyUserEmail)
    .post("/verify-user-mobile", userProtected, userController.verifyUserMobile)

    .post("/verify-user-email-otp", userProtected, userController.verifyEmailOTP)
    .post("/verify-user-mobile-otp", userProtected, userController.verifyMobileOTP)

    .post("/add-post", userProtected, userController.addPost)
    .post("/get-location", userProtected, userController.getLocation)

    .get("/posts", userController.getAllPosts)



module.exports = router