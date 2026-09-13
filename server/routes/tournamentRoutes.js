const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Tournament = require('../models/tournament')
const TournamentMatch = require('../models/tournamentMatch')
const TournamentTeam = require('../models/tournamentTeam')
const TournamentRegistration = require('../models/tournamentRegistration')
const authMiddleware = require('../middleware/authMiddleware')
const Notification = require('../models/Notification')
const User = require('../models/user')
const restrictionMiddleware = require('../middleware/restrictionMiddleware')

const router = express.Router()

const receiptUploadDirectory = path.join(
    __dirname,
    '..',
    'uploads',
    'payment-receipts'
)

fs.mkdirSync(receiptUploadDirectory, {
    recursive: true
})

const receiptStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, receiptUploadDirectory)
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase()
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
        cb(null, uniqueName)
    }
})

const receiptUpload = multer({
    storage: receiptStorage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ]

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    'Payment receipt must be a JPG, PNG, or WEBP image'
                )
            )
        }

        cb(null, true)
    }
})

const reservedRegistrationCount = async tournament => {
    const pendingCount = await TournamentRegistration.countDocuments({
        tournament: tournament._id,
        registrationStatus: 'Pending'
    })

    return (
        (tournament.players?.length || 0) +
        pendingCount
    )
}

const updateTournamentStatus = (tournament) => {

    const now = new Date()

    // Finished tournaments stay finished
    if (tournament.status === 'Finished') {
        return 'Finished'
    }

    // Ongoing tournaments stay ongoing until the organizer finishes them
    if (tournament.status === 'Ongoing') {
        return 'Ongoing'
    }

    // Tournament is already full
    if (
        tournament.maxPlayers &&
        tournament.players?.length >= tournament.maxPlayers
    ) {
        return 'Closed'
    }

    // Registration deadline has passed
    if (
        tournament.registrationDeadline &&
        new Date(tournament.registrationDeadline) <= now
    ) {
        return 'Closed'
    }

    // Still accepting registrations
    return 'Open'
}

// ==========================
// CREATE TOURNAMENT
// ==========================
router.post(
    '/create',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

    console.log('CREATE TOURNAMENT ROUTE HIT')
    console.log('USER:', req.user)
    console.log('BODY:', req.body)

    try {

        if (req.user.role !== 'Organizer') {
            return res.status(403).json({
                message: 'Only organizers can create tournaments'
            })
        }

        const registrationType =
            req.body.registrationType === 'Paid'
                ? 'Paid'
                : 'Free'

        if (registrationType === 'Paid') {
            if (
                !req.body.registrationFee ||
                Number(req.body.registrationFee) <= 0
            ) {
                return res.status(400).json({
                    message: 'A paid tournament must have a registration fee greater than 0'
                })
            }

            if (
                !req.body.paymentInstructions?.method?.trim() ||
                !req.body.paymentInstructions?.accountName?.trim() ||
                !req.body.paymentInstructions?.accountNumber?.trim()
            ) {
                return res.status(400).json({
                    message: 'Complete the payment method, account name, and account number'
                })
            }
        }

        const tournament = new Tournament({
            ...req.body,
            registrationType,
            registrationFee:
                registrationType === 'Paid'
                    ? Number(req.body.registrationFee)
                    : 0,
            paymentInstructions:
                registrationType === 'Paid'
                    ? req.body.paymentInstructions
                    : {
                        method: '',
                        accountName: '',
                        accountNumber: ''
                    },
            organizer: new mongoose.Types.ObjectId(req.user.id),
            players: []
        })

        await tournament.save()

        const organizer = await User.findById(req.user.id)

        // notify organizer
        const organizerNotification = await Notification.create({
            user: organizer._id,
            tournament: tournament._id,
            message: `You created "${tournament.title}"`,
            organizerUsername: organizer.username
        })

        req.app
            .get('io')
            .to(organizer._id.toString())
            .emit('newNotification', organizerNotification)

        // notify players
        const players = await User.find({ role: 'Player' })

        for (const player of players) {

            const notification = await Notification.create({
                user: player._id,
                tournament: tournament._id,
                message: `${organizer.username} created "${tournament.title}"`,
                organizerUsername: organizer.username
            })

            req.app
                .get('io')
                .to(player._id.toString())
                .emit('newNotification', notification)

        }

        // notify admins
        const admins = await User.find({ role: 'Admin' })

        for (const admin of admins) {

            const notification = await Notification.create({
                user: admin._id,
                tournament: tournament._id,
                message: `Organizer ${organizer.username} created "${tournament.title}"`,
                organizerUsername: organizer.username
            })

            req.app
                .get('io')
                .to(admin._id.toString())
                .emit('newNotification', notification)

        }

        res.status(201).json({
            message: 'Tournament Created Successfully',
            tournament
        })

    } catch (err) {

        console.error('==============================')
        console.error('CREATE TOURNAMENT ERROR')
        console.error(err)
        console.error('==============================')

        res.status(500).json({
            message: 'Failed to create tournament',
            error: err.message
        })

    }
})


// ==========================
// GET ALL TOURNAMENTS
// ==========================
router.get('/', async (req, res) => {

    try {

        const tournaments = await Tournament.find()
            .populate('organizer', 'username')

        for (const tournament of tournaments) {

            const newStatus = updateTournamentStatus(tournament)

            if (tournament.status !== newStatus) {

                tournament.status = newStatus

                await tournament.save()

            }

        }

        res.json(tournaments)

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'Failed to fetch tournaments',
            error: err.message
        })

    }

})


// ==========================
// JOIN / REGISTER FOR TOURNAMENT
// ==========================
router.post(
    '/join/:id',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

    try {

        const tournament = await Tournament.findById(req.params.id)

        if (!tournament) {
            return res.status(404).json({
                message: 'Tournament not found'
            })
        }

        if (req.user.role !== 'Player') {
            return res.status(403).json({
                message: 'Only players can join tournaments'
            })
        }

        if (
            tournament.organizer.toString() ===
            req.user.id
        ) {
            return res.status(403).json({
                message: 'You cannot join your own tournament as a player'
            })
        }

        const currentStatus = updateTournamentStatus(tournament)

        if (tournament.status !== currentStatus) {
            tournament.status = currentStatus
            await tournament.save()
        }

        if (currentStatus === 'Ongoing') {
            return res.status(400).json({
                message: 'You cannot join a tournament that has already started'
            })
        }

        if (currentStatus === 'Finished') {
            return res.status(400).json({
                message: 'You cannot join a finished tournament'
            })
        }

        if (currentStatus === 'Closed') {
            return res.status(400).json({
                message: 'Registration is closed'
            })
        }

        if (
            tournament.registrationDeadline &&
            new Date() >= new Date(tournament.registrationDeadline)
        ) {
            return res.status(400).json({
                message: 'Registration is closed'
            })
        }

        const alreadyJoined = tournament.players.some(
            player => player.toString() === req.user.id
        )

        if (alreadyJoined) {
            return res.status(400).json({
                message: 'You have already joined this tournament'
            })
        }

        let registration = await TournamentRegistration.findOne({
            tournament: tournament._id,
            player: req.user.id
        })

        if (
            registration &&
            ['Pending', 'Confirmed'].includes(
                registration.registrationStatus
            )
        ) {
            return res.status(400).json({
                message:
                    registration.paymentStatus === 'For Verification'
                        ? 'Your payment is already waiting for verification'
                        : registration.paymentStatus === 'Pending Payment'
                            ? 'You are already registered. Complete your payment to continue.'
                            : 'You already have an active registration for this tournament'
            })
        }

        const reservedCount = await reservedRegistrationCount(tournament)

        if (
            tournament.maxPlayers &&
            reservedCount >= tournament.maxPlayers
        ) {
            return res.status(400).json({
                message: 'Tournament is full'
            })
        }

        const player = await User.findById(req.user.id)
        const organizer = await User.findById(tournament.organizer)

        if (tournament.registrationType !== 'Paid') {

            if (!registration) {
                registration = new TournamentRegistration({
                    tournament: tournament._id,
                    player: req.user.id
                })
            }

            registration.amount = 0
            registration.paymentMethod = ''
            registration.paymentReference = ''
            registration.paymentReceipt = ''
            registration.registrationStatus = 'Confirmed'
            registration.paymentStatus = 'Not Required'
            registration.rejectionReason = ''
            registration.submittedAt = new Date()
            registration.verifiedAt = new Date()
            registration.verifiedBy = null

            await registration.save()

            tournament.players.push(
                new mongoose.Types.ObjectId(req.user.id)
            )

            await tournament.save()

            if (organizer) {
                const notification = await Notification.create({
                    user: organizer._id,
                    tournament: tournament._id,
                    message: `${player.username} joined "${tournament.title}"`,
                    organizerUsername: organizer.username
                })

                req.app
                    .get('io')
                    .to(organizer._id.toString())
                    .emit('newNotification', notification)
            }

            return res.json({
                message: 'Joined successfully',
                registration
            })
        }

        if (!registration) {
            registration = new TournamentRegistration({
                tournament: tournament._id,
                player: req.user.id
            })
        }

        registration.amount = tournament.registrationFee
        registration.paymentMethod =
            tournament.paymentInstructions?.method || ''
        registration.paymentReference = ''
        registration.paymentReceipt = ''
        registration.registrationStatus = 'Pending'
        registration.paymentStatus = 'Pending Payment'
        registration.rejectionReason = ''
        registration.submittedAt = null
        registration.verifiedAt = null
        registration.verifiedBy = null

        await registration.save()

        if (organizer) {
            const notification = await Notification.create({
                user: organizer._id,
                tournament: tournament._id,
                message: `${player.username} registered for "${tournament.title}" and is waiting to submit payment`,
                organizerUsername: organizer.username
            })

            req.app
                .get('io')
                .to(organizer._id.toString())
                .emit('newNotification', notification)
        }

        return res.json({
            message: 'Registration created. Please submit your payment for verification.',
            registration
        })

    } catch (err) {

        console.error('JOIN TOURNAMENT ERROR:', err)

        return res.status(500).json({
            message: 'Failed to join tournament',
            error: err.message
        })

    }

})


