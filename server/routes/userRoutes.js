const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/authMiddleware')
const User = require('../models/user')
const Tournament = require('../models/tournament')
const QueueSession = require('../models/queueSession')
const Notification = require('../models/Notification')

const router = express.Router()



// ==========================
// GET PROFILE
// ==========================

router.get(
    '/profile',
    authMiddleware,
    async (req, res) => {

        try {

            const user =
                await User.findById(req.user.id)
                    .select('-password')


            if (!user) {

                return res.status(404).json({
                    message: 'User not found'
                })

            }


            return res.json(user)

        } catch (err) {

            console.error(
                'GET PROFILE ERROR:',
                err
            )

            return res.status(500).json({
                message: 'Failed to load profile'
            })

        }

    }
)


// ==========================
// UPDATE PROFILE
// ==========================
router.put('/profile', authMiddleware, async(req,res)=>{

    try{

        const {
            firstName,
            lastName,
            username,
            email
        } = req.body

        // Check username
        const usernameExists = await User.findOne({
            username,
            _id:{ $ne:req.user.id }
        })

        if(usernameExists){

            return res.status(400).json({
                message:'Username already exists'
            })

        }

        // Check email
        const emailExists = await User.findOne({
            email,
            _id:{ $ne:req.user.id }
        })

        if(emailExists){

            return res.status(400).json({
                message:'Email already exists'
            })

        }

        const updatedUser = await User.findByIdAndUpdate(

            req.user.id,

            {
                firstName,
                lastName,
                username,
                email
            },

            {
                new:true
            }

        ).select('-password')

        res.json({
            message:'Profile updated successfully',
            user:updatedUser
        })

    }catch(err){

        res.status(500).json({
            error:err.message
        })

    }

})

// ==========================
// CHANGE PASSWORD
// ==========================
router.put('/change-password', authMiddleware, async(req,res)=>{

    try{

        const {
            currentPassword,
            newPassword
        } = req.body


        const user = await User.findById(req.user.id)


        if(!user){

            return res.status(404).json({
                message:'User not found'
            })

        }


        // Check current password
        const validPassword = await bcrypt.compare(
            currentPassword,
            user.password
        )


        if(!validPassword){

            return res.status(400).json({
                message:'Current password is incorrect.'
            })

        }


        // Hash new password
        user.password = await bcrypt.hash(
            newPassword,
            10
        )


        await user.save()


        res.json({

            message:'Password updated successfully.'

        })


    }catch(err){

        res.status(500).json({

            message:'Server Error'

        })

    }

})

// ==========================
// SWITCH PLAYER / ORGANIZER
// ==========================

router.put(
    '/switch-role',
    authMiddleware,
    async (req, res) => {

        try {

            const {
                role
            } = req.body


            if (
                role !== 'Player' &&
                role !== 'Organizer'
            ) {

                return res.status(400).json({
                    message:
                        'Invalid role'
                })

            }


            const user =
                await User.findById(
                    req.user.id
                )


            if (!user) {

                return res.status(404).json({
                    message:
                        'User not found'
                })

            }


            // Admin accounts cannot
            // switch roles here

            if (user.role === 'Admin') {

                return res.status(403).json({
                    message:
                        'Admin accounts cannot switch roles'
                })

            }


            // User must have been
            // approved as an Organizer

            if (
                user.organizerAccess !== true ||
                user.organizerRequest?.status !==
                    'Approved'
            ) {

                return res.status(403).json({
                    message:
                        'Organizer access has not been approved'
                })

            }


            if (user.role === role) {

                return res.status(400).json({
                    message:
                        `You are already using the ${role} role`
                })

            }


            // ==========================
            // SWITCH ROLE
            // ==========================

            user.role = role

            await user.save()


            // ==========================
            // CREATE NEW TOKEN
            // ==========================

            const token =
                jwt.sign(

                    {
                        id:
                            user._id,

                        role:
                            user.role
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn:
                            '7d'
                    }

                )


            return res.json({

                message:
                    `Switched to ${role} successfully`,

                token,

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
                        user.organizerRequest
                            ?.status || 'None',

                    isRestricted:
                        user.isRestricted

                }

            })


        } catch (err) {

            console.error(
                'SWITCH ROLE ERROR:',
                err
            )


            return res.status(500).json({

                message:
                    'Failed to switch role'

            })

        }

    }
)

