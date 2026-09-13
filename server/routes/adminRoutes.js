const express = require('express')
const User = require('../models/user')
const authMiddleware = require('../middleware/authMiddleware')
const Notification = require('../models/Notification')
const nodemailer = require('nodemailer')

const router = express.Router()

const adminOnly = (req, res, next) => {
    console.log('USER FROM TOKEN:', req.user)

    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({
            message: 'Admin only'
        })
    }

    next()
}

const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

})

//
// ✅ GET ALL USERS
//
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
    try {
        const users = await User.find({
            isDeleted: { $ne: true }
        }).select('-password')

        return res.json(users)
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
})

// ==========================
// CHANGE ROLE
// ==========================

router.put(
    '/role/:id',
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const { role } = req.body

            const allowedRoles = [
                'Player',
                'Organizer'
            ]


            if (!allowedRoles.includes(role)) {

                return res.status(400).json({
                    message: 'Invalid role'
                })

            }


            const user =
                await User.findById(req.params.id)


            if (!user) {

                return res.status(404).json({
                    message: 'User not found'
                })

            }


            if (user.role === 'Admin') {

                return res.status(400).json({
                    message:
                        'Admin accounts cannot have their role changed'
                })

            }


            user.role = role

            await user.save()


            return res.json({
                message:
                    `Role updated to ${role}`
            })


        } catch (err) {

            return res.status(500).json({
                message: err.message
            })

        }

    }
)

// ==========================
// DELETE USER
// ==========================

router.delete(
    '/users/:id',
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            if (
                req.user.id.toString() ===
                req.params.id.toString()
            ) {

                return res.status(400).json({
                    message:
                        'You cannot delete your own account'
                })

            }


            const user =
                await User.findById(req.params.id)


            if (!user) {

                return res.status(404).json({
                    message: 'User not found'
                })

            }


            if (user.role === 'Admin') {

                return res.status(400).json({
                    message:
                        'Admin accounts cannot be deleted'
                })

            }


            await User.findByIdAndDelete(
                req.params.id
            )


            return res.json({
                message:
                    'User deleted successfully'
            })


        } catch (err) {

            return res.status(500).json({
                message: err.message
            })

        }

    }
)

// ==========================
// ADMIN DASHBOARD STATS
// ==========================
router.get(
    '/stats',
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const mongoose = require('mongoose')
            const Tournament = require('../models/tournament')


            // ==========================
            // USER STATISTICS
            // ==========================

            const totalUsers = await User.countDocuments({
                isDeleted: { $ne: true }
            })

            const players = await User.countDocuments({
                role: 'Player',
                isDeleted: { $ne: true }
            })

            const organizers = await User.countDocuments({
                role: 'Organizer',
                isDeleted: { $ne: true }
            })

            const admins = await User.countDocuments({
                role: 'Admin',
                isDeleted: { $ne: true }
            })

            const restrictedUsers = await User.countDocuments({
                isRestricted: true,
                isDeleted: { $ne: true }
            })


            // ==========================
            // TOURNAMENT STATISTICS
            // ==========================

            const totalTournaments =
                await Tournament.countDocuments()

            const openTournaments =
                await Tournament.countDocuments({
                    status: 'Open'
                })

            const closedTournaments =
                await Tournament.countDocuments({
                    status: 'Closed'
                })

            const ongoingTournaments =
                await Tournament.countDocuments({
                    status: 'Ongoing'
                })

            const finishedTournaments =
                await Tournament.countDocuments({
                    status: 'Finished'
                })


            // ==========================
            // RECENT USERS
            // ==========================

            const recentUsers = await User.find({
                isDeleted: { $ne: true }
            })
                .select(
                    'userId firstName lastName username role isRestricted createdAt'
                )
                .sort({
                    createdAt: -1
                })
                .limit(5)


            // ==========================
            // RECENT TOURNAMENTS
            // ==========================

            const recentTournaments =
                await Tournament.find()
                    .populate(
                        'organizer',
                        'username userId'
                    )
                    .sort({
                        createdAt: -1
                    })
                    .limit(5)


            // ==========================
            // SYSTEM STATUS
            // ==========================

            const databaseConnected =
                mongoose.connection.readyState === 1


            // ==========================
            // RESPONSE
            // ==========================

            res.json({

                totalUsers,
                players,
                organizers,
                admins,
                restrictedUsers,

                totalTournaments,
                openTournaments,
                closedTournaments,
                ongoingTournaments,
                finishedTournaments,

                recentUsers,
                recentTournaments,

                systemStatus: {
                    api: true,
                    database: databaseConnected
                }

            })

        } catch (err) {

            console.error(
                'ADMIN STATS ERROR:',
                err
            )

            res.status(500).json({
                message:
                    'Failed to load admin dashboard',
                error: err.message
            })

        }

    }
)

// ==========================
// RESTRICT / UNRESTRICT USER
// ==========================