// ==========================
// LEAVE TOURNAMENT
// ==========================
router.post('/leave/:id', authMiddleware, async (req, res) => {

    try {

        const tournament = await Tournament.findById(req.params.id)

        if (!tournament) {
            return res.status(404).json({
                message: 'Tournament not found'
            })
        }

        // Only players can leave
        if (req.user.role !== 'Player') {
            return res.status(403).json({
                message: 'Only players can leave tournaments'
            })
        }

        // Update status
        const currentStatus = updateTournamentStatus(tournament)

        if (tournament.status !== currentStatus) {
            tournament.status = currentStatus
            await tournament.save()
        }

        // Cannot leave once tournament starts
        if (currentStatus === 'Ongoing') {
            return res.status(400).json({
                message: 'You cannot leave a tournament that has already started'
            })
        }

        // Cannot leave finished tournament
        if (currentStatus === 'Finished') {
            return res.status(400).json({
                message: 'This tournament has already finished'
            })
        }

        const registration = await TournamentRegistration.findOne({
            tournament: tournament._id,
            player: req.user.id
        })

        const playerIndex = tournament.players.findIndex(
            player => player.toString() === req.user.id
        )

        const hasPendingRegistration =
            registration &&
            registration.registrationStatus === 'Pending'

        if (
            playerIndex === -1 &&
            !hasPendingRegistration
        ) {
            return res.status(400).json({
                message: 'You do not have an active registration in this tournament'
            })
        }

        if (playerIndex !== -1) {
            tournament.players.splice(playerIndex, 1)
            await tournament.save()
        }

        if (registration) {
            registration.registrationStatus = 'Cancelled'
            await registration.save()
        }

        // Remove any pre-start doubles pairing that contains this player
        await TournamentTeam.deleteMany({
            tournament: tournament._id,
            players: new mongoose.Types.ObjectId(req.user.id)
        })

        // Get users
        const player = await User.findById(req.user.id)
        const organizer = await User.findById(tournament.organizer)

        // Notify organizer
        if (organizer) {

            const notification = await Notification.create({
                user: organizer._id,
                tournament: tournament._id,
                message: `${player.username} left "${tournament.title}"`,
                organizerUsername: organizer.username
            })

            req.app
                .get('io')
                .to(organizer._id.toString())
                .emit('newNotification', notification)
        }

        res.json({
            message:
                playerIndex === -1
                    ? 'Registration cancelled successfully'
                    : 'Left successfully'
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'Failed to leave tournament',
            error: err.message
        })

    }

})

// ==========================
// REMOVE PARTICIPANT
// ==========================
router.delete(
    '/:id/participants/:playerId',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            const tournament = await Tournament.findById(
                req.params.id
            )

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }

            // Only organizers can remove participants
            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message: 'Only organizers can remove participants'
                })
            }

            // Only the tournament owner can remove participants
            if (
                tournament.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message: 'You are not the organizer of this tournament'
                })
            }

            const playerId = req.params.playerId

            // Check if player is registered
            const playerIndex = tournament.players.findIndex(
                player =>
                    player.toString() === playerId
            )

            if (playerIndex === -1) {
                return res.status(404).json({
                    message: 'Player is not registered in this tournament'
                })
            }

            // Remove player
            tournament.players.splice(playerIndex, 1)

            await tournament.save()

            await TournamentRegistration.findOneAndUpdate(
                {
                    tournament: tournament._id,
                    player: playerId
                },
                {
                    registrationStatus: 'Cancelled'
                }
            )

            // Remove any pre-start doubles pairing that contains this player
            await TournamentTeam.deleteMany({
                tournament: tournament._id,
                players: new mongoose.Types.ObjectId(playerId)
            })

            // Get player information for notification
            const player = await User.findById(playerId)

            // Notify removed player
            if (player) {

                const notification = await Notification.create({
                    user: player._id,
                    tournament: tournament._id,
                    message: `You were removed from "${tournament.title}"`
                })

                req.app
                    .get('io')
                    .to(player._id.toString())
                    .emit('newNotification', notification)

            }

            res.json({
                message: 'Player removed successfully'
            })

        } catch (err) {

            console.log(err)

            res.status(500).json({
                error: err.message
            })

        }

    }
)


// ==========================
// MY TOURNAMENTS (JOINED)
// ==========================
router.get('/my', authMiddleware, async (req, res) => {

    try {

        const tournaments = await Tournament.find({
            players: req.user.id
        })
        .populate(
            'organizer',
            'userId username firstName lastName'
        )
        .sort({
            createdAt: -1
        })

        res.json(tournaments)

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'Failed to fetch tournaments'
        })

    }

})


// ==========================
// CREATED TOURNAMENTS
// ==========================
router.get('/created', authMiddleware, async (req, res) => {

    try {

        const tournaments = await Tournament.find({
            organizer: req.user.id
        })
        .populate(
            'organizer',
            'userId username firstName lastName'
        )
        .sort({
            createdAt: -1
        })

        res.json(tournaments)

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'Failed to fetch tournaments'
        })

    }

})

// ==========================
// PLAYER DASHBOARD STATS
// ==========================
router.get(
    '/player/stats',
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Player') {
                return res.status(403).json({
                    message: 'Player only'
                })
            }

            const now = new Date()

            const tournaments = await Tournament.find({
                players: req.user.id
            })
            .populate('organizer', 'username')
            .sort({
                startDate: 1
            })


            for (const tournament of tournaments) {

                const newStatus =
                    updateTournamentStatus(tournament)

                if (tournament.status !== newStatus) {

                    tournament.status = newStatus

                    await tournament.save()

                }

            }


            const joinedCount =
                tournaments.length


            const upcoming =
                tournaments.filter(t =>
                    new Date(t.startDate) > now &&
                    t.status !== 'Finished'
                )


            const live =
                tournaments.filter(t =>
                    t.status === 'Ongoing'
                )


            const finished =
                tournaments.filter(t =>
                    t.status === 'Finished'
                )


            const nextTournament =
                upcoming.length > 0
                    ? upcoming[0]
                    : null

            const notifications =
                await Notification.find({
                    user: req.user.id
                })
                .sort({ createdAt: -1 })
                .limit(5)

            res.json({

                joinedCount,

                upcomingCount: upcoming.length,

                liveCount: live.length,

                finishedCount: finished.length,

                nextTournament,

                notifications

            })

        } catch(err){

            res.status(500).json({
                error: err.message
            })

        }

    }
)


// ==========================
// ORGANIZER DASHBOARD STATS
// ==========================
router.get(
    '/organizer/stats',
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message: 'Organizer only'
                })

            }

            const now = new Date()

            const tournaments = await Tournament.find({
                organizer: req.user.id
            }).sort({
                createdAt: -1
            })


            // ==========================
            // UPDATE STATUSES
            // ==========================

            for (const tournament of tournaments) {

                const newStatus =
                    updateTournamentStatus(tournament)

                if (tournament.status !== newStatus) {

                    tournament.status = newStatus

                    await tournament.save()

                }

            }


            // ==========================
            // BASIC STATS
            // ==========================

            const createdTournaments =
                tournaments.length


            const totalParticipants =
                tournaments.reduce(
                    (total, tournament) =>
                        total +
                        (tournament.players?.length || 0),
                    0
                )


            const openTournaments =
                tournaments.filter(
                    tournament =>
                        tournament.status === 'Open'
                ).length


            const closedTournaments =
                tournaments.filter(
                    tournament =>
                        tournament.status === 'Closed'
                ).length


            const ongoingTournaments =
                tournaments.filter(
                    tournament =>
                        tournament.status === 'Ongoing'
                ).length


            const finishedTournaments =
                tournaments.filter(
                    tournament =>
                        tournament.status === 'Finished'
                ).length


            const activeTournaments =
                tournaments.filter(
                    tournament =>
                        tournament.status === 'Open' ||
                        tournament.status === 'Closed' ||
                        tournament.status === 'Ongoing'
                ).length


            // ==========================
            // UPCOMING TOURNAMENTS
            // ==========================

            const upcomingTournaments =
                tournaments
                    .filter(
                        tournament =>
                            new Date(
                                tournament.startDate
                            ) > now &&
                            tournament.status !== 'Finished'
                    )
                    .sort(
                        (a, b) =>
                            new Date(a.startDate) -
                            new Date(b.startDate)
                    )
                    .slice(0, 5)
                    .map(tournament => ({

                        _id: tournament._id,

                        title:
                            tournament.title,

                        startDate:
                            tournament.startDate,

                        location:
                            tournament.location,

                        status:
                            tournament.status

                    }))


            // ==========================
            // PARTICIPANT PROGRESS
            // ==========================

            const participantProgress =
                tournaments
                    .filter(
                        tournament =>
                            tournament.status !== 'Finished'
                    )
                    .slice(0, 5)
                    .map(tournament => ({

                        _id:
                            tournament._id,

                        title:
                            tournament.title,

                        players:
                            tournament.players?.length || 0,

                        maxPlayers:
                            tournament.maxPlayers || 0

                    }))


            // ==========================
            // REGISTRATION CLOSING SOON
            // ==========================

            const closingSoon =
                tournaments
                    .filter(tournament => {

                        if (
                            !tournament.registrationDeadline ||
                            tournament.status !== 'Open'
                        ) {
                            return false
                        }

                        const deadline =
                            new Date(
                                tournament.registrationDeadline
                            )

                        const daysLeft =
                            Math.ceil(
                                (deadline - now) /
                                (
                                    1000 *
                                    60 *
                                    60 *
                                    24
                                )
                            )

                        return (
                            daysLeft >= 0 &&
                            daysLeft <= 7
                        )

                    })
                    .map(tournament => {

                        const deadline =
                            new Date(
                                tournament.registrationDeadline
                            )

                        const daysLeft =
                            Math.ceil(
                                (deadline - now) /
                                (
                                    1000 *
                                    60 *
                                    60 *
                                    24
                                )
                            )

                        return {

                            _id:
                                tournament._id,

                            title:
                                tournament.title,

                            registrationDeadline:
                                tournament.registrationDeadline,

                            daysLeft

                        }

                    })
                    .sort(
                        (a, b) =>
                            a.daysLeft - b.daysLeft
                    )
                    .slice(0, 5)


            // ==========================
            // RECENT TOURNAMENTS
            // ==========================

            const recentTournaments =
                tournaments
                    .slice(0, 5)
                    .map(tournament => ({

                        _id:
                            tournament._id,

                        title:
                            tournament.title,

                        game:
                            tournament.game,

                        location:
                            tournament.location,

                        startDate:
                            tournament.startDate,

                        status:
                            tournament.status,

                        players:
                            tournament.players?.length || 0,

                        maxPlayers:
                            tournament.maxPlayers

                    }))


            // ==========================
            // RECENT NOTIFICATIONS
            // ==========================

            const recentRegistrations =
                await Notification.find({
                    user: req.user.id
                })
                    .sort({
                        createdAt: -1
                    })
                    .limit(5)


            // ==========================
            // RESPONSE
            // ==========================

            res.json({

                createdTournaments,

                totalParticipants,

                activeTournaments,

                openTournaments,

                closedTournaments,

                ongoingTournaments,

                finishedTournaments,

                upcomingTournaments,

                participantProgress,

                closingSoon,

                recentTournaments,

                recentRegistrations

            })

        } catch (err) {

            console.error(
                'ORGANIZER DASHBOARD ERROR:',
                err
            )

            res.status(500).json({

                message:
                    'Failed to load organizer dashboard',

                error:
                    err.message

            })

        }

    }
)


