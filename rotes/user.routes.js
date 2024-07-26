const router = require("express").Router()
const authController = require("../controllers/auth.controller")

router
    .post("/verify-user-email", userProtected, authController.registerAdmin)


module.exports = router