router.put(
    '/restrict/:id',
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            // Prevent admin from restricting self
            if (
                req.user.id.toString() ===
                req.params.id.toString()
            ) {

                return res.status(400).json({
                    message:
                        'You cannot restrict your own account'
                })

            }


            const user =
                await User.findById(req.params.id)


            if (!user) {

                return res.status(404).json({
                    message: 'User not found'
                })

            }


            // Protect admin accounts
            if (user.role === 'Admin') {

                return res.status(400).json({
                    message:
                        'Admin accounts cannot be restricted'
                })

            }


            // Toggle restriction
            user.isRestricted =
                !user.isRestricted

            await user.save()


            const message =
                user.isRestricted
                    ? 'Your account has been restricted. You can still access ShuttleHub, but some actions are temporarily unavailable.'
                    : 'Your account restriction has been removed. You can now use all available features again.'


            // Notification
            const notification =
                await Notification.create({

                    user: user._id,

                    message

                })


            // Socket.IO
            const io =
                req.app.get('io')

            if (io) {

                io
                    .to(user._id.toString())
                    .emit(
                        'newNotification',
                        notification
                    )

            }


            return res.json({

                message:
                    user.isRestricted
                        ? 'User restricted successfully'
                        : 'User restriction removed successfully',

                isRestricted:
                    user.isRestricted

            })


        } catch (err) {

            console.error(
                'RESTRICT USER ERROR:',
                err
            )

            return res.status(500).json({

                message:
                    'Failed to update account restriction',

                error:
                    err.message

            })

        }

    }
)

// ==========================
// ORGANIZER REGISTRATION REQUESTS
// ==========================


// ==========================
// GET PENDING ORGANIZER REQUESTS
// ==========================

router.get(
    '/organizer-requests',
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const requests = await User.find({

                role: {
                    $in: [
                        'Player',
                        'Organizer'
                    ]
                },

                'organizerRequest.status':
                    'Pending',

                isDeleted: {
                    $ne: true
                }

            })
                .select('-password')
                .sort({
                    'organizerRequest.requestedAt':
                        -1
                })


            return res.json(requests)


        } catch (err) {

            console.error(
                'FETCH ORGANIZER REQUESTS ERROR:',
                err
            )

            return res.status(500).json({

                message:
                    'Failed to load organizer registration requests',

                error:
                    err.message

            })

        }

    }
)


// ==========================
// APPROVE ORGANIZER REQUEST
// ==========================

router.put(
    '/organizer-requests/:id/approve',
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                )


            if (!user) {

                return res.status(404).json({
                    message:
                        'User not found'
                })

            }


            if (user.isDeleted) {

                return res.status(400).json({
                    message:
                        'This account has been deleted'
                })

            }



            if (
                user.organizerRequest?.status !==
                'Pending'
            ) {

                return res.status(400).json({
                    message:
                        'This Organizer registration is no longer pending'
                })

            }

            // Existing Player requesting
            // Organizer access becomes
            // an Organizer after approval.

            if (user.role === 'Player') {

                user.role = 'Organizer'

            }


            user.organizerAccess = true

            user.organizerRequest.status =
                'Approved'

            user.organizerRequest.reviewedAt =
                new Date()

            user.organizerRequest.reviewedBy =
                req.user.id

            user.organizerRequest.adminNote =
                ''

            user.organizerRequest.rejectionReason =
                ''


            await user.save()


            // ==========================
            // NOTIFICATION
            // ==========================

            const notification =
                await Notification.create({

                    user:
                        user._id,

                    message:
                        'Your Organizer registration has been approved. You can now sign in to your Organizer account.'

                })


            // ==========================
            // SOCKET.IO
            // ==========================

            const io =
                req.app.get('io')


            if (io) {

                io
                    .to(
                        user._id.toString()
                    )
                    .emit(
                        'newNotification',
                        notification
                    )

            }


            return res.json({

                message:
                    'Organizer registration approved successfully',

                user: {

                    id:
                        user._id,

                    userId:
                        user.userId,

                    username:
                        user.username,

                    role:
                        user.role,

                    organizerAccess:
                        user.organizerAccess,

                    organizerRequestStatus:
                        user.organizerRequest.status

                }

            })


        } catch (err) {

            console.error(
                'APPROVE ORGANIZER ERROR:',
                err
            )

            return res.status(500).json({

                message:
                    'Failed to approve Organizer registration',

                error:
                    err.message

            })

        }

    }
)


// ==========================
// REJECT ORGANIZER REQUEST
// ==========================