// ==========================
// TOURNAMENT TEAMS
// DOUBLES / MIXED DOUBLES
// ==========================

// Get teams
router.get(
    '/:id/teams',
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(
                    req.params.id
                )

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }

            if (
                tournament.game !== 'Doubles' &&
                tournament.game !== 'Mixed Doubles'
            ) {
                return res.json([])
            }

            const teams =
                await TournamentTeam.find({
                    tournament:
                        tournament._id
                })
                .populate(
                    'players',
                    'userId firstName lastName username'
                )
                .sort({
                    createdAt: 1
                })

            return res.json(
                teams
            )

        } catch (err) {

            console.error(
                'GET TOURNAMENT TEAMS ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to load tournament teams',
                error:
                    err.message
            })

        }

    }
)


// Create team
router.post(
    '/:id/teams',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(
                    req.params.id
                )

            if (!tournament) {
                return res.status(404).json({
                    message:
                        'Tournament not found'
                })
            }

            if (
                req.user.role !==
                'Organizer' ||
                tournament.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'Only the tournament organizer can create teams'
                })
            }

            if (
                tournament.status === 'Ongoing' ||
                tournament.status === 'Finished'
            ) {
                return res.status(400).json({
                    message:
                        'Teams cannot be changed after the tournament starts'
                })
            }

            if (
                tournament.game !== 'Doubles' &&
                tournament.game !== 'Mixed Doubles'
            ) {
                return res.status(400).json({
                    message:
                        'Teams are only used for Doubles and Mixed Doubles tournaments'
                })
            }

            const playerIds =
                Array.isArray(
                    req.body.playerIds
                )
                    ? req.body.playerIds
                    : []

            if (
                playerIds.length !== 2 ||
                playerIds[0] === playerIds[1]
            ) {
                return res.status(400).json({
                    message:
                        'Select exactly 2 different players'
                })
            }

            const registeredIds =
                new Set(
                    (tournament.players || [])
                        .map(
                            player =>
                                player.toString()
                        )
                )

            if (
                !playerIds.every(
                    playerId =>
                        registeredIds.has(
                            playerId
                        )
                )
            ) {
                return res.status(400).json({
                    message:
                        'Both team members must be registered in this tournament'
                })
            }

            const alreadyAssigned =
                await TournamentTeam.findOne({
                    tournament:
                        tournament._id,
                    players: {
                        $in:
                            playerIds.map(
                                id =>
                                    new mongoose.Types.ObjectId(
                                        id
                                    )
                            )
                    }
                })

            if (alreadyAssigned) {
                return res.status(400).json({
                    message:
                        'One or both players are already assigned to another team'
                })
            }

            const teamCount =
                await TournamentTeam.countDocuments({
                    tournament:
                        tournament._id
                })

            const name =
                String(
                    req.body.name || ''
                ).trim() ||
                `Team ${teamCount + 1}`

            const team =
                await TournamentTeam.create({
                    tournament:
                        tournament._id,
                    name,
                    players:
                        playerIds.map(
                            id =>
                                new mongoose.Types.ObjectId(
                                    id
                                )
                        ),
                    createdBy:
                        new mongoose.Types.ObjectId(
                            req.user.id
                        )
                })

            const populatedTeam =
                await TournamentTeam.findById(
                    team._id
                )
                .populate(
                    'players',
                    'userId firstName lastName username'
                )

            return res.status(201).json({
                message:
                    'Team created successfully',
                team:
                    populatedTeam
            })

        } catch (err) {

            console.error(
                'CREATE TOURNAMENT TEAM ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to create team',
                error:
                    err.message
            })

        }

    }
)


// Update team
router.put(
    '/:id/teams/:teamId',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(
                    req.params.id
                )

            if (!tournament) {
                return res.status(404).json({
                    message:
                        'Tournament not found'
                })
            }

            if (
                req.user.role !==
                'Organizer' ||
                tournament.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'Only the tournament organizer can edit teams'
                })
            }

            if (
                tournament.status === 'Ongoing' ||
                tournament.status === 'Finished'
            ) {
                return res.status(400).json({
                    message:
                        'Teams cannot be changed after the tournament starts'
                })
            }

            const team =
                await TournamentTeam.findOne({
                    _id:
                        req.params.teamId,
                    tournament:
                        tournament._id
                })

            if (!team) {
                return res.status(404).json({
                    message:
                        'Team not found'
                })
            }

            const playerIds =
                Array.isArray(
                    req.body.playerIds
                )
                    ? req.body.playerIds
                    : []

            if (
                playerIds.length !== 2 ||
                playerIds[0] === playerIds[1]
            ) {
                return res.status(400).json({
                    message:
                        'Select exactly 2 different players'
                })
            }

            const registeredIds =
                new Set(
                    (tournament.players || [])
                        .map(
                            player =>
                                player.toString()
                        )
                )

            if (
                !playerIds.every(
                    playerId =>
                        registeredIds.has(
                            playerId
                        )
                )
            ) {
                return res.status(400).json({
                    message:
                        'Both team members must be registered in this tournament'
                })
            }

            const conflict =
                await TournamentTeam.findOne({
                    tournament:
                        tournament._id,
                    _id: {
                        $ne:
                            team._id
                    },
                    players: {
                        $in:
                            playerIds.map(
                                id =>
                                    new mongoose.Types.ObjectId(
                                        id
                                    )
                            )
                    }
                })

            if (conflict) {
                return res.status(400).json({
                    message:
                        'One or both players are already assigned to another team'
                })
            }

            team.players =
                playerIds.map(
                    id =>
                        new mongoose.Types.ObjectId(
                            id
                        )
                )

            if (
                typeof req.body.name ===
                'string' &&
                req.body.name.trim()
            ) {
                team.name =
                    req.body.name.trim()
            }

            await team.save()

            const populatedTeam =
                await TournamentTeam.findById(
                    team._id
                )
                .populate(
                    'players',
                    'userId firstName lastName username'
                )

            return res.json({
                message:
                    'Team updated successfully',
                team:
                    populatedTeam
            })

        } catch (err) {

            console.error(
                'UPDATE TOURNAMENT TEAM ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to update team',
                error:
                    err.message
            })

        }

    }
)


// Delete team
router.delete(
    '/:id/teams/:teamId',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(
                    req.params.id
                )

            if (!tournament) {
                return res.status(404).json({
                    message:
                        'Tournament not found'
                })
            }

            if (
                req.user.role !==
                'Organizer' ||
                tournament.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'Only the tournament organizer can remove teams'
                })
            }

            if (
                tournament.status === 'Ongoing' ||
                tournament.status === 'Finished'
            ) {
                return res.status(400).json({
                    message:
                        'Teams cannot be changed after the tournament starts'
                })
            }

            const team =
                await TournamentTeam.findOneAndDelete({
                    _id:
                        req.params.teamId,
                    tournament:
                        tournament._id
                })

            if (!team) {
                return res.status(404).json({
                    message:
                        'Team not found'
                })
            }

            return res.json({
                message:
                    'Team removed successfully'
            })

        } catch (err) {

            console.error(
                'DELETE TOURNAMENT TEAM ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to remove team',
                error:
                    err.message
            })

        }

    }
)


// ==========================
// START TOURNAMENT
// ==========================

