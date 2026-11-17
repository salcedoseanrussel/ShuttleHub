const mongoose = require('mongoose')

const tournamentTeamSchema = new mongoose.Schema(
    {
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tournament',
            required: true,
            index: true
        },

        name: {
            type: String,
            trim: true,
            default: ''
        },

        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        invitedPlayer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        status: {
            type: String,
            enum: [
                'Pending',
                'Confirmed'
            ],
            default: 'Confirmed',
            index: true
        }
    },
    {
        timestamps: true
    }
)

tournamentTeamSchema.index({
    tournament: 1,
    players: 1
})

tournamentTeamSchema.index({
    tournament: 1,
    invitedPlayer: 1,
    status: 1
})

module.exports = mongoose.model(
    'TournamentTeam',
    tournamentTeamSchema
)
