const router = require("express").Router()
const userController = require("../controllers/user.controller")
const { userProtected } = require("../middleware/protected")

router
    .post("/verify-user-email", userProtected, userController.registerAdmin)


module.exports = router