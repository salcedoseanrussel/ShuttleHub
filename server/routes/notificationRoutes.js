const express = require('express')
const Notification = require('../models/Notification')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// GET NOTIFICATIONS
router.get('/', authMiddleware, async (req, res) => {

    try {

        const notifications = await Notification.find({
            user: req.user.id
        }).sort({ createdAt: -1 })

        res.json(notifications)

    } catch (err) {

        res.status(500).json({
            message: err.message
        })

    }

})

// MARK AS READ
router.put('/:id/read', authMiddleware, async (req, res) => {

    try {

        await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true }
        )

        res.json({
            message: 'Notification updated'
        })

    } catch (err) {

        res.status(500).json({
            message: err.message
        })

    }
})

// GET UNREAD NOTIFICATION COUNT
router.get('/unread-count', authMiddleware, async (req, res) => {

    try {

        const count = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        })

        res.json({
            count
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'Failed to get unread notification count'
        })

    }

})

// ==========================
// MARK ALL AS READ
// ==========================
router.put('/read-all', authMiddleware, async (req, res) => {

    try {

        await Notification.updateMany(
            {
                user: req.user.id,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        )

        res.json({
            message: 'All notifications marked as read'
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'Failed to mark notifications as read'
        })

    }

})


// ==========================
// DELETE ONE NOTIFICATION
// ==========================
router.delete('/:id', authMiddleware, async (req, res) => {

    try {

        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        })

        if (!notification) {

            return res.status(404).json({
                message: 'Notification not found'
            })

        }

        res.json({
            message: 'Notification deleted'
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'Failed to delete notification'
        })

    }

})


// ==========================
// DELETE ALL NOTIFICATIONS
// ==========================
router.delete('/', authMiddleware, async (req, res) => {

    try {

        await Notification.deleteMany({
            user: req.user.id
        })

        res.json({
            message: 'All notifications deleted'
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'Failed to delete notifications'
        })

    }

})

module.exports = router