const mongoose = require('mongoose')


const queueMatchSchema = new mongoose.Schema({

    queueSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QueueSession',
        required: true
    },


    courtNumber: {
        type: Number,
        required: true
    },


    // ==========================
    // ALL PLAYERS
    // ==========================

    players: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],


    // ==========================
    // TEAM A
    // ==========================

    teamA: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],


    // ==========================
    // TEAM B
    // ==========================

    teamB: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],


    // ==========================
    // GAME SCORES
    // ==========================

    scores: [
        {
            teamA: {
                type: Number,
                required: true
            },

            teamB: {
                type: Number,
                required: true
            },

            _id: false
        }
    ],


    // ==========================
    // WINNING TEAM
    // ==========================

    winnerTeam: {
        type: String,
        enum: [
            'A',
            'B'
        ],
        default: null
    },


    status: {
        type: String,
        enum: [
            'Playing',
            'Finished'
        ],
        default: 'Playing'
    },


    startedAt: {
        type: Date,
        default: Date.now
    },


    finishedAt: {
        type: Date,
        default: null
    }


}, {
    timestamps: true
})


module.exports = mongoose.model(
    'QueueMatch',
    queueMatchSchema
)