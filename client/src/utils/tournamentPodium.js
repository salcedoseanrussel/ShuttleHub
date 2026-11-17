const playerName = player =>
    `${player?.firstName || ''} ${player?.lastName || ''}`.trim() ||
    player?.username || 'Player'

const memberKey = members =>
    (members || []).map(member => String(member?._id || member)).sort().join(':')

const entryFor = (members, rank, teams = []) => {
    const id = memberKey(members)
    const team = teams.find(item => memberKey(item.players) === id)
    const names = members.map(playerName).join(' / ')
    return {
        id,
        rank,
        name: team?.name || names,
        members: team?.name ? names : ''
    }
}

export function roundRobinPodium(standings = []) {
    // Preserve the server's points, wins, score difference and score-for ranking.
    return [...standings]
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 3)
        .map((item, index) => ({
            id: item.entryId,
            rank: index + 1,
            name: item.teamName || (item.members || []).map(playerName).join(' / '),
            members: item.teamName ? (item.members || []).map(playerName).join(' / ') : '',
            detail: `${item.wins} wins · ${item.losses} losses · ${item.points} points`
        }))
}

export function eliminationPodium(matches = [], teams = []) {
    const finalRound = Math.max(0, ...matches.map(match => Number(match.roundNumber) || 0))
    const final = matches.find(match =>
        Number(match.roundNumber) === finalRound &&
        !match.nextMatch &&
        match.status === 'Finished' &&
        ['A', 'B'].includes(match.winnerTeam) &&
        match.teamA?.length > 0 && match.teamB?.length > 0
    )

    if (!final) return []

    const winningSide = final.winnerTeam === 'A' ? final.teamA : final.teamB
    const losingSide = final.winnerTeam === 'A' ? final.teamB : final.teamA
    const entries = [entryFor(winningSide, 1, teams), entryFor(losingSide, 2, teams)]
    const seen = new Set(entries.map(entry => entry.id))

    const semifinals = matches.filter(match => {
        const nextId = String(match.nextMatch?._id || match.nextMatch || '')
        return (nextId === String(final._id) || (!nextId && Number(match.roundNumber) === finalRound - 1)) &&
            match.status === 'Finished' && ['A', 'B'].includes(match.winnerTeam)
    })

    for (const match of semifinals) {
        const members = match.winnerTeam === 'A' ? match.teamB : match.teamA
        if (!members?.length) continue
        const entry = entryFor(members, 3, teams)
        if (!seen.has(entry.id)) {
            entries.push(entry)
            seen.add(entry.id)
        }
    }

    return entries
}