// ==========================
// REQUEST ORGANIZER ACCESS
// ==========================

router.post(
    '/request-organizer',
    authMiddleware,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.id
                )


            if (!user) {

                return res.status(404).json({
                    message:
                        'User not found'
                })

            }


            // ==========================
            // ONLY PLAYERS CAN REQUEST
            // ==========================

            if (user.role !== 'Player') {

                return res.status(400).json({
                    message:
                        'Only Player accounts can request Organizer access'
                })

            }


            // ==========================
            // ALREADY APPROVED
            // ==========================

            if (
                user.organizerAccess === true &&
                user.organizerRequest?.status === 'Approved'
            ) {

                return res.status(400).json({
                    message:
                        'You already have approved Organizer access'
                })

            }


            // ==========================
            // PREVENT DUPLICATE REQUEST
            // ==========================

            if (
                user.organizerRequest
                    ?.status === 'Pending'
            ) {

                return res.status(400).json({
                    message:
                        'You already have a pending Organizer request'
                })

            }


            // ==========================
            // GET ORGANIZER APPLICATION
            // ==========================

            const {
                organizerApplication
            } = req.body


            if (
                !organizerApplication ||
                typeof organizerApplication !== 'object'
            ) {

                return res.status(400).json({
                    message:
                        'Organizer application is required'
                })

            }


            // ==========================
            // CLEAN APPLICATION DATA
            // ==========================

            const application = {

                organizationName:
                    String(
                        organizerApplication.organizationName || ''
                    ).trim(),

                organizerType:
                    String(
                        organizerApplication.organizerType || ''
                    ).trim(),

                position:
                    String(
                        organizerApplication.position || ''
                    ).trim(),

                contactNumber:
                    String(
                        organizerApplication.contactNumber || ''
                    ).trim(),

                experience:
                    String(
                        organizerApplication.experience || ''
                    ).trim(),

                previousEvents:
                    String(
                        organizerApplication.previousEvents || ''
                    ).trim(),

                intendedUse:
                    String(
                        organizerApplication.intendedUse || ''
                    ).trim()

            }


            // ==========================
            // VALIDATE REQUIRED FIELDS
            // ==========================

            if (
                !application.organizerType ||
                !application.position ||
                !application.contactNumber ||
                !application.experience ||
                !application.intendedUse
            ) {

                return res.status(400).json({
                    message:
                        'Please complete all required Organizer application fields'
                })

            }


            // ==========================
            // VALIDATE ORGANIZER TYPE
            // ==========================

            const allowedOrganizerTypes = [
                'School / University',
                'Badminton Club / Community',
                'Independent Organizer'
            ]


            if (
                !allowedOrganizerTypes.includes(
                    application.organizerType
                )
            ) {

                return res.status(400).json({
                    message:
                        'Invalid Organizer type'
                })

            }


            // ==========================
            // SAVE ORGANIZER APPLICATION
            // ==========================

            user.organizerApplication =
                application


            // ==========================
            // CREATE ORGANIZER REQUEST
            // ==========================

            user.organizerAccess = false

            user.organizerRequest = {

                status:
                    'Pending',

                requestedAt:
                    new Date(),

                reviewedAt:
                    null,

                reviewedBy:
                    null,

                adminNote:
                    ''

            }


            await user.save()


            // ==========================
            // NOTIFY ALL ADMINS
            // ==========================

            const admins =
                await User.find({

                    role:
                        'Admin',

                    isDeleted: {
                        $ne: true
                    }

                })


            const io =
                req.app.get('io')


            await Promise.all(

                admins.map(
                    async admin => {

                        const notification =
                            await Notification.create({

                                user:
                                    admin._id,

                                message:
                                    `${user.firstName} ${user.lastName} (${user.userId}) submitted an Organizer access application.`,

                                link:
                                    '/admin/users?organizerRequests=open'

                            })


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
                )

            )


            // ==========================
            // RESPONSE
            // ==========================

            return res.json({

                message:
                    'Organizer application submitted successfully',

                organizerRequest: {

                    status:
                        user.organizerRequest.status,

                    requestedAt:
                        user.organizerRequest.requestedAt

                },

                organizerApplication:
                    user.organizerApplication

            })


        } catch (err) {

            console.error(
                'REQUEST ORGANIZER ERROR:',
                err
            )


            return res.status(500).json({

                message:
                    'Failed to submit Organizer application',

                error:
                    err.message

            })

        }

    }
)

