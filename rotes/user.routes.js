const router = require("express").Router()
const authController = require("../controllers/auth.controller")
const { userProtected } = require("../middleware/protected")

router
    .post("/verify-user-email", userProtected, authController.registerAdmin)


module.exports = router