router.put(
    '/:id/start',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(
                    req.params.id
                )

            if (!tournament) {
                return res.status(404).json({
                    message:
                        'Tournament not found'
                })
            }

            if (
                req.user.role !==
                'Organizer'
            ) {
                return res.status(403).json({
                    message:
                        'Only organizers can start tournaments'
                })
            }

            if (
                tournament.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'You are not the organizer of this tournament'
                })
            }

            if (
                tournament.status ===
                'Finished'
            ) {
                return res.status(400).json({
                    message:
                        'A finished tournament cannot be started again'
                })
            }

            if (
                tournament.status ===
                'Ongoing'
            ) {
                return res.status(400).json({
                    message:
                        'Tournament is already ongoing'
                })
            }

            if (
                tournament.format !==
                    'Single Elimination' &&
                tournament.format !==
                    'Round Robin'
            ) {
                return res.status(400).json({
                    message:
                        'Unsupported tournament format'
                })
            }

            const existingMatches =
                await TournamentMatch.countDocuments({
                    tournament:
                        tournament._id
                })

            if (
                existingMatches >
                0
            ) {
                return res.status(400).json({
                    message:
                        'Tournament matches have already been generated'
                })
            }

            let entries = []

            // ==========================
            // SINGLES ENTRIES
            // ==========================

            if (
                tournament.game ===
                'Singles'
            ) {

                if (
                    (tournament.players || []).length <
                    2
                ) {
                    return res.status(400).json({
                        message:
                            'At least 2 players are required to start a Singles tournament'
                    })
                }

                entries =
                    tournament.players.map(
                        player => [
                            player
                        ]
                    )

            }

            // ==========================
            // DOUBLES / MIXED DOUBLES ENTRIES
            // ==========================

            else if (
                tournament.game ===
                    'Doubles' ||
                tournament.game ===
                    'Mixed Doubles'
            ) {

                const teams =
                    await TournamentTeam.find({
                        tournament:
                            tournament._id
                    })
                    .sort({
                        createdAt: 1
                    })

                if (
                    teams.length <
                    2
                ) {
                    return res.status(400).json({
                        message:
                            'Create at least 2 teams before starting this tournament'
                    })
                }

                const registeredPlayerIds =
                    (tournament.players || [])
                        .map(
                            player =>
                                player.toString()
                        )

                const assignedIds =
                    teams.flatMap(
                        team =>
                            (team.players || [])
                                .map(
                                    player =>
                                        player.toString()
                                )
                    )

                const uniqueAssignedIds =
                    new Set(
                        assignedIds
                    )

                if (
                    assignedIds.length !==
                        uniqueAssignedIds.size
                ) {
                    return res.status(400).json({
                        message:
                            'A player cannot be assigned to more than one team'
                    })
                }

                if (
                    teams.some(
                        team =>
                            !team.players ||
                            team.players.length !==
                                2
                    )
                ) {
                    return res.status(400).json({
                        message:
                            'Every team must contain exactly 2 players'
                    })
                }

                if (
                    uniqueAssignedIds.size !==
                    registeredPlayerIds.length
                ) {
                    return res.status(400).json({
                        message:
                            'All registered players must be assigned to a team before the tournament starts'
                    })
                }

                if (
                    !registeredPlayerIds.every(
                        playerId =>
                            uniqueAssignedIds.has(
                                playerId
                            )
                    )
                ) {
                    return res.status(400).json({
                        message:
                            'Every team member must be a registered participant'
                    })
                }

                entries =
                    teams.map(
                        team => [
                            ...team.players
                        ]
                    )

            } else {

                return res.status(400).json({
                    message:
                        'Unsupported tournament game type'
                })

            }

            // ==========================
            // SINGLE ELIMINATION
            // ==========================

            if (
                tournament.format ===
                'Single Elimination'
            ) {

                // Randomize entries before creating the bracket.
                for (
                    let i =
                        entries.length - 1;
                    i > 0;
                    i--
                ) {

                    const j =
                        Math.floor(
                            Math.random() *
                            (i + 1)
                        )

                    const temp =
                        entries[i]

                    entries[i] =
                        entries[j]

                    entries[j] =
                        temp

                }

                let bracketSize =
                    1

                while (
                    bracketSize <
                    entries.length
                ) {
                    bracketSize *=
                        2
                }

                const totalRounds =
                    Math.log2(
                        bracketSize
                    )

                const firstRoundMatchCount =
                    bracketSize /
                    2

                const byeCount =
                    bracketSize -
                    entries.length

                const playedFirstRoundMatches =
                    firstRoundMatchCount -
                    byeCount

                const matchesByRound =
                    []

                for (
                    let roundNumber = 1;
                    roundNumber <=
                        totalRounds;
                    roundNumber++
                ) {

                    const matchesInRound =
                        bracketSize /
                        Math.pow(
                            2,
                            roundNumber
                        )

                    let roundName =
                        `Round ${roundNumber}`

                    if (
                        matchesInRound ===
                        1
                    ) {
                        roundName =
                            'Final'
                    } else if (
                        matchesInRound ===
                        2
                    ) {
                        roundName =
                            'Semifinal'
                    } else if (
                        matchesInRound ===
                        4
                    ) {
                        roundName =
                            'Quarterfinal'
                    }

                    const roundMatches =
                        []

                    for (
                        let matchIndex = 0;
                        matchIndex <
                            matchesInRound;
                        matchIndex++
                    ) {

                        const match =
                            await TournamentMatch.create({
                                tournament:
                                    tournament._id,
                                roundNumber,
                                roundName,
                                matchNumber:
                                    matchIndex +
                                    1,
                                teamA:
                                    [],
                                teamB:
                                    [],
                                status:
                                    'Pending'
                            })

                        roundMatches.push(
                            match
                        )

                    }

                    matchesByRound.push(
                        roundMatches
                    )

                }

                for (
                    let roundIndex = 0;
                    roundIndex <
                        matchesByRound.length -
                            1;
                    roundIndex++
                ) {

                    const currentRound =
                        matchesByRound[
                            roundIndex
                        ]

                    const nextRound =
                        matchesByRound[
                            roundIndex +
                            1
                        ]

                    for (
                        let matchIndex = 0;
                        matchIndex <
                            currentRound.length;
                        matchIndex++
                    ) {

                        const currentMatch =
                            currentRound[
                                matchIndex
                            ]

                        const nextMatch =
                            nextRound[
                                Math.floor(
                                    matchIndex /
                                    2
                                )
                            ]

                        currentMatch.nextMatch =
                            nextMatch._id

                        currentMatch.nextSlot =
                            matchIndex %
                                2 ===
                            0
                                ? 'A'
                                : 'B'

                        await currentMatch.save()

                    }

                }

                const firstRound =
                    matchesByRound[0]

                let entryIndex =
                    0

                for (
                    let i = 0;
                    i <
                        playedFirstRoundMatches;
                    i++
                ) {

                    const match =
                        firstRound[i]

                    match.teamA = [
                        ...entries[
                            entryIndex
                        ]
                    ]

                    entryIndex++

                    match.teamB = [
                        ...entries[
                            entryIndex
                        ]
                    ]

                    entryIndex++

                    match.status =
                        'Ready'

                    await match.save()

                }

                for (
                    let i =
                        playedFirstRoundMatches;
                    i <
                        firstRound.length;
                    i++
                ) {

                    const match =
                        firstRound[i]

                    match.teamA = [
                        ...entries[
                            entryIndex
                        ]
                    ]

                    entryIndex++

                    match.teamB =
                        []

                    match.status =
                        'Bye'

                    match.winnerTeam =
                        'A'

                    match.winnerPlayers = [
                        ...match.teamA
                    ]

                    match.finishedAt =
                        new Date()

                    await match.save()

                    if (
                        match.nextMatch
                    ) {

                        const nextMatch =
                            await TournamentMatch.findById(
                                match.nextMatch
                            )

                        if (
                            nextMatch
                        ) {

                            if (
                                match.nextSlot ===
                                'A'
                            ) {
                                nextMatch.teamA = [
                                    ...match.winnerPlayers
                                ]
                            } else {
                                nextMatch.teamB = [
                                    ...match.winnerPlayers
                                ]
                            }

                            if (
                                nextMatch.teamA.length >
                                    0 &&
                                nextMatch.teamB.length >
                                    0
                            ) {
                                nextMatch.status =
                                    'Ready'
                            }

                            await nextMatch.save()

                        }

                    }

                }

            }

            // ==========================
            // ROUND ROBIN
            // EVERY ENTRY VS EVERY ENTRY
            // ==========================

            if (
                tournament.format ===
                'Round Robin'
            ) {

                let matchNumber =
                    1

                for (
                    let i = 0;
                    i <
                        entries.length;
                    i++
                ) {

                    for (
                        let j =
                            i + 1;
                        j <
                            entries.length;
                        j++
                    ) {

                        await TournamentMatch.create({
                            tournament:
                                tournament._id,
                            roundNumber:
                                1,
                            roundName:
                                'Round Robin',
                            matchNumber,
                            teamA: [
                                ...entries[i]
                            ],
                            teamB: [
                                ...entries[j]
                            ],
                            status:
                                'Ready'
                        })

                        matchNumber++

                    }

                }

            }

            tournament.status =
                'Ongoing'

            tournament.startedAt =
                new Date()

            tournament.finishedAt =
                null

            await tournament.save()

            const generatedMatches =
                await TournamentMatch.find({
                    tournament:
                        tournament._id
                })
                .populate(
                    'teamA',
                    'userId firstName lastName username'
                )
                .populate(
                    'teamB',
                    'userId firstName lastName username'
                )
                .populate(
                    'winnerPlayers',
                    'userId firstName lastName username'
                )
                .sort({
                    roundNumber: 1,
                    matchNumber: 1
                })

            return res.json({
                message:
                    tournament.format ===
                    'Single Elimination'
                        ? 'Tournament started and Single Elimination bracket generated successfully'
                        : 'Tournament started and Round Robin matches generated successfully',
                tournament,
                matches:
                    generatedMatches
            })

        } catch (err) {

            console.error(
                'START TOURNAMENT ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to start tournament',
                error:
                    err.message
            })

        }

    }
)


// ==========================
// GET TOURNAMENT MATCHES
// ==========================

router.get(
    '/:id/matches',
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(req.params.id)

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }

            const matches =
                await TournamentMatch.find({
                    tournament: tournament._id
                })
                .populate(
                    'teamA',
                    'userId firstName lastName username'
                )
                .populate(
                    'teamB',
                    'userId firstName lastName username'
                )
                .populate(
                    'winnerPlayers',
                    'userId firstName lastName username'
                )
                .sort({
                    roundNumber: 1,
                    matchNumber: 1
                })

            return res.json(matches)

        } catch (err) {

            console.error(
                'GET TOURNAMENT MATCHES ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to fetch tournament matches',
                error: err.message
            })

        }

    }
)



// ==========================
// SUBMIT TOURNAMENT MATCH RESULT
// SINGLE ELIMINATION + ROUND ROBIN
// ==========================

