const mongoose = require('mongoose')

const tournamentMatchSchema = new mongoose.Schema({

    tournament:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tournament',
        required:true
    },

    roundNumber:{
        type:Number,
        required:true
    },

    roundName:{
        type:String,
        default:''
    },

    matchNumber:{
        type:Number,
        required:true
    },

    teamA:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],

    teamB:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],


    games:[
        {
            gameNumber:{
                type:Number,
                required:true
            },

            scoreA:{
                type:Number,
                required:true
            },

            scoreB:{
                type:Number,
                required:true
            },

            winnerTeam:{
                type:String,
                enum:[
                    'A',
                    'B'
                ],
                required:true
            }
        }
    ],

    gameWinsA:{
        type:Number,
        default:0
    },

    gameWinsB:{
        type:Number,
        default:0
    },

    scoreA:{
        type:Number,
        default:null
    },

    scoreB:{
        type:Number,
        default:null
    },

    winnerTeam:{
        type:String,
        enum:[
            '',
            'A',
            'B'
        ],
        default:''
    },

    winnerPlayers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],

    status:{
        type:String,
        enum:[
            'Pending',
            'Ready',
            'Ongoing',
            'Finished',
            'Bye'
        ],
        default:'Pending'
    },

    nextMatch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'TournamentMatch',
        default:null
    },

    nextSlot:{
        type:String,
        enum:[
            '',
            'A',
            'B'
        ],
        default:''
    },

    scheduledAt:{
        type:Date,
        default:null
    },

    court:{
        type:String,
        default:''
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

tournamentMatchSchema.index({
    tournament:1,
    roundNumber:1,
    matchNumber:1
})

module.exports = mongoose.model(
    'TournamentMatch',
    tournamentMatchSchema
)
