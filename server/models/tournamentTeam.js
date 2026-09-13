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
                ref: 'User',
                required: true
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
)

tournamentTeamSchema.index(
    {
        tournament: 1,
        'players': 1
    }
)

module.exports = mongoose.model(
    'TournamentTeam',
    tournamentTeamSchema
)
