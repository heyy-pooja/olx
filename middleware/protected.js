const jwt = require("jsonwebtoken")

exports.userProtected = (req, res, next) => {
    const { user } = req.cookies
    if (!user) {
        return res.status(404).json({ message: "No Cookie Found" })
    }
    jwt.verify(user, process.env.JWT_KEY, (err, decode) => {
        if (err) {
            return res.status(404).json({ message: "JET ERROR", error: err.messagge })
        }
        req.loggedInUser = decode.userId
        next()
    })
}