router.put(
    '/:tournamentId/matches/:matchId/result',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (
                req.user.role !==
                'Organizer'
            ) {

                return res.status(403).json({
                    message:
                        'Only organizers can submit tournament results'
                })

            }


            const tournament =
                await Tournament.findById(
                    req.params.tournamentId
                )


            if (!tournament) {

                return res.status(404).json({
                    message:
                        'Tournament not found'
                })

            }


            if (
                tournament.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this tournament'
                })

            }


            if (
                tournament.status !==
                'Ongoing'
            ) {

                return res.status(400).json({
                    message:
                        'Results can only be submitted while the tournament is ongoing'
                })

            }


            const match =
                await TournamentMatch.findById(
                    req.params.matchId
                )


            if (!match) {

                return res.status(404).json({
                    message:
                        'Tournament match not found'
                })

            }


            if (
                match.tournament.toString() !==
                tournament._id.toString()
            ) {

                return res.status(400).json({
                    message:
                        'This match does not belong to this tournament'
                })

            }


            if (
                match.status ===
                'Bye'
            ) {

                return res.status(400).json({
                    message:
                        'A BYE match does not require a result'
                })

            }


            if (
                match.status ===
                'Finished'
            ) {

                return res.status(400).json({
                    message:
                        'This match already has a final result'
                })

            }


            if (
                !match.teamA ||
                !match.teamB ||
                match.teamA.length === 0 ||
                match.teamB.length === 0
            ) {

                return res.status(400).json({
                    message:
                        'Both sides must be assigned before a result can be submitted'
                })

            }


            const submittedGames =
                Array.isArray(
                    req.body.games
                )
                    ? req.body.games
                    : []


            if (
                submittedGames.length <
                    2 ||
                submittedGames.length >
                    3
            ) {

                return res.status(400).json({
                    message:
                        'A badminton match must contain 2 or 3 games'
                })

            }


            const isValidBadmintonGame =
                (
                    scoreA,
                    scoreB
                ) => {

                    if (
                        !Number.isInteger(
                            scoreA
                        ) ||
                        !Number.isInteger(
                            scoreB
                        ) ||
                        scoreA < 0 ||
                        scoreB < 0 ||
                        scoreA ===
                            scoreB
                    ) {
                        return false
                    }

                    const winner =
                        Math.max(
                            scoreA,
                            scoreB
                        )

                    const loser =
                        Math.min(
                            scoreA,
                            scoreB
                        )

                    if (
                        winner < 21 ||
                        winner > 30
                    ) {
                        return false
                    }

                    if (
                        winner === 21
                    ) {
                        return (
                            loser <= 19
                        )
                    }

                    if (
                        winner >= 22 &&
                        winner <= 29
                    ) {
                        return (
                            winner - loser ===
                            2
                        )
                    }

                    if (
                        winner === 30
                    ) {
                        return (
                            loser === 28 ||
                            loser === 29
                        )
                    }

                    return false

                }


            const normalizedGames =
                []

            let gameWinsA =
                0

            let gameWinsB =
                0


            for (
                let i = 0;
                i <
                    submittedGames.length;
                i++
            ) {

                const rawGame =
                    submittedGames[i]

                const gameScoreA =
                    Number(
                        rawGame?.scoreA
                    )

                const gameScoreB =
                    Number(
                        rawGame?.scoreB
                    )


                if (
                    !isValidBadmintonGame(
                        gameScoreA,
                        gameScoreB
                    )
                ) {

                    return res.status(400).json({
                        message:
                            `Game ${i + 1} has an invalid badminton score`
                    })

                }


                const winnerTeam =
                    gameScoreA >
                    gameScoreB
                        ? 'A'
                        : 'B'


                if (
                    winnerTeam ===
                    'A'
                ) {
                    gameWinsA++
                } else {
                    gameWinsB++
                }


                normalizedGames.push({
                    gameNumber:
                        i + 1,
                    scoreA:
                        gameScoreA,
                    scoreB:
                        gameScoreB,
                    winnerTeam
                })


                if (
                    gameWinsA === 2 ||
                    gameWinsB === 2
                ) {

                    if (
                        i !==
                        submittedGames.length -
                            1
                    ) {

                        return res.status(400).json({
                            message:
                                'Do not submit extra games after a side has already won 2 games'
                        })

                    }

                }

            }


            if (
                gameWinsA !== 2 &&
                gameWinsB !== 2
            ) {

                return res.status(400).json({
                    message:
                        'The match winner must win 2 games'
                })

            }


            if (
                submittedGames.length === 2 &&
                (
                    gameWinsA !== 2 &&
                    gameWinsB !== 2
                )
            ) {

                return res.status(400).json({
                    message:
                        'A third game is required when the first two games are split'
                })

            }


            match.games =
                normalizedGames

            match.gameWinsA =
                gameWinsA

            match.gameWinsB =
                gameWinsB

            // Keep scoreA / scoreB for existing bracket,
            // standings, reports, and historical compatibility.
            // These now represent games won in the match.
            match.scoreA =
                gameWinsA

            match.scoreB =
                gameWinsB

            match.status =
                'Finished'

            match.finishedAt =
                new Date()


            if (
                gameWinsA >
                gameWinsB
            ) {

                match.winnerTeam =
                    'A'

                match.winnerPlayers = [
                    ...match.teamA
                ]

            } else {

                match.winnerTeam =
                    'B'

                match.winnerPlayers = [
                    ...match.teamB
                ]

            }


            await match.save()


            // ==========================
            // SINGLE ELIMINATION ADVANCE
            // ==========================

            if (
                tournament.format ===
                'Single Elimination'
            ) {

                if (
                    match.nextMatch
                ) {

                    const nextMatch =
                        await TournamentMatch.findById(
                            match.nextMatch
                        )


                    if (!nextMatch) {

                        return res.status(500).json({
                            message:
                                'Next tournament match could not be found'
                        })

                    }


                    if (
                        match.nextSlot ===
                        'A'
                    ) {

                        nextMatch.teamA = [
                            ...match.winnerPlayers
                        ]

                    } else if (
                        match.nextSlot ===
                        'B'
                    ) {

                        nextMatch.teamB = [
                            ...match.winnerPlayers
                        ]

                    }


                    if (
                        nextMatch.teamA.length >
                            0 &&
                        nextMatch.teamB.length >
                            0
                    ) {

                        nextMatch.status =
                            'Ready'

                    }


                    await nextMatch.save()

                } else {

                    // Final completed.
                    tournament.status =
                        'Finished'

                    tournament.finishedAt =
                        new Date()

                    await tournament.save()

                }

            }


            // ==========================
            // ROUND ROBIN COMPLETION
            // ==========================

            if (
                tournament.format ===
                'Round Robin'
            ) {

                const remainingMatches =
                    await TournamentMatch
                        .countDocuments({
                            tournament:
                                tournament._id,

                            status: {
                                $ne:
                                    'Finished'
                            }
                        })


                if (
                    remainingMatches ===
                    0
                ) {

                    tournament.status =
                        'Finished'

                    tournament.finishedAt =
                        new Date()

                    await tournament.save()

                }

            }


            const updatedMatch =
                await TournamentMatch.findById(
                    match._id
                )
                .populate(
                    'teamA',
                    'userId firstName lastName username'
                )
                .populate(
                    'teamB',
                    'userId firstName lastName username'
                )
                .populate(
                    'winnerPlayers',
                    'userId firstName lastName username'
                )


            const matches =
                await TournamentMatch.find({
                    tournament:
                        tournament._id
                })
                .populate(
                    'teamA',
                    'userId firstName lastName username'
                )
                .populate(
                    'teamB',
                    'userId firstName lastName username'
                )
                .populate(
                    'winnerPlayers',
                    'userId firstName lastName username'
                )
                .sort({
                    roundNumber: 1,
                    matchNumber: 1
                })


            return res.json({
                message:
                    tournament.status ===
                    'Finished'
                        ? 'Match result saved. Tournament completed.'
                        : tournament.format ===
                            'Single Elimination'
                            ? 'Match result saved and winner advanced'
                            : 'Round Robin match result saved',

                match:
                    updatedMatch,

                tournament,

                matches
            })

        } catch (err) {

            console.error(
                'SUBMIT TOURNAMENT RESULT ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to submit tournament result',
                error:
                    err.message
            })

        }

    }
)


// ==========================
// ROUND ROBIN STANDINGS
// SINGLES + DOUBLES + MIXED DOUBLES
// ==========================

router.get(
    '/:id/standings',
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(
                    req.params.id
                )
                .populate(
                    'players',
                    'userId firstName lastName username'
                )

            if (!tournament) {
                return res.status(404).json({
                    message:
                        'Tournament not found'
                })
            }

            if (
                tournament.format !==
                'Round Robin'
            ) {
                return res.status(400).json({
                    message:
                        'Standings are only available for Round Robin tournaments'
                })
            }

            const matches =
                await TournamentMatch.find({
                    tournament:
                        tournament._id,
                    status:
                        'Finished'
                })
                .populate(
                    'teamA',
                    'userId firstName lastName username'
                )
                .populate(
                    'teamB',
                    'userId firstName lastName username'
                )

            const standingsMap =
                new Map()

            const makeEntryKey =
                members =>
                    (members || [])
                        .map(
                            member =>
                                (
                                    member?._id ||
                                    member
                                ).toString()
                        )
                        .sort()
                        .join(':')

            if (
                tournament.game ===
                'Singles'
            ) {

                for (
                    const player of
                    tournament.players || []
                ) {

                    const members = [
                        player
                    ]

                    standingsMap.set(
                        makeEntryKey(
                            members
                        ),
                        {
                            entryId:
                                player._id.toString(),
                            teamName:
                                '',
                            members:
                                members.map(
                                    member => ({
                                        _id:
                                            member._id,
                                        userId:
                                            member.userId,
                                        firstName:
                                            member.firstName,
                                        lastName:
                                            member.lastName,
                                        username:
                                            member.username
                                    })
                                ),
                            played:
                                0,
                            wins:
                                0,
                            losses:
                                0,
                            points:
                                0,
                            scoreFor:
                                0,
                            scoreAgainst:
                                0,
                            scoreDifference:
                                0
                        }
                    )

                }

            } else {

                const teams =
                    await TournamentTeam.find({
                        tournament:
                            tournament._id
                    })
                    .populate(
                        'players',
                        'userId firstName lastName username'
                    )
                    .sort({
                        createdAt: 1
                    })

                for (
                    const team of
                    teams
                ) {

                    standingsMap.set(
                        makeEntryKey(
                            team.players
                        ),
                        {
                            entryId:
                                team._id.toString(),
                            teamName:
                                team.name ||
                                '',
                            members:
                                (team.players || [])
                                    .map(
                                        member => ({
                                            _id:
                                                member._id,
                                            userId:
                                                member.userId,
                                            firstName:
                                                member.firstName,
                                            lastName:
                                                member.lastName,
                                            username:
                                                member.username
                                        })
                                    ),
                            played:
                                0,
                            wins:
                                0,
                            losses:
                                0,
                            points:
                                0,
                            scoreFor:
                                0,
                            scoreAgainst:
                                0,
                            scoreDifference:
                                0
                        }
                    )

                }

            }

            for (
                const match of
                matches
            ) {

                const teamAKey =
                    makeEntryKey(
                        match.teamA
                    )

                const teamBKey =
                    makeEntryKey(
                        match.teamB
                    )

                const sideA =
                    standingsMap.get(
                        teamAKey
                    )

                const sideB =
                    standingsMap.get(
                        teamBKey
                    )

                if (
                    !sideA ||
                    !sideB
                ) {
                    continue
                }

                const scoreA =
                    Number(
                        match.scoreA ||
                        0
                    )

                const scoreB =
                    Number(
                        match.scoreB ||
                        0
                    )

                sideA.played++
                sideB.played++

                sideA.scoreFor +=
                    scoreA

                sideA.scoreAgainst +=
                    scoreB

                sideB.scoreFor +=
                    scoreB

                sideB.scoreAgainst +=
                    scoreA

                if (
                    match.winnerTeam ===
                    'A'
                ) {

                    sideA.wins++
                    sideA.points +=
                        1

                    sideB.losses++

                } else if (
                    match.winnerTeam ===
                    'B'
                ) {

                    sideB.wins++
                    sideB.points +=
                        1

                    sideA.losses++

                }

            }

            const standings =
                Array.from(
                    standingsMap.values()
                )
                .map(
                    item => ({
                        ...item,
                        scoreDifference:
                            item.scoreFor -
                            item.scoreAgainst
                    })
                )
                .sort(
                    (a, b) => {

                        if (
                            b.points !==
                            a.points
                        ) {
                            return (
                                b.points -
                                a.points
                            )
                        }

                        if (
                            b.wins !==
                            a.wins
                        ) {
                            return (
                                b.wins -
                                a.wins
                            )
                        }

                        if (
                            b.scoreDifference !==
                            a.scoreDifference
                        ) {
                            return (
                                b.scoreDifference -
                                a.scoreDifference
                            )
                        }

                        return (
                            b.scoreFor -
                            a.scoreFor
                        )

                    }
                )
                .map(
                    (
                        item,
                        index
                    ) => ({
                        rank:
                            index +
                            1,
                        ...item
                    })
                )

            return res.json({
                tournamentId:
                    tournament._id,
                game:
                    tournament.game,
                format:
                    tournament.format,
                scoring: {
                    win:
                        1,
                    loss:
                        0
                },
                standings
            })

        } catch (err) {

            console.error(
                'ROUND ROBIN STANDINGS ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to load Round Robin standings',
                error:
                    err.message
            })

        }

    }
)


