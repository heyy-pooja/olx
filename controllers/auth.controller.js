const asyncHandler = require("express-async-handler")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const sendEmail = require("../utils/email")
const { checkEmpty } = require("./../utils/checkEmpty")

exports.registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = await req.body
    const { isError, error } = checkEmpty({ name, email, password })
    if (isError) {
        return res.status(400).json({ messsage: "All Feilds Required", error })
    }
    if (!validator.isEmail(email)) {

        return res.status(400).json({ messsage: "Invalid Imail", error })
    }
    // if (!validator.isStrongPassword(password)) {

    //     return res.status(400).json({ messsage: "Create Strong Password" })
    // }
    const isFound = await Admin.findOne({ email })
    if (isFound) {
        return res.status(404).json({ message: "email already registered with us" })
    }
    const hash = await bcrypt.hash(password, 10)
    await Admin.create({ name, email, password: hash })
    res.json({ message: "Register Success" })
})

exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const { isError, error } = checkEmpty({ email, password })
    if (isError) {
        return res.status(401).json({ message: "All Feild Require", error })
    }
    if (!validator.isEmail(email)) {
        return res.status(401).json({ message: "Invalid Email" })
    }
    const result = await Admin.findOne({ email })
    if (!result) {
        console.log(req.body);
        console.log(result);
        return res.status(401).json({
            message: process.env.NODE_ENV === "devolopment" ?
                "Invalid Email" : "Invalid Credientials"
        })
    }
    const isVerify = await bcrypt.compare(password, result.password)
    if (!isVerify) {
        return res.status(401).json({
            message: process.env.NODE_ENV === "devolopment" ?
                "Invalid Password" : "Invalid Credientials"
        })
    }
    // send OTP
    const otp = Math.floor(10000 + Math.random() * 900000)   //pakage:nanoid

    await Admin.findByIdAndUpdate(result._id, { otp })
    await sendEmail({
        to: email, subject: `Login Otp`, message: `
        <h1> Do Not Share Your Account OTP</h1>
        <P>Your login  ${otp} </P>
        `})
    res.json({ message: "Creditials Verify Success.OTP Send to Your Register email " })

})

exports.verifyOTP = asyncHandler(async (req, res) => {
    const { otp, email } = req.body
    const { isError, error } = checkEmpty({ otp, email })
    if (isError) {
        return res.status(400).json({ messsage: "All Feilds Required", error })
    }
    if (!validator.isEmail(email)) {

        return res.status(400).json({ messsage: "Invalid Imail", error })
    }


    const result = await Admin.findOne({ email })
    if (!result) {
        return res.status(401).json({
            message: process.env.NODE_ENV === "devolopment" ?
                "Invalid Email" : "Invalid Credientials"
        })
    }

    if (otp !== result.otp) {
        return res.status(401).json({ message: "Invalid OTP" })
    }


    // JWT

    const token = jwt.sign({ userId: result._id }, process.env.JWT_KEY, { expiresIn: "1d" })
    // Cookie
    res.cookie("admin", token, {
        maxAge: 86400000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    })
    // Res
    res.json({
        message: "OTP Verify Success", result: {
            _id: result._id,
            name: result.name,
            email: result.email
        }
    })

})

exports.logoutAdmin = asyncHandler(async (req, res) => {
    res.clearCookie("admin")
    res.json({ message: "Admin Logout Success" })
})


exports.registerUser = asyncHandler(async (req, res) => {
    const { name, mobile, email, password, cpassword } = req.body
    const { error, isError } = checkEmpty({
        name,
        mobile,
        email,
        password,
        cpassword
    })
    if (isError) {
        return res.json({ message: "All Feild Required", error })
    }
    if (!validator.isEmail(email)) { return res.status(404).json({ message: "invalid Email" }) }
    if (!validator.isMobilePhone(mobile, "en-IN")) { return res.status(404).json({ message: "invalid Mobile Number" }) }
    if (!validator.isStrongPassword(password)) { return res.status(404).json({ message: "provide Strong Password" }) }
    if (password !== cpassword) { return res.status(404).json({ message: "Password Do Not Match" }) }

    const result = await User.findOne({ email })
    if (result) {
        res.status(404).json({ message: "email Alreay registerd with us" })
    }
    const hash = await bcrypt.hash(password, 10)
    await User.create({ name, mobile, email, password: hash })
    res.json({ message: "User Register Success" })

})

exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const { error, isError } = checkEmpty({ email, password })
    if (isError) { return res.status(404).json({ message: "All Feild Require", }) }

    const result = await User.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: "Email Not Found" })
    }
    const verify = await bcrypt.compare(password, result.password)
    if (!verify) {
        return res.status(401).json({ message: "Password Do Not Match" })
    }
    const token = jwt.sign({ userId: result._id }, process.env.JWT_KEY, { expiresIn: "180d" })

    res.cookie("user", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "productin",
        maxAge: 1000 * 60 * 60 * 24 * 180
    })

    res.json({ message: "User Register Success" })
})
exports.logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("user")
    res.json({ message: "User Logout Success" })
})