// ==========================
// REQUEST ACCOUNT DELETION
// ==========================

router.post(
    '/request-deletion',
    authMiddleware,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.user.id
            )


            if (!user) {

                return res.status(404).json({
                    message: 'User not found'
                })

            }


            if (user.role === 'Admin') {

                return res.status(403).json({
                    message:
                        'Admin accounts cannot request deletion here'
                })

            }


            if (
                user.deletionRequest?.status ===
                'Pending'
            ) {

                return res.status(400).json({
                    message:
                        'You already have a pending account deletion request'
                })

            }


            const reason =
                req.body.reason?.trim() || ''


            user.deletionRequest = {

                status: 'Pending',

                requestedAt:
                    new Date(),

                reason,

                reviewedAt:
                    null,

                reviewedBy:
                    null,

                adminNote:
                    ''

            }


            await user.save()


            // ==========================
            // NOTIFY ALL ADMINS
            // ==========================

            const admins = await User.find({
                role: 'Admin',
                isDeleted: { $ne: true }
            })


            const io =
                req.app.get('io')


            await Promise.all(

                admins.map(async admin => {

                    const notification =
                        await Notification.create({

                            user: admin._id,

                            message:
                                `${user.firstName} ${user.lastName} (${user.userId}) requested account deletion.`

                        })


                    // REAL-TIME NOTIFICATION

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

                })

            )


            return res.json({
                message:
                    'Account deletion request submitted successfully'
            })


        } catch (err) {

            console.error(
                'REQUEST ACCOUNT DELETION ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to submit account deletion request'
            })

        }

    }
)

// ==========================
// CANCEL DELETION REQUEST
// ==========================

router.put(
    '/cancel-deletion',
    authMiddleware,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.user.id
            )


            if (!user) {

                return res.status(404).json({
                    message: 'User not found'
                })

            }


            if (
                user.deletionRequest?.status !==
                'Pending'
            ) {

                return res.status(400).json({
                    message:
                        'You do not have a pending deletion request'
                })

            }


            user.deletionRequest = {

                status: 'None',

                requestedAt: null,

                reason: '',

                reviewedAt: null,

                reviewedBy: null,

                adminNote: ''

            }


            await user.save()


            return res.json({
                message:
                    'Account deletion request cancelled'
            })


        } catch (err) {

            console.error(
                'CANCEL DELETION ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to cancel deletion request'
            })

        }

    }
)

// ==========================
// GET DELETION REQUESTS
// ADMIN ONLY
// ==========================