// ==========================
// FINISH TOURNAMENT
// ==========================

router.put(
    '/:id/finish',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(req.params.id)

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }


            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message:
                        'Only organizers can finish tournaments'
                })
            }


            if (
                tournament.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'You are not the organizer of this tournament'
                })
            }


            if (tournament.status === 'Finished') {
                return res.status(400).json({
                    message:
                        'Tournament is already finished'
                })
            }


            const currentStatus =
                updateTournamentStatus(tournament)


            if (currentStatus !== 'Ongoing') {
                return res.status(400).json({
                    message:
                        'Only an ongoing tournament can be marked as finished'
                })
            }


            if (
                tournament.format === 'Single Elimination' ||
                tournament.format === 'Round Robin'
            ) {

                const completedStatuses =
                    tournament.format === 'Single Elimination'
                        ? ['Finished', 'Bye']
                        : ['Finished']

                const unfinishedMatches =
                    await TournamentMatch.countDocuments({
                        tournament: tournament._id,
                        status: {
                            $nin: completedStatuses
                        }
                    })

                if (unfinishedMatches > 0) {
                    return res.status(400).json({
                        message:
                            tournament.format === 'Single Elimination'
                                ? 'Complete all bracket matches before finishing the tournament'
                                : 'Complete all Round Robin matches before finishing the tournament'
                    })
                }

            }


            tournament.status = 'Finished'
            tournament.finishedAt = new Date()

            await tournament.save()


            return res.json({
                message:
                    'Tournament marked as finished successfully',
                tournament
            })


        } catch (err) {

            console.error(
                'FINISH TOURNAMENT ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to finish tournament',
                error: err.message
            })

        }

    }
)


// ==========================
// JOIN QUEUE
// ==========================

router.post(
    '/join/:id',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Player') {
                return res.status(403).json({
                    message:
                        'Only players can join queue sessions'
                })
            }


            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {
                return res.status(404).json({
                    message:
                        'Queue session not found'
                })
            }


            if (session.status !== 'Open') {
                return res.status(400).json({
                    message:
                        'This queue session is not open'
                })
            }


            const alreadyQueued =
                session.waitingPlayers.some(
                    playerId =>
                        playerId.toString() ===
                        req.user.id
                )


            if (alreadyQueued) {
                return res.status(400).json({
                    message:
                        'You are already in this queue'
                })
            }


            const currentlyPlaying =
                await QueueMatch.findOne({
                    queueSession:
                        session._id,
                    status:
                        'Playing',
                    players:
                        req.user.id
                })


            if (currentlyPlaying) {
                return res.status(400).json({
                    message:
                        'You are currently playing a match'
                })
            }


            const alreadyParticipant =
                session.participants.some(
                    playerId =>
                        playerId.toString() ===
                        req.user.id
                )


            if (!alreadyParticipant) {

                session.participants.push(
                    req.user.id
                )

            }


            const alreadyActive =
                session.activePlayers.some(
                    playerId =>
                        playerId.toString() ===
                        req.user.id
                )


            if (!alreadyActive) {

                session.activePlayers.push(
                    req.user.id
                )

            }


            session.waitingPlayers.push(
                req.user.id
            )

            await session.save()


            const joinedPosition =
                session.waitingPlayers.length


            const createdMatches =
                await assignAvailableMatches(
                    session
                )


            return res.json({

                message:
                    createdMatches.length > 0
                        ? 'Joined queue and players were assigned to a court'
                        : 'Joined queue successfully',

                position:
                    createdMatches.length > 0
                        ? null
                        : joinedPosition,

                matchesCreated:
                    createdMatches.length

            })


        } catch (err) {

            console.error(
                'JOIN QUEUE ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to join queue'
            })

        }

    }
)

// ==========================
// LEAVE QUICK PLAY SESSION
// ==========================

router.post(
    '/leave/:id',
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Player') {

                return res.status(403).json({
                    message:
                        'Only players can leave Quick Play sessions'
                })

            }


            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            const isParticipant =
                session.activePlayers.some(
                    playerId =>
                        playerId.toString() ===
                        req.user.id
                )


            if (!isParticipant) {

                return res.status(400).json({
                    message:
                        'You are not participating in this session'
                })

            }


            const currentlyPlaying =
                await QueueMatch.findOne({

                    queueSession:
                        session._id,

                    status:
                        'Playing',

                    players:
                        req.user.id

                })


            if (currentlyPlaying) {

                return res.status(400).json({
                    message:
                        'You cannot leave while you are playing. Finish your current match first.'
                })

            }


            session.waitingPlayers =
                session.waitingPlayers.filter(
                    playerId =>
                        playerId.toString() !==
                        req.user.id
                )


            session.activePlayers =
                session.activePlayers.filter(
                    playerId =>
                        playerId.toString() !==
                        req.user.id
                )


            await session.save()


            return res.json({
                message:
                    'You left the Quick Play session'
            })


        } catch (err) {

            console.error(
                'LEAVE QUICK PLAY ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to leave Quick Play session'
            })

        }

    }
)


// ==========================
// ASSIGN PLAYERS TO COURTS
// ==========================

router.post(
    '/assign/:id',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message:
                        'Only organizers can assign queue matches'
                })
            }


            const session =
                await QueueSession.findById(req.params.id)


            if (!session) {
                return res.status(404).json({
                    message:
                        'Queue session not found'
                })
            }


            if (
                session.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'You are not the organizer of this queue session'
                })
            }


            if (session.status !== 'Open') {
                return res.status(400).json({
                    message:
                        'This queue session is not open'
                })
            }


            const playersPerMatch =
                session.gameType === 'Doubles'
                    ? 4
                    : 2


            const activeMatches =
                await QueueMatch.find({
                    queueSession: session._id,
                    status: 'Playing'
                })


            const occupiedCourts =
                activeMatches.map(
                    match => match.courtNumber
                )


            const availableCourts = []

            for (
                let court = 1;
                court <= session.numberOfCourts;
                court++
            ) {

                if (!occupiedCourts.includes(court)) {
                    availableCourts.push(court)
                }

            }


            if (availableCourts.length === 0) {
                return res.status(400).json({
                    message:
                        'All courts are currently occupied'
                })
            }


            const createdMatches = []


            for (const courtNumber of availableCourts) {

                if (
                    session.waitingPlayers.length <
                    playersPerMatch
                ) {
                    break
                }


                const players =
                    session.waitingPlayers.splice(
                        0,
                        playersPerMatch
                    )


                const match =
                    await QueueMatch.create({

                        queueSession:
                            session._id,

                        courtNumber,

                        players,

                        status:
                            'Playing'

                    })


                createdMatches.push(match)

            }


            await session.save()


            if (createdMatches.length === 0) {
                return res.status(400).json({
                    message:
                        `Not enough players. ${playersPerMatch} players are required for ${session.gameType}.`
                })
            }


            const matches =
                await QueueMatch.find({
                    _id: {
                        $in: createdMatches.map(
                            match => match._id
                        )
                    }
                })
                .populate(
                    'players',
                    'userId firstName lastName username'
                )


            return res.json({
                message:
                    'Players assigned to available courts',
                matches
            })


        } catch (err) {

            console.error(
                'ASSIGN QUEUE ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to assign players'
            })

        }

    }
)


// ==========================
// FINISH QUEUE MATCH
// ==========================

router.put(
    '/:sessionId/matches/:matchId/finish',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message:
                        'Only organizers can finish queue matches'
                })
            }


            const session =
                await QueueSession.findById(
                    req.params.sessionId
                )


            if (!session) {
                return res.status(404).json({
                    message:
                        'Queue session not found'
                })
            }


            if (
                session.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'You are not the organizer of this queue session'
                })
            }


            const match =
                await QueueMatch.findById(
                    req.params.matchId
                )


            if (!match) {
                return res.status(404).json({
                    message:
                        'Queue match not found'
                })
            }


            if (
                match.queueSession.toString() !==
                session._id.toString()
            ) {
                return res.status(400).json({
                    message:
                        'This match does not belong to this queue session'
                })
            }


            if (match.status === 'Finished') {
                return res.status(400).json({
                    message:
                        'This match is already finished'
                })
            }


            match.status = 'Finished'
            match.finishedAt = new Date()

            await match.save()


            for (const playerId of match.players) {

            const isStillParticipating =
                session.activePlayers.some(
                    id =>
                        id.toString() ===
                        playerId.toString()
                )


            const alreadyWaiting =
                session.waitingPlayers.some(
                    id =>
                        id.toString() ===
                        playerId.toString()
                )


            if (
                isStillParticipating &&
                !alreadyWaiting
            ) {

                session.waitingPlayers.push(
                    playerId
                )

            }

        }


            await session.save()


            const createdMatches =
                await assignAvailableMatches(
                    session
                )


            let message =
                'Match finished. Players returned to the queue.'


            if (createdMatches.length > 0) {

                message =
                    'Match finished and the next players were assigned automatically.'

            }


            if (session.status === 'Closed') {

                message =
                    'Match finished. The session is closed, so no new match was started.'

            }


            return res.json({

                message,

                matchesCreated:
                    createdMatches.length

            })


        } catch (err) {

            console.error(
                'FINISH QUEUE MATCH ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to finish match'
            })

        }

    }
)


// ==========================
// SINGLE TOURNAMENT
// ==========================

// ==========================
// ORGANIZER TOURNAMENT REPORT LIST
// ==========================
// PLAYER REGISTRATION STATUS
// ==========================
router.get(
    '/:id/registration',
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Player') {
                return res.status(403).json({
                    message: 'Player only'
                })
            }

            const tournament = await Tournament.findById(req.params.id)

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }

            const registration = await TournamentRegistration.findOne({
                tournament: tournament._id,
                player: req.user.id
            })

            return res.json({
                registration
            })

        } catch (err) {

            console.error('REGISTRATION STATUS ERROR:', err)

            return res.status(500).json({
                message: 'Failed to load registration status'
            })

        }

    }
)


