export const tournamentStart = tournament => {
    if (!tournament?.startDate) return new Date(NaN)
    const date = new Date(tournament.startDate)
    if (Number.isNaN(date.getTime())) return date
    return new Date(`${date.toISOString().slice(0, 10)}T${tournament.startTime || '00:00'}:00+08:00`)
}

export const formatTournamentTime = time => {
    if (!time) return 'Not set'
    const [hour, minute] = time.split(':').map(Number)
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
}

export const tournamentAddress = form => Object.fromEntries(
    ['venue', 'street', 'barangay', 'municipality', 'province']
        .map(field => [field, form[field].trim()])
)
