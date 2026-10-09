const Tournament = require('../models/tournament')
const QueueSession = require('../models/queueSession')
const QueueMatch = require('../models/queueMatch')
const TournamentMatch = require('../models/tournamentMatch')
const summarizePlayerProfile = require('./playerProfileStats')
const summarizeOrganizerProfile = require('./organizerProfileStats')

async function loadProfileStatistics(userId, role) {
    if (role === 'Organizer') {
        const [tournaments, queues] = await Promise.all([
            Tournament.find({ organizer: userId }).select('title location status createdAt players').lean(),
            QueueSession.find({ organizer: userId }).select('name location status createdAt participants').lean()
        ])
        const [tournamentMatches, queueMatches] = await Promise.all([
            TournamentMatch.countDocuments({ tournament: { $in: tournaments.map(event => event._id) }, status: 'Finished' }),
            QueueMatch.countDocuments({ queueSession: { $in: queues.map(event => event._id) }, status: 'Finished' })
        ])
        return summarizeOrganizerProfile(tournaments, queues, { tournament: tournamentMatches, queue: queueMatches })
    }

    if (role !== 'Player') return null

    const [queueMatches, tournamentMatches, tournamentsJoined, queueSessionsJoined] = await Promise.all([
        QueueMatch.find({
            status: 'Finished',
            $or: [{ players: userId }, { teamA: userId }, { teamB: userId }]
        }).select('status winnerTeam players teamA teamB queueSession').populate('queueSession', 'gameType').lean(),
        TournamentMatch.find({
            status: 'Finished',
            $or: [{ teamA: userId }, { teamB: userId }]
        }).select('status winnerTeam teamA teamB').lean(),
        Tournament.countDocuments({ players: userId }),
        QueueSession.countDocuments({ participants: userId })
    ])

    return { role: 'Player', ...summarizePlayerProfile(userId, queueMatches, tournamentMatches, { tournamentsJoined, queueSessionsJoined }) }
}

module.exports = loadProfileStatistics