router.put(
    '/organizer-requests/:id/reject',
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const {
                rejectionReason,
                adminNote
            } = req.body


            // ==========================
            // VALID REASONS
            // ==========================

            const allowedReasons = [

                'Incomplete or invalid information',

                'Duplicate account',

                'Unable to verify account information',

                'Organizer access requirements not met',

                'Suspicious or inappropriate registration',

                'Other'

            ]


            // REASON IS REQUIRED

            if (
                !rejectionReason ||
                !allowedReasons.includes(
                    rejectionReason
                )
            ) {

                return res.status(400).json({
                    message:
                        'Please select a valid rejection reason'
                })

            }


            // "OTHER" REQUIRES EXPLANATION

            if (
                rejectionReason === 'Other' &&
                !adminNote?.trim()
            ) {

                return res.status(400).json({
                    message:
                        'Please provide a reason when selecting Other'
                })

            }


            const user =
                await User.findById(
                    req.params.id
                )


            if (!user) {

                return res.status(404).json({
                    message:
                        'User not found'
                })

            }


            if (user.isDeleted) {

                return res.status(400).json({
                    message:
                        'This account has been deleted'
                })

            }


            if (
                user.organizerRequest?.status !==
                'Pending'
            ) {

                return res.status(400).json({
                    message:
                        'This Organizer registration is no longer pending'
                })

            }


            // ==========================
            // UPDATE REQUEST
            // ==========================

            user.organizerAccess = false

            user.organizerRequest.status =
                'Rejected'

            user.organizerRequest.reviewedAt =
                new Date()

            user.organizerRequest.reviewedBy =
                req.user.id

            user.organizerRequest.adminNote =
                adminNote?.trim() || ''

            user.organizerRequest.rejectionReason =
                rejectionReason


            await user.save()


            // ==========================
            // IN-APP NOTIFICATION
            // ==========================

            const notification =
                await Notification.create({

                    user:
                        user._id,

                    message:
                        `Your Organizer registration was rejected. Reason: ${rejectionReason}`

                })


            // ==========================
            // SOCKET.IO
            // ==========================

            const io =
                req.app.get('io')


            if (io) {

                io
                    .to(
                        user._id.toString()
                    )
                    .emit(
                        'newNotification',
                        notification
                    )

            }


            // ==========================
            // EMAIL
            // ==========================

            try {

                await transporter.sendMail({

                    from:
                        `"ShuttleHub" <${process.env.EMAIL_USER}>`,

                    to:
                        user.email,

                    subject:
                        'ShuttleHub Organizer Registration Update',

                    html: `

                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 520px;
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

                            <h2 style="
                                color: #374151;
                            ">
                                Organizer Registration Update
                            </h2>

                            <p style="
                                color: #6B7280;
                            ">
                                Hello ${user.firstName},
                            </p>

                            <p style="
                                color: #6B7280;
                            ">
                                After reviewing your Organizer
                                registration, we were unable to
                                approve your request at this time.
                            </p>

                            <div style="
                                background: #F9FAFB;
                                border: 1px solid #E5E7EB;
                                border-radius: 12px;
                                padding: 18px;
                                margin: 20px 0;
                            ">

                                <p style="
                                    margin: 0 0 5px 0;
                                    color: #6B7280;
                                    font-size: 13px;
                                ">
                                    Reason
                                </p>

                                <p style="
                                    margin: 0;
                                    color: #374151;
                                    font-weight: bold;
                                ">
                                    ${rejectionReason}
                                </p>

                                ${
                                    adminNote?.trim()
                                        ? `

                                            <p style="
                                                margin: 18px 0 5px 0;
                                                color: #6B7280;
                                                font-size: 13px;
                                            ">
                                                Additional Details
                                            </p>

                                            <p style="
                                                margin: 0;
                                                color: #374151;
                                            ">
                                                ${adminNote.trim()}
                                            </p>

                                        `
                                        : ''
                                }

                            </div>

                            <p style="
                                color: #6B7280;
                            ">
                                If you believe this decision was
                                made in error, please contact the
                                ShuttleHub administrator.
                            </p>

                            <p style="
                                color: #9CA3AF;
                                font-size: 13px;
                                margin-top: 30px;
                            ">
                                This message was sent to the email
                                address used for your ShuttleHub
                                registration.
                            </p>

                        </div>

                    `

                })


            } catch (emailError) {

                console.error(
                    'ORGANIZER REJECTION EMAIL ERROR:',
                    emailError
                )

            }


            return res.json({

                message:
                    'Organizer registration rejected successfully',

                emailSentTo:
                    user.email,

                user: {

                    id:
                        user._id,

                    userId:
                        user.userId,

                    username:
                        user.username,

                    role:
                        user.role,

                    organizerAccess:
                        user.organizerAccess,

                    organizerRequestStatus:
                        user.organizerRequest.status,

                    rejectionReason,

                    adminNote:
                        user.organizerRequest.adminNote

                }

            })


        } catch (err) {

            console.error(
                'REJECT ORGANIZER ERROR:',
                err
            )

            return res.status(500).json({

                message:
                    'Failed to reject Organizer registration',

                error:
                    err.message

            })

        }

    }
)

module.exports = router