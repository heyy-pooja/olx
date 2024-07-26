const router = require("express").Router()
const useController = require("../controllers/user.controller")
const { userProtected } = require("../middleware/protected")

router
    .post("/verify-user-email", userProtected, useController.registerAdmin)


module.exports = router