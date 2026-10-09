const mongoose = require('mongoose')

const tournamentSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    game:{
        type:String,
        required:true
    },

    format:{
        type:String,
        enum:[
            'Single Elimination',
            'Round Robin'
        ],
        required:true
    },

    location:{
        type:String,
        required:true
    },

    startDate:{
        type:Date,
        required:true
    },

    registrationDeadline:{
        type:Date
    },

    maxPlayers:{
        type:Number,
        required:true
    },

    registrationType:{
        type:String,
        enum:[
            'Free',
            'Paid'
        ],
        default:'Free'
    },

    registrationFee:{
        type:Number,
        min:0,
        default:0
    },

    paymentInstructions:{
        method:{
            type:String,
            default:''
        },
        accountName:{
            type:String,
            default:''
        },
        accountNumber:{
            type:String,
            default:''
        }
    },

    organizer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },

    players:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],

    status:{
        type:String,
        enum:[
            'Open',
            'Closed',
            'Ongoing',
            'Finished'
        ],
        default:'Open'
    },

    startedAt:{
        type:Date,
        default:null
    },

    finishedAt:{
        type:Date,
        default:null
    }

}, {

    timestamps:true

})

module.exports = mongoose.model(
    'Tournament',
    tournamentSchema
)
