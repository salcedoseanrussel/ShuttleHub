const playerId = player => String(player?._id || player || '')

// Points are derived from saved results, so refreshing or reloading never adds them twice.
function summarizeQueuePoints(matches = [], gameType) {
    const totals = new Map()
    const validScore = value => value !== null && value !== undefined && value !== '' &&
        Number.isInteger(Number(value)) && Number(value) >= 0

    for (const match of matches) {
        if (match.status !== 'Finished') continue
        const players = match.players || []
        const type = gameType || match.queueSession?.gameType
        const perTeam = type === 'Doubles' ? 2 : type === 'Singles' ? 1 : players.length >= 4 ? 2 : 1
        const teams = {
            A: match.teamA?.length ? match.teamA : players.slice(0, perTeam),
            B: match.teamB?.length ? match.teamB : players.slice(perTeam, perTeam * 2)
        }
        const games = (match.scores || []).filter(score =>
            validScore(score?.teamA) && validScore(score?.teamB)
        )
        if (!games.length) continue
        for (const side of ['A', 'B']) {
            const points = games.reduce((sum, score) => sum + Number(score[`team${side}`]), 0)
            // Every member receives the full team score, rather than a share of it.
            for (const id of new Set(teams[side].map(playerId).filter(Boolean))) {
                const stat = totals.get(id) || { totalPoints: 0, scoredGames: 0, pointsPerGame: 0 }
                stat.totalPoints += points
                stat.scoredGames += games.length
                totals.set(id, stat)
            }
        }
    }
    for (const stat of totals.values()) {
        stat.pointsPerGame = Math.round(stat.totalPoints / stat.scoredGames * 100) / 100
    }
    return totals
}

module.exports = summarizeQueuePoints
