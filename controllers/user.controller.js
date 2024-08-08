const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
const { checkEmpty } = require("../utils/checkEmpty")
const Posts = require("../models/Posts")
const cloudinary = require("../utils/cloudinary.config")
const upload = require("../utils/upload")

exports.verifyUserEmail = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)

    if (!result) {
        return res.status(401).json({ message: "You Are Not Log in. please Login" })
    }

    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailCode: otp })
    sendEmail({ to: result.email, subject: "Verify Email", message: `<p>Your Otp ${otp}</p>` })

    res.json({ message: "Verification send Success" })
})
exports.verifyUserMobile = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { mobileCode: otp })
    await sendSMS({
        message: `welcome to SkillHub. Your OTP is ${otp}`,
        numbers: `${result.mobile}`
    })
})

exports.verifyEmailOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You Are Not Log in. please Login" })
    }
    if (otp != result.emailCode) {
        return res.status(400).json({ message: "Inavalid OTP" })
    }
    await User.findByIdAndUpdate(req.loggedInUser, { emailVerified: true })
    res.json({ message: "Email Verify Success" })

})
exports.verifyMobileOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You Are Not Log in. please Login" })
    }
    if (otp !== result.mobileCode) {
        return res.status(400).json({ message: "Inavalid OTP" })
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.loggedInUser,
        { mobileVerified: true },
        { new: true }
    )
    res.json({
        message: "mobile Verify Success", result: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            avatar: updatedUser.avatar,
            emailVerified: updatedUser.emailVerified,
            mobileVerified: updatedUser.mobileVerified
        }
    })

})

exports.getLocation = asyncHandler(async (req, res) => {
    const { gps } = req.body
    const { isError, error } = checkEmpty({ gps })
    if (isError) {
        return res.status(400).json({ message: "All Feilds Require", error })
    }
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPEN_CAGE_API_KEY}=${gps.latitude}%2C${gps.longitude}&pretty=1&no_annotations=1`)
    const x = await response.json()
    // console.log(x)
    // const x = await response.json()
    res.json({ message: "Location Ftch Success", result: x.results[0].formatted })

})
exports.addPost = asyncHandler(async (req, res) => {
    upload(req, res, async err => {

        const { title, desc, price, location, category } = req.body
        const { error, isError } = checkEmpty({ title, desc, price, location, category })
        if (isError) {
            return res.status(400).json({ message: "All Feilds Are Require", error })
        }
        console.log(req.files)
        const images = []

        for (const item of req.files) {
            const { secure_url } = await cloudinary.uploader.upload(item.path)
            images.push(secure_url)
        }

        // api call to openCage
        // modify this code to support cloudinary



        await Posts.create({
            title,
            desc,
            price,
            images,
            location,
            category,
            user: req.loggedInUser
        })
        res.json({ message: "posts Create Success" })
    })
})

exports.getAllPosts = asyncHandler(async (req, res) => {
    const result = await Posts.find()
    res.json({ message: "post fetch success", result })

})



// host
// test