// ==========================
// SUBMIT / RESUBMIT PAYMENT
// ==========================
router.post(
    '/:id/payment',
    authMiddleware,
    restrictionMiddleware,
    (req, res, next) => {
        receiptUpload.single('receipt')(req, res, err => {
            if (err) {
                return res.status(400).json({
                    message: err.message
                })
            }
            next()
        })
    },
    async (req, res) => {

        try {

            if (req.user.role !== 'Player') {
                return res.status(403).json({
                    message: 'Only players can submit tournament payments'
                })
            }

            const tournament = await Tournament.findById(req.params.id)

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }

            if (tournament.registrationType !== 'Paid') {
                return res.status(400).json({
                    message: 'This tournament does not require payment'
                })
            }

            const currentStatus = updateTournamentStatus(tournament)

            if (currentStatus !== 'Open') {
                return res.status(400).json({
                    message: 'Registration is no longer open'
                })
            }

            const reference = String(
                req.body.paymentReference || ''
            ).trim()

            if (!reference) {
                return res.status(400).json({
                    message: 'Payment reference number is required'
                })
            }

            if (!req.file) {
                return res.status(400).json({
                    message: 'Payment receipt image is required'
                })
            }

            const registration = await TournamentRegistration.findOne({
                tournament: tournament._id,
                player: req.user.id
            })

            if (!registration) {
                return res.status(404).json({
                    message: 'Register for the tournament before submitting payment'
                })
            }

            if (registration.registrationStatus === 'Confirmed') {
                return res.status(400).json({
                    message: 'Your registration is already confirmed'
                })
            }

            if (registration.paymentStatus === 'For Verification') {
                return res.status(400).json({
                    message: 'Your payment is already waiting for verification'
                })
            }

            if (
                ['Rejected', 'Cancelled'].includes(
                    registration.registrationStatus
                )
            ) {
                const reservedCount = await reservedRegistrationCount(tournament)

                if (
                    tournament.maxPlayers &&
                    reservedCount >= tournament.maxPlayers
                ) {
                    return res.status(400).json({
                        message: 'Tournament is already full'
                    })
                }
            }

            registration.amount = tournament.registrationFee
            registration.paymentMethod =
                tournament.paymentInstructions?.method || ''
            registration.paymentReference = reference
            registration.paymentReceipt =
                `/uploads/payment-receipts/${req.file.filename}`
            registration.registrationStatus = 'Pending'
            registration.paymentStatus = 'For Verification'
            registration.rejectionReason = ''
            registration.submittedAt = new Date()
            registration.verifiedAt = null
            registration.verifiedBy = null

            await registration.save()

            const player = await User.findById(req.user.id)
            const organizer = await User.findById(tournament.organizer)

            if (organizer) {
                const notification = await Notification.create({
                    user: organizer._id,
                    tournament: tournament._id,
                    message: `${player.username} submitted payment for "${tournament.title}"`,
                    organizerUsername: organizer.username
                })

                req.app
                    .get('io')
                    .to(organizer._id.toString())
                    .emit('newNotification', notification)
            }

            return res.json({
                message: 'Payment submitted for verification',
                registration
            })

        } catch (err) {

            console.error('SUBMIT PAYMENT ERROR:', err)

            return res.status(500).json({
                message: 'Failed to submit payment',
                error: err.message
            })

        }

    }
)


// ==========================
// ORGANIZER - LIST REGISTRATIONS
// ==========================
router.get(
    '/:id/registrations',
    authMiddleware,
    async (req, res) => {

        try {

            const tournament = await Tournament.findById(req.params.id)

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }

            if (
                req.user.role !== 'Organizer' ||
                tournament.organizer.toString() !== req.user.id
            ) {
                return res.status(403).json({
                    message: 'Only the tournament organizer can view registrations'
                })
            }

            const registrations = await TournamentRegistration.find({
                tournament: tournament._id
            })
            .populate(
                'player',
                'userId firstName lastName username email'
            )
            .sort({ createdAt: -1 })

            return res.json(registrations)

        } catch (err) {

            console.error('LOAD REGISTRATIONS ERROR:', err)

            return res.status(500).json({
                message: 'Failed to load tournament registrations'
            })

        }

    }
)


// ==========================
// ORGANIZER - APPROVE PAYMENT
// ==========================
router.put(
    '/:id/registrations/:registrationId/approve',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            const tournament = await Tournament.findById(req.params.id)

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }

            if (
                req.user.role !== 'Organizer' ||
                tournament.organizer.toString() !== req.user.id
            ) {
                return res.status(403).json({
                    message: 'Only the tournament organizer can approve payments'
                })
            }

            if (
                tournament.status === 'Ongoing' ||
                tournament.status === 'Finished'
            ) {
                return res.status(400).json({
                    message: 'Payments can no longer be approved after the tournament starts'
                })
            }

            const registration = await TournamentRegistration.findOne({
                _id: req.params.registrationId,
                tournament: tournament._id
            })

            if (!registration) {
                return res.status(404).json({
                    message: 'Registration not found'
                })
            }

            if (
                !['Pending Payment', 'For Verification'].includes(
                    registration.paymentStatus
                ) ||
                registration.registrationStatus !== 'Pending'
            ) {
                return res.status(400).json({
                    message: 'This registration is no longer pending approval'
                })
            }

            const alreadyConfirmed = tournament.players.some(
                player => player.toString() === registration.player.toString()
            )

            if (
                !alreadyConfirmed &&
                tournament.maxPlayers &&
                tournament.players.length >= tournament.maxPlayers
            ) {
                return res.status(400).json({
                    message: 'Tournament is already full'
                })
            }

            registration.registrationStatus = 'Confirmed'
            registration.paymentStatus = 'Paid'
            registration.rejectionReason = ''
            registration.verifiedAt = new Date()
            registration.verifiedBy = req.user.id

            await registration.save()

            if (!alreadyConfirmed) {
                tournament.players.push(registration.player)
                await tournament.save()
            }

            const player = await User.findById(registration.player)

            if (player) {
                const notification = await Notification.create({
                    user: player._id,
                    tournament: tournament._id,
                    message: `Your payment for "${tournament.title}" was approved. Your registration is confirmed.`
                })

                req.app
                    .get('io')
                    .to(player._id.toString())
                    .emit('newNotification', notification)
            }

            return res.json({
                message: 'Payment approved and player registration confirmed',
                registration
            })

        } catch (err) {

            console.error('APPROVE PAYMENT ERROR:', err)

            return res.status(500).json({
                message: 'Failed to approve payment',
                error: err.message
            })

        }

    }
)


// ==========================
// ORGANIZER - REJECT PAYMENT
// ==========================
router.put(
    '/:id/registrations/:registrationId/reject',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            const reason = String(
                req.body.rejectionReason || ''
            ).trim()

            if (!reason) {
                return res.status(400).json({
                    message: 'Rejection reason is required'
                })
            }

            const tournament = await Tournament.findById(req.params.id)

            if (!tournament) {
                return res.status(404).json({
                    message: 'Tournament not found'
                })
            }

            if (
                req.user.role !== 'Organizer' ||
                tournament.organizer.toString() !== req.user.id
            ) {
                return res.status(403).json({
                    message: 'Only the tournament organizer can reject payments'
                })
            }

            const registration = await TournamentRegistration.findOne({
                _id: req.params.registrationId,
                tournament: tournament._id
            })

            if (!registration) {
                return res.status(404).json({
                    message: 'Registration not found'
                })
            }

            if (
                !['Pending Payment', 'For Verification'].includes(
                    registration.paymentStatus
                ) ||
                registration.registrationStatus !== 'Pending'
            ) {
                return res.status(400).json({
                    message: 'This registration is no longer pending review'
                })
            }

            registration.registrationStatus = 'Rejected'
            registration.paymentStatus = 'Rejected'
            registration.rejectionReason = reason
            registration.verifiedAt = new Date()
            registration.verifiedBy = req.user.id

            await registration.save()

            tournament.players = tournament.players.filter(
                player => player.toString() !== registration.player.toString()
            )
            await tournament.save()

            const player = await User.findById(registration.player)

            if (player) {
                const notification = await Notification.create({
                    user: player._id,
                    tournament: tournament._id,
                    message: `Your payment for "${tournament.title}" was rejected: ${reason}`
                })

                req.app
                    .get('io')
                    .to(player._id.toString())
                    .emit('newNotification', notification)
            }

            return res.json({
                message: 'Payment rejected',
                registration
            })

        } catch (err) {

            console.error('REJECT PAYMENT ERROR:', err)

            return res.status(500).json({
                message: 'Failed to reject payment',
                error: err.message
            })

        }

    }
)


// ==========================