router.get(
    '/admin/deletion-requests',
    authMiddleware,
    async (req, res) => {

        try {

            // ADMIN ONLY
            if (req.user.role !== 'Admin') {

                return res.status(403).json({
                    message: 'Admin access required'
                })

            }


            // GET USERS WITH PENDING
            // DELETION REQUESTS
            const users = await User.find({
                'deletionRequest.status': 'Pending'
            })
                .select(
                    'userId firstName lastName username email role deletionRequest createdAt'
                )
                .sort({
                    'deletionRequest.requestedAt': -1
                })


            // CHECK EACH USER'S
            // ACTIVE RESPONSIBILITIES
            const requests = await Promise.all(

                users.map(async (user) => {

                    let activeTournaments = []
                    let activeQueueSessions = []


                    // ==========================
                    // ORGANIZER IMPACT
                    // ==========================

                    if (user.role === 'Organizer') {

                        // ACTIVE TOURNAMENTS
                        activeTournaments =
                            await Tournament.find({

                                organizer: user._id,

                                status: {
                                    $in: [
                                        'Open',
                                        'Ongoing'
                                    ]
                                }

                            })
                                .select(
                                    'title status startDate location'
                                )


                        // ACTIVE QUICK PLAY
                        activeQueueSessions =
                            await QueueSession.find({

                                organizer: user._id,

                                status: {
                                    $in: [
                                        'Open',
                                        'Closed'
                                    ]
                                }

                            })
                                .select(
                                    'name status gameType numberOfCourts location'
                                )

                    }


                    return {

                        user,

                        impact: {

                            activeTournaments,

                            activeQueueSessions,

                            hasActiveResponsibilities:
                                activeTournaments.length > 0 ||
                                activeQueueSessions.length > 0

                        }

                    }

                })

            )


            return res.json(requests)


        } catch (err) {

            console.error(
                'GET DELETION REQUESTS ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to load deletion requests'
            })

        }

    }
)

// ==========================
// REJECT DELETION REQUEST
// ADMIN ONLY
// ==========================

router.put(
    '/admin/deletion-requests/:id/reject',
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Admin') {

                return res.status(403).json({
                    message:
                        'Admin access required'
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


            if (
                user.deletionRequest?.status !==
                'Pending'
            ) {

                return res.status(400).json({
                    message:
                        'This user does not have a pending deletion request'
                })

            }


            user.deletionRequest.status =
                'Rejected'

            user.deletionRequest.reviewedAt =
                new Date()

            user.deletionRequest.reviewedBy =
                req.user.id

            user.deletionRequest.adminNote =
                req.body.adminNote?.trim() || ''


            await user.save()


            return res.json({
                message:
                    'Account deletion request rejected'
            })


        } catch (err) {

            console.error(
                'REJECT DELETION ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to reject deletion request'
            })

        }

    }
)

// ==========================
// APPROVE DELETION REQUEST
// ADMIN ONLY
// ==========================

router.put(
    '/admin/deletion-requests/:id/approve',
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Admin') {

                return res.status(403).json({
                    message:
                        'Admin access required'
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


            if (user.role === 'Admin') {

                return res.status(403).json({
                    message:
                        'Admin accounts cannot be deleted'
                })

            }


            if (
                user.deletionRequest?.status !==
                'Pending'
            ) {

                return res.status(400).json({
                    message:
                        'This user does not have a pending deletion request'
                })

            }


            // ==========================
            // CHECK ORGANIZER
            // RESPONSIBILITIES AGAIN
            // ==========================

            if (user.role === 'Organizer') {

                const activeTournaments =
                    await Tournament.find({

                        organizer: user._id,

                        status: {
                            $in: [
                                'Open',
                                'Ongoing'
                            ]
                        }

                    })


                const activeQueueSessions =
                    await QueueSession.find({

                        organizer: user._id,

                        status: {
                            $in: [
                                'Open',
                                'Closed'
                            ]
                        }

                    })


                if (
                    activeTournaments.length > 0 ||
                    activeQueueSessions.length > 0
                ) {

                    return res.status(400).json({

                        message:
                            'This organizer still has active tournaments or Quick Play sessions. Resolve them before approving account deletion.',

                        impact: {
                            activeTournaments,
                            activeQueueSessions
                        }

                    })

                }

            }


            // ==========================
            // SOFT DELETE
            // ==========================

            user.isDeleted = true
            user.deletedAt = new Date()

            user.deletionRequest.status =
                'Approved'

            user.deletionRequest.reviewedAt =
                new Date()

            user.deletionRequest.reviewedBy =
                req.user.id


            await user.save()


            return res.json({
                message:
                    'Account deletion request approved'
            })


        } catch (err) {

            console.error(
                'APPROVE DELETION ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to approve deletion request'
            })

        }

    }
)

