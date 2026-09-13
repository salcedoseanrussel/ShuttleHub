const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const Notification = require('../models/Notification')

const router = express.Router()

const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

})

// ==========================
// REQUEST PASSWORD RESET
// ==========================

router.post(
    '/forgot-password',
    async (req, res) => {

        try {

            const { email } = req.body


            if (!email) {

                return res.status(400).json({
                    message:
                        'Email address is required'
                })

            }


            const normalizedEmail =
                email.trim().toLowerCase()


            const user = await User.findOne({
                email: normalizedEmail
            })


            if (!user) {

                return res.status(404).json({
                    message:
                        'No ShuttleHub account was found with this email address'
                })

            }

            if (user.isDeleted) {

                return res.status(403).json({
                    message:
                        'This account has been deleted.'
                })

            }


            // 6-DIGIT CODE

            const resetCode =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString()


            user.resetPasswordCode =
                resetCode

            user.resetPasswordExpires =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                )


            await user.save()


            try {

                await transporter.sendMail({

                    from:
                        `"ShuttleHub" <${process.env.EMAIL_USER}>`,

                    to:
                        user.email,

                    subject:
                        'ShuttleHub Password Reset Code',

                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 500px;
                            margin: auto;
                            padding: 30px;
                        ">

                            <h1 style="
                                color: #34C759;
                                margin-bottom: 5px;
                            ">
                                ShuttleHub
                            </h1>

                            <p style="
                                color: #6B7280;
                                margin-top: 0;
                            ">
                                Badminton Manager
                            </p>

                            <hr style="
                                border: none;
                                border-top: 1px solid #E5E7EB;
                                margin: 25px 0;
                            ">

                            <h2 style="color: #374151;">
                                Reset your password
                            </h2>

                            <p style="color: #6B7280;">
                                We received a request to reset
                                the password for your ShuttleHub
                                account.
                            </p>

                            <p style="color: #6B7280;">
                                Your verification code is:
                            </p>

                            <div style="
                                background: #F3F4F6;
                                padding: 20px;
                                text-align: center;
                                border-radius: 12px;
                                margin: 20px 0;
                            ">

                                <span style="
                                    font-size: 32px;
                                    font-weight: bold;
                                    letter-spacing: 8px;
                                    color: #34C759;
                                ">
                                    ${resetCode}
                                </span>

                            </div>

                            <p style="color: #6B7280;">
                                This code will expire in
                                <strong>10 minutes</strong>.
                            </p>

                            <p style="
                                color: #9CA3AF;
                                font-size: 13px;
                            ">
                                If you did not request a password
                                reset, you can ignore this email.
                            </p>

                        </div>
                    `

                })


            } catch (emailError) {

                console.error(
                    'RESET EMAIL ERROR:',
                    emailError
                )


                user.resetPasswordCode = null
                user.resetPasswordExpires = null

                await user.save()


                return res.status(500).json({
                    message:
                        'Failed to send verification code'
                })

            }


            return res.json({
                message:
                    'A verification code has been sent to your email'
            })


        } catch (err) {

            console.error(
                'FORGOT PASSWORD ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to process password reset request'
            })

        }

    }
)

// ==========================
// VERIFY RESET CODE
// ==========================

router.post(
    '/verify-reset-code',
    async (req, res) => {

        try {

            const {
                email,
                code
            } = req.body


            if (!email || !code) {

                return res.status(400).json({
                    message:
                        'Email and verification code are required'
                })

            }


            const user =
                await User.findOne({
                    email:
                        email.trim().toLowerCase()
                })


            if (
                !user ||
                !user.resetPasswordCode ||
                user.resetPasswordCode !==
                    code.trim()
            ) {

                return res.status(400).json({
                    message:
                        'Invalid verification code'
                })

            }


            if (
                !user.resetPasswordExpires ||
                user.resetPasswordExpires <
                    new Date()
            ) {

                user.resetPasswordCode = null
                user.resetPasswordExpires = null

                await user.save()


                return res.status(400).json({
                    message:
                        'Verification code has expired. Request a new code.'
                })

            }


            return res.json({
                message:
                    'Verification successful'
            })


        } catch (err) {

            console.error(
                'VERIFY RESET CODE ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to verify code'
            })

        }

    }
)

// ==========================
// RESET PASSWORD
// ==========================

router.post(
    '/reset-password',
    async (req, res) => {

        try {

            const {
                email,
                code,
                newPassword
            } = req.body


            if (
                !email ||
                !code ||
                !newPassword
            ) {

                return res.status(400).json({
                    message:
                        'All fields are required'
                })

            }


            if (newPassword.length < 6) {

                return res.status(400).json({
                    message:
                        'Password must be at least 6 characters'
                })

            }


            const user =
                await User.findOne({
                    email:
                        email.trim().toLowerCase()
                })


            if (
                !user ||
                !user.resetPasswordCode ||
                user.resetPasswordCode !==
                    code.trim()
            ) {

                return res.status(400).json({
                    message:
                        'Invalid verification code'
                })

            }


            if (
                !user.resetPasswordExpires ||
                user.resetPasswordExpires <
                    new Date()
            ) {

                return res.status(400).json({
                    message:
                        'Verification code has expired'
                })

            }


            const samePassword =
                await bcrypt.compare(
                    newPassword,
                    user.password
                )


            if (samePassword) {

                return res.status(400).json({
                    message:
                        'New password must be different from your current password'
                })

            }


            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                )


            user.password =
                hashedPassword

            user.resetPasswordCode =
                null

            user.resetPasswordExpires =
                null


            await user.save()


            return res.json({
                message:
                    'Password reset successfully'
            })


        } catch (err) {

            console.error(
                'RESET PASSWORD ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to reset password'
            })

        }

    }
)

// ==========================
// GENERATE USER ID
// ==========================

const generateUserId = async (role) => {

    const year = new Date().getFullYear().toString().slice(-2)

    let roleCode

    if (role === 'Player') {
        roleCode = 'P'
    }
    else if (role === 'Organizer') {
        roleCode = 'O'
    }
    else if (role === 'Admin') {
        roleCode = 'A'
    }
    else {
        throw new Error('Invalid user role')
    }

    const prefix = `${year}${roleCode}`

    const lastUser = await User.findOne({
        userId: {
            $regex: `^${prefix}`
        }
    }).sort({
        userId: -1
    })

    let nextNumber = 1

    if (lastUser?.userId) {

        const lastNumber =
            parseInt(lastUser.userId.slice(3))

        nextNumber = lastNumber + 1

    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`

}


// ==========================
// REGISTER
// ==========================

router.post('/register', async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            username,
            email,
            password,
            role,
            organizerApplication
        } = req.body

        const allowedRoles = ['Player', 'Organizer']

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: 'Invalid role'
            })
        }


        // ==========================
        // ORGANIZER APPLICATION VALIDATION
        // ==========================

        if (role === 'Organizer') {

            if (
                !organizerApplication ||
                !organizerApplication.organizerType?.trim() ||
                !organizerApplication.position?.trim() ||
                !organizerApplication.contactNumber?.trim() ||
                !organizerApplication.experience?.trim() ||
                !organizerApplication.intendedUse?.trim()
            ) {

                return res.status(400).json({
                    message:
                        'Please complete all required Organizer application fields.'
                })

            }

        }


        // CHECK EXISTING USER
        const existingUser = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            })

        }


        // GENERATE USER ID
        const userId = await generateUserId(role)


        // HASH PASSWORD
        const hashedPassword =
            await bcrypt.hash(password, 10)


        // CREATE USER
        const user = new User({

            userId,

            firstName,
            lastName,
            username,
            email,

            password: hashedPassword,

            role,

            organizerAccess: false,

            organizerApplication:
                role === 'Organizer'
                    ? {
                        organizationName:
                            organizerApplication.organizationName?.trim() || '',

                        organizerType:
                            organizerApplication.organizerType.trim(),

                        position:
                            organizerApplication.position.trim(),

                        contactNumber:
                            organizerApplication.contactNumber.trim(),

                        experience:
                            organizerApplication.experience.trim(),

                        previousEvents:
                            organizerApplication.previousEvents?.trim() || '',

                        intendedUse:
                            organizerApplication.intendedUse.trim()
                    }
                    : undefined,

            organizerRequest:
                role === 'Organizer'
                    ? {
                        status: 'Pending',
                        requestedAt: new Date()
                    }
                    : {
                        status: 'None'
                    }

        })


        await user.save()


        // ==========================
        // ORGANIZER REGISTRATION
        // ==========================

        if (role === 'Organizer') {

        // ==========================
        // NOTIFY ADMINS
        // ==========================

        const admins = await User.find({
            role: 'Admin',
            isDeleted: {
                $ne: true
            }
        })


        const notificationMessage =
            `${user.firstName} ${user.lastName} (${user.userId}) submitted an Organizer registration.`


        for (const admin of admins) {

            const notification =
                await Notification.create({

                    user:
                        admin._id,

                    message:
                        notificationMessage,

                    link:
                        '/admin/users?organizerRequests=open'

                })


            // ==========================
            // REAL-TIME NOTIFICATION
            // ==========================

            const io =
                req.app.get('io')


            if (io) {

                io
                    .to(
                        admin._id.toString()
                    )
                    .emit(
                        'newNotification',
                        notification
                    )

            }

        }


        return res.status(201).json({

            message:
                'Organizer registration submitted. Please wait for Admin approval.',

            pendingApproval: true,

            user: {

                id:
                    user._id,

                userId:
                    user.userId,

                firstName:
                    user.firstName,

                lastName:
                    user.lastName,

                username:
                    user.username,

                email:
                    user.email,

                role:
                    user.role,

                organizerAccess:
                    user.organizerAccess,

                organizerRequestStatus:
                    user.organizerRequest?.status ||
                    'Pending'

            }

        })

    }


        // ==========================
        // PLAYER LOGIN TOKEN
        // ==========================

        const token = jwt.sign(

            {
                id: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '7d'
            }

        )


        // ==========================
        // RETURN PLAYER LOGIN
        // ==========================

        return res.status(201).json({

            message:
                'User Registered Successfully',

            token,

            user: {

                id: user._id,

                userId: user.userId,

                firstName: user.firstName,

                lastName: user.lastName,

                username: user.username,

                email: user.email,

                role: user.role,

                isRestricted:
                    user.isRestricted

            }

        })


    } catch (err) {

        return res.status(500).json({
            error: err.message
        })

    }

})