router.get(
    '/organizer/reports',
    authMiddleware,
    async (req, res) => {

        try {

            if (
                req.user.role !==
                'Organizer'
            ) {
                return res.status(403).json({
                    message:
                        'Organizer access required'
                })
            }


            const tournaments =
                await Tournament.find({
                    organizer:
                        req.user.id,
                    status:
                        'Finished'
                })
                .select(
                    'title game format location startDate startedAt finishedAt players status createdAt updatedAt'
                )
                .sort({
                    finishedAt: -1,
                    updatedAt: -1
                })


            const tournamentIds =
                tournaments.map(
                    tournament =>
                        tournament._id
                )


            const matchCounts =
                await TournamentMatch.aggregate([
                    {
                        $match: {
                            tournament: {
                                $in:
                                    tournamentIds
                            }
                        }
                    },
                    {
                        $group: {
                            _id:
                                '$tournament',
                            totalMatches: {
                                $sum:
                                    1
                            },
                            completedMatches: {
                                $sum: {
                                    $cond: [
                                        {
                                            $in: [
                                                '$status',
                                                [
                                                    'Finished',
                                                    'Bye'
                                                ]
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ])


            const matchCountMap =
                new Map(
                    matchCounts.map(
                        item => [
                            item._id.toString(),
                            item
                        ]
                    )
                )


            const teamCounts =
                await TournamentTeam.aggregate([
                    {
                        $match: {
                            tournament: {
                                $in:
                                    tournamentIds
                            }
                        }
                    },
                    {
                        $group: {
                            _id:
                                '$tournament',
                            teamCount: {
                                $sum:
                                    1
                            }
                        }
                    }
                ])


            const teamCountMap =
                new Map(
                    teamCounts.map(
                        item => [
                            item._id.toString(),
                            item.teamCount
                        ]
                    )
                )


            const reports =
                tournaments.map(
                    tournament => {

                        const matchCount =
                            matchCountMap.get(
                                tournament._id.toString()
                            ) || {
                                totalMatches:
                                    0,
                                completedMatches:
                                    0
                            }


                        return {
                            _id:
                                tournament._id,

                            title:
                                tournament.title,

                            game:
                                tournament.game,

                            format:
                                tournament.format,

                            location:
                                tournament.location,

                            status:
                                tournament.status,

                            startDate:
                                tournament.startDate,

                            startedAt:
                                tournament.startedAt,

                            finishedAt:
                                tournament.finishedAt,

                            participantCount:
                                tournament.players?.length ||
                                0,

                            teamCount:
                                teamCountMap.get(
                                    tournament._id.toString()
                                ) || 0,

                            totalMatches:
                                matchCount.totalMatches,

                            completedMatches:
                                matchCount.completedMatches
                        }

                    }
                )


            return res.json({
                reports
            })

        } catch (err) {

            console.error(
                'TOURNAMENT REPORT LIST ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to load tournament reports',
                error:
                    err.message
            })

        }

    }
)


// ==========================
// TOURNAMENT REPORT
// ==========================

router.get(
    '/:id/report',
    authMiddleware,
    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(
                    req.params.id
                )
                .populate(
                    'organizer',
                    'userId firstName lastName username email'
                )
                .populate(
                    'players',
                    'userId firstName lastName username'
                )


            if (!tournament) {
                return res.status(404).json({
                    message:
                        'Tournament not found'
                })
            }


            if (
                req.user.role !==
                    'Organizer' ||
                tournament.organizer?._id?.toString() !==
                    req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'You can only view reports for tournaments you organized'
                })
            }


            if (
                tournament.status !==
                'Finished'
            ) {
                return res.status(400).json({
                    message:
                        'A report is available only after the tournament is finished'
                })
            }


            const matches =
                await TournamentMatch.find({
                    tournament:
                        tournament._id
                })
                .populate(
                    'teamA',
                    'userId firstName lastName username'
                )
                .populate(
                    'teamB',
                    'userId firstName lastName username'
                )
                .populate(
                    'winnerPlayers',
                    'userId firstName lastName username'
                )
                .sort({
                    roundNumber: 1,
                    matchNumber: 1
                })


            const teams =
                await TournamentTeam.find({
                    tournament:
                        tournament._id
                })
                .populate(
                    'players',
                    'userId firstName lastName username'
                )
                .sort({
                    createdAt: 1
                })


            const finishedMatches =
                matches.filter(
                    match =>
                        match.status ===
                            'Finished' ||
                        match.status ===
                            'Bye'
                )


            const makeEntryKey =
                members =>
                    (members || [])
                        .map(
                            member =>
                                (
                                    member?._id ||
                                    member
                                ).toString()
                        )
                        .sort()
                        .join(':')


            const makeEntry =
                (
                    entryId,
                    teamName,
                    members
                ) => ({
                    entryId,
                    teamName,
                    members,
                    played: 0,
                    wins: 0,
                    losses: 0,
                    points: 0,
                    scoreFor: 0,
                    scoreAgainst: 0,
                    scoreDifference: 0
                })


            let standings =
                []


            if (
                tournament.format ===
                'Round Robin'
            ) {

                const standingsMap =
                    new Map()


                if (
                    tournament.game ===
                    'Singles'
                ) {

                    for (
                        const player of
                        tournament.players || []
                    ) {

                        standingsMap.set(
                            makeEntryKey([
                                player
                            ]),
                            makeEntry(
                                player._id.toString(),
                                '',
                                [
                                    player
                                ]
                            )
                        )

                    }

                } else {

                    for (
                        const team of
                        teams
                    ) {

                        standingsMap.set(
                            makeEntryKey(
                                team.players
                            ),
                            makeEntry(
                                team._id.toString(),
                                team.name || '',
                                team.players || []
                            )
                        )

                    }

                }


                for (
                    const match of
                    matches.filter(
                        item =>
                            item.status ===
                            'Finished'
                    )
                ) {

                    const a =
                        standingsMap.get(
                            makeEntryKey(
                                match.teamA
                            )
                        )

                    const b =
                        standingsMap.get(
                            makeEntryKey(
                                match.teamB
                            )
                        )


                    if (!a || !b) {
                        continue
                    }


                    const scoreA =
                        Number(
                            match.scoreA ||
                            0
                        )

                    const scoreB =
                        Number(
                            match.scoreB ||
                            0
                        )


                    a.played++
                    b.played++

                    a.scoreFor +=
                        scoreA

                    a.scoreAgainst +=
                        scoreB

                    b.scoreFor +=
                        scoreB

                    b.scoreAgainst +=
                        scoreA


                    if (
                        match.winnerTeam ===
                        'A'
                    ) {

                        a.wins++
                        a.points +=
                            1
                        b.losses++

                    } else if (
                        match.winnerTeam ===
                        'B'
                    ) {

                        b.wins++
                        b.points +=
                            1
                        a.losses++

                    }

                }


                standings =
                    Array.from(
                        standingsMap.values()
                    )
                    .map(
                        item => ({
                            ...item,
                            scoreDifference:
                                item.scoreFor -
                                item.scoreAgainst
                        })
                    )
                    .sort(
                        (a, b) => {

                            if (
                                b.points !==
                                a.points
                            ) {
                                return (
                                    b.points -
                                    a.points
                                )
                            }

                            if (
                                b.wins !==
                                a.wins
                            ) {
                                return (
                                    b.wins -
                                    a.wins
                                )
                            }

                            if (
                                b.scoreDifference !==
                                a.scoreDifference
                            ) {
                                return (
                                    b.scoreDifference -
                                    a.scoreDifference
                                )
                            }

                            return (
                                b.scoreFor -
                                a.scoreFor
                            )

                        }
                    )
                    .map(
                        (
                            item,
                            index
                        ) => ({
                            rank:
                                index +
                                1,
                            ...item
                        })
                    )

            }


            let champion =
                null

            let runnerUp =
                null


            if (
                tournament.format ===
                'Single Elimination'
            ) {

                const finalMatch =
                    [...matches]
                        .filter(
                            match =>
                                match.roundName ===
                                    'Final' &&
                                match.status ===
                                    'Finished'
                        )
                        .sort(
                            (
                                a,
                                b
                            ) =>
                                (
                                    b.roundNumber ||
                                    0
                                ) -
                                (
                                    a.roundNumber ||
                                    0
                                )
                        )[0]


                if (finalMatch) {

                    champion =
                        finalMatch.winnerTeam ===
                        'A'
                            ? finalMatch.teamA
                            : finalMatch.teamB

                    runnerUp =
                        finalMatch.winnerTeam ===
                        'A'
                            ? finalMatch.teamB
                            : finalMatch.teamA

                }

            } else if (
                standings.length >
                0
            ) {

                champion =
                    standings[0].members

                if (
                    standings.length >
                    1
                ) {
                    runnerUp =
                        standings[1].members
                }

            }


            return res.json({

                generatedAt:
                    new Date(),

                tournament: {
                    _id:
                        tournament._id,
                    title:
                        tournament.title,
                    description:
                        tournament.description,
                    game:
                        tournament.game,
                    format:
                        tournament.format,
                    location:
                        tournament.location,
                    startDate:
                        tournament.startDate,
                    registrationDeadline:
                        tournament.registrationDeadline,
                    startedAt:
                        tournament.startedAt,
                    finishedAt:
                        tournament.finishedAt,
                    status:
                        tournament.status,
                    organizer:
                        tournament.organizer
                },

                summary: {
                    participantCount:
                        tournament.players?.length ||
                        0,
                    teamCount:
                        teams.length,
                    totalMatches:
                        matches.length,
                    completedMatches:
                        finishedMatches.length
                },

                participants:
                    tournament.players ||
                    [],

                teams,

                champion,

                runnerUp,

                standings,

                matches

            })

        } catch (err) {

            console.error(
                'TOURNAMENT REPORT ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to generate tournament report',
                error:
                    err.message
            })

        }

    }
)


router.get('/:id', async (req, res) => {

    try {

        const tournament = await Tournament.findById(req.params.id)
            .populate(
                'organizer',
                'firstName lastName username'
            )
            .populate(
                'players',
                'firstName lastName username role createdAt'
            )

        if (tournament) {

            const newStatus = updateTournamentStatus(tournament)

            if (tournament.status !== newStatus) {

                tournament.status = newStatus

                await tournament.save()

            }

        }

        if (!tournament) {
            return res.status(404).json({
                message: 'Not found'
            })
        }

        const reservedCount = await reservedRegistrationCount(tournament)

        const pendingPaymentCount = await TournamentRegistration.countDocuments({
            tournament: tournament._id,
            registrationStatus: 'Pending'
        })

        res.json({
            ...tournament.toObject(),
            registrationSummary: {
                reservedCount,
                pendingPaymentCount,
                confirmedCount: tournament.players?.length || 0
            }
        })

    } catch (err) {

        res.status(500).json({
            error: err.message
        })

    }

})


// ==========================
// DELETE TOURNAMENT 
// ==========================
router.delete(
    '/:id',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

    try {

        const tournament = await Tournament.findById(req.params.id)
        if (!tournament) {
            return res.status(404).json({ message: 'Not found' })
        }

        if (tournament.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' })
        }

        await TournamentRegistration.deleteMany({
            tournament: tournament._id
        })

        await Tournament.findByIdAndDelete(req.params.id)

        res.json({ message: 'Deleted successfully' })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


// ==========================
// UPDATE TOURNAMENT
// ==========================
router.put(
    '/:id',
    authMiddleware,
    restrictionMiddleware,
    async(req,res)=>{

    try{

        const tournament = await Tournament.findById(
            req.params.id
        )

        if(!tournament){
            return res.status(404).json({
                message:'Tournament not found'
            })
        }

        if(
            tournament.organizer.toString() !==
            req.user.id
        ){
            return res.status(403).json({
                message:'Unauthorized'
            })
        }

        const registrationType =
            req.body.registrationType === 'Paid'
                ? 'Paid'
                : 'Free'

        if (registrationType === 'Paid') {
            if (
                !req.body.registrationFee ||
                Number(req.body.registrationFee) <= 0
            ) {
                return res.status(400).json({
                    message: 'A paid tournament must have a registration fee greater than 0'
                })
            }

            if (
                !req.body.paymentInstructions?.method?.trim() ||
                !req.body.paymentInstructions?.accountName?.trim() ||
                !req.body.paymentInstructions?.accountNumber?.trim()
            ) {
                return res.status(400).json({
                    message: 'Complete the payment method, account name, and account number'
                })
            }
        }

        const updatedTournament =
            await Tournament.findByIdAndUpdate(

                req.params.id,

                {
                    title:req.body.title,
                    description:req.body.description,
                    game:req.body.game,
                    format:req.body.format,
                    location:req.body.location,
                    startDate:req.body.startDate,
                    registrationDeadline:
                        req.body.registrationDeadline,
                    maxPlayers:req.body.maxPlayers,
                    registrationType,
                    registrationFee:
                        registrationType === 'Paid'
                            ? Number(req.body.registrationFee)
                            : 0,
                    paymentInstructions:
                        registrationType === 'Paid'
                            ? req.body.paymentInstructions
                            : {
                                method: '',
                                accountName: '',
                                accountNumber: ''
                            }
                },

                {
                    new:true,
                    runValidators:true
                }

            )

        res.json(updatedTournament)

    }catch(err){

        res.status(500).json({
            error:err.message
        })

    }

})

module.exports = router