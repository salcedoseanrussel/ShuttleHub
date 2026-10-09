const memberId = member => String(member?._id || member || '')
const includesPlayer = (members, playerId) =>
    (members || []).some(member => memberId(member) === String(playerId))

function summarizePlayerProfile(playerId, queueMatches = [], tournamentMatches = [], participation = {}) {
    const modes = {
        queue: { played: 0, wins: 0, losses: 0 },
        tournament: { played: 0, wins: 0, losses: 0 }
    }

    const processMatch = (match, mode) => {
        if (match.status !== 'Finished') return
        const perTeam = match.queueSession?.gameType === 'Doubles' ? 2 : 1
        const teamA = match.teamA?.length ? match.teamA : (match.players || []).slice(0, perTeam)
        const teamB = match.teamB?.length ? match.teamB : (match.players || []).slice(perTeam, perTeam * 2)
        const onA = includesPlayer(teamA, playerId)
        const onB = includesPlayer(teamB, playerId)
        if (!onA && !onB && !includesPlayer(match.players, playerId)) return

        modes[mode].played += 1
        if (!['A', 'B'].includes(match.winnerTeam)) return
        if (!onA && !onB) return
        const won = match.winnerTeam === 'A' ? onA : onB
        modes[mode][won ? 'wins' : 'losses'] += 1
    }

    queueMatches.forEach(match => processMatch(match, 'queue'))
    tournamentMatches.forEach(match => processMatch(match, 'tournament'))
    const wins = modes.queue.wins + modes.tournament.wins
    const losses = modes.queue.losses + modes.tournament.losses
    const played = modes.queue.played + modes.tournament.played
    const decided = wins + losses
    const tournamentsJoined = participation.tournamentsJoined || 0
    const queueSessionsJoined = participation.queueSessionsJoined || 0

    return {
        played, wins, losses,
        winRate: decided > 0 ? Math.round(wins / decided * 100) : 0,
        decided,
        tournamentsJoined,
        queueSessionsJoined,
        modes
    }
}

module.exports = summarizePlayerProfile