// ==========================
// LOGIN
// ==========================

router.post('/login', async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body


        const loginValue =
            username.trim()


        const user = await User.findOne({
            $or: [
                {
                    username: {
                        $regex: `^${loginValue}$`,
                        $options: 'i'
                    }
                },
                {
                    userId: {
                        $regex: `^${loginValue}$`,
                        $options: 'i'
                    }
                }
            ]
        })


        if (!user) {

            return res.status(400).json({
                message: 'User not found'
            })

        }


        if (user.isDeleted) {

            return res.status(403).json({
                message:
                    'This account has been deleted.'
            })

        }


        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            )


        if (!isMatch) {

            return res.status(400).json({
                message: 'Invalid password'
            })

        }


        // ==========================
        // ORGANIZER APPROVAL CHECK
        // ==========================

        if (
            user.role === 'Organizer' &&
            user.organizerRequest?.status === 'Pending'
        ) {

            return res.status(403).json({
                message:
                    'Your Organizer registration is still waiting for Admin approval.'
            })

        }


        if (
            user.role === 'Organizer' &&
            user.organizerRequest?.status === 'Rejected'
        ) {

            return res.status(403).json({
                message:
                    'Your Organizer registration was rejected.'
            })

        }


        if (
            user.role === 'Organizer' &&
            user.organizerAccess !== true
        ) {

            return res.status(403).json({
                message:
                    'Your Organizer account has not been approved yet.'
            })

        }




        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        )


        return res.status(200).json({

            message: 'Login Successful',

            token,

            user: {

                id: user._id,

                userId: user.userId,

                firstName: user.firstName,

                lastName: user.lastName,

                username: user.username,

                email: user.email,

                role: user.role,

                organizerAccess:
                    user.organizerAccess,

                organizerRequestStatus:
                    user.organizerRequest?.status ||
                    'None',

                isRestricted:
                    user.isRestricted

            }

        })


    } catch (err) {

        console.error(
            'LOGIN ERROR:',
            err
        )

        return res.status(500).json({
            error: err.message
        })

    }

})


module.exports = router