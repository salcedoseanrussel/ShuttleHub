const mongoose = require('mongoose')

const queueSessionSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    gameType: {
        type: String,
        enum: ['Singles', 'Doubles'],
        required: true
    },

    numberOfCourts: {
        type: Number,
        required: true,
        min: 1
    },

    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    waitingPlayers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    activePlayers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    status: {
        type: String,
        enum: ['Open', 'Closed', 'Finished'],
        default: 'Open'
    }

}, {
    timestamps: true
})

module.exports = mongoose.model(
    'QueueSession',
    queueSessionSchema
)