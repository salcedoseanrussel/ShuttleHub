const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    // ==========================
    // USER ID
    // ==========================
    userId: {
        type: String,
        unique: true,
        sparse: true
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    // ==========================
    // ROLE
    // ==========================
    role: {
        type: String,
        enum: [
            'Player',
            'Organizer',
            'Admin'
        ],
        default: 'Player'
    },

    organizerAccess: {
        type: Boolean,
        default: false
    },

    // ==========================
    // ORGANIZER APPLICATION
    // ==========================
    organizerApplication: {

        organizationName: {
            type: String,
            default: ''
        },

        organizerType: {
            type: String,
            default: ''
        },

        position: {
            type: String,
            default: ''
        },

        contactNumber: {
            type: String,
            default: ''
        },

        experience: {
            type: String,
            default: ''
        },

        previousEvents: {
            type: String,
            default: ''
        },

        intendedUse: {
            type: String,
            default: ''
        }

    },

    organizerRequest: {

        status: {
            type: String,
            enum: [
                'None',
                'Pending',
                'Approved',
                'Rejected'
            ],
            default: 'None'
        },

        requestedAt: {
            type: Date,
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        adminNote: {
            type: String,
            default: ''
        },

        rejectionReason: {
            type: String,
            enum: [
                '',
                'Incomplete or invalid information',
                'Duplicate account',
                'Unable to verify account information',
                'Organizer access requirements not met',
                'Suspicious or inappropriate registration',
                'Other'
            ],
            default: ''
        }

    },

    isRestricted: {
        type: Boolean,
        default: false
    },

    resetPasswordCode: {
        type: String,
        default: null
    },

    resetPasswordExpires: {
        type: Date,
        default: null
    },

    deletionRequest: {
        status: {
            type: String,
            enum: [
                'None',
                'Pending',
                'Approved',
                'Rejected'
            ],
            default: 'None'
        },

        requestedAt: {
            type: Date,
            default: null
        },

        reason: {
            type: String,
            default: ''
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        adminNote: {
            type: String,
            default: ''
        }
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    }

}, {

    timestamps: true

})

module.exports = mongoose.model('User', userSchema)