// =========================
// REJECT DELETION
// =========================

const rejectDeletion = async (request) => {

    const result = await Swal.fire({

        title: 'Reject Deletion Request?',

        html: `
            <div style="text-align:left">

                <p style="
                    color:#6B7280;
                    margin-bottom:15px;
                ">
                    The user's account will remain active.
                </p>

                <label style="
                    display:block;
                    font-size:14px;
                    font-weight:600;
                    color:#4B5563;
                    margin-bottom:7px;
                ">
                    Reason (optional)
                </label>

                <textarea
                    id="admin-note"
                    class="swal2-textarea"
                    placeholder="Reason for rejecting the request..."
                    style="
                        width:100%;
                        margin:0;
                        box-sizing:border-box;
                    "
                ></textarea>

            </div>
        `,

        icon: 'question',

        showCancelButton: true,

        confirmButtonColor: '#EF4444',

        cancelButtonColor: '#9CA3AF',

        confirmButtonText:
            'Reject Request',

        cancelButtonText:
            'Cancel',

        preConfirm: () => {

            return document
                .getElementById(
                    'admin-note'
                )
                ?.value
                ?.trim() || ''

        }

    })


    if (!result.isConfirmed) {
        return
    }


    try {

        const res = await axios.put(

            `http://localhost:5000/api/users/admin/deletion-requests/${request.user._id}/reject`,

            {
                adminNote:
                    result.value
            },

            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }

        )


        await Swal.fire({
            title: 'Request Rejected',
            text: res.data.message,
            icon: 'success',
            confirmButtonColor: '#34C759'
        })


        fetchDeletionRequests()


    } catch (err) {

        Swal.fire({

            title: 'Action Failed',

            text:
                err.response?.data?.message ||
                'Failed to reject deletion request.',

            icon: 'error',

            confirmButtonColor: '#EF4444'

        })

    }

}

// =========================
// APPROVE DELETION
// =========================

const approveDeletion = async (request) => {

    if (
        request.impact
            ?.hasActiveResponsibilities
    ) {

        await Swal.fire({

            title:
                'Cannot Approve Yet',

            text:
                'This organizer still has active tournaments or Quick Play sessions. Resolve them before approving account deletion.',

            icon: 'warning',

            confirmButtonColor:
                '#34C759'

        })


        return

    }


    const result = await Swal.fire({

        title:
            'Approve Account Deletion?',

        text:
            'This user will no longer be able to access their ShuttleHub account.',

        icon: 'warning',

        showCancelButton: true,

        confirmButtonColor:
            '#EF4444',

        cancelButtonColor:
            '#9CA3AF',

        confirmButtonText:
            'Approve Deletion',

        cancelButtonText:
            'Cancel'

    })


    if (!result.isConfirmed) {
        return
    }


    try {

        const res = await axios.put(

            `http://localhost:5000/api/users/admin/deletion-requests/${request.user._id}/approve`,

            {},

            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }

        )


        await Swal.fire({

            title:
                'Deletion Approved',

            text:
                res.data.message,

            icon: 'success',

            confirmButtonColor:
                '#34C759'

        })


        fetchDeletionRequests()
        fetchUsers()


    } catch (err) {

        Swal.fire({

            title: 'Action Failed',

            text:
                err.response?.data?.message ||
                'Failed to approve deletion request.',

            icon: 'error',

            confirmButtonColor:
                '#EF4444'

        })

    }

}

module.exports = router