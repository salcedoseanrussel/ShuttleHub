const mongoose = require('mongoose')

const tournamentRegistrationSchema = new mongoose.Schema(
    {
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tournament',
            required: true
        },

        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        amount: {
            type: Number,
            min: 0,
            default: 0
        },

        paymentMethod: {
            type: String,
            default: ''
        },

        paymentReference: {
            type: String,
            trim: true,
            default: ''
        },

        paymentReceipt: {
            type: String,
            default: ''
        },

        registrationStatus: {
            type: String,
            enum: [
                'Pending',
                'Confirmed',
                'Rejected',
                'Cancelled'
            ],
            default: 'Pending'
        },

        paymentStatus: {
            type: String,
            enum: [
                'Not Required',
                'Pending Payment',
                'For Verification',
                'Paid',
                'Rejected'
            ],
            default: 'Pending Payment'
        },

        rejectionReason: {
            type: String,
            trim: true,
            default: ''
        },

        submittedAt: {
            type: Date,
            default: null
        },

        verifiedAt: {
            type: Date,
            default: null
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        timestamps: true
    }
)

tournamentRegistrationSchema.index(
    {
        tournament: 1,
        player: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model(
    'TournamentRegistration',
    tournamentRegistrationSchema
)
