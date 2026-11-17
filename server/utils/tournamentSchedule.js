// Tournament dates and times use Philippine time, independent of the server timezone.
const tournamentStart = tournament => {
    if (!tournament?.startDate) return new Date(NaN)
    const date = new Date(tournament.startDate)
    if (Number.isNaN(date.getTime())) return date
    return new Date(`${date.toISOString().slice(0, 10)}T${tournament.startTime || '00:00'}:00+08:00`)
}

const validateTournamentDetails = body => {
    const fields = ['venue', 'street', 'barangay', 'municipality', 'province']
    const address = Object.fromEntries(fields.map(field => [field,
        typeof body.address?.[field] === 'string' ? body.address[field].trim() : ''
    ]))
    if (!address.venue || !address.barangay || !address.municipality || !address.province) {
        return { error: 'Complete the venue, barangay, municipality/city, and province' }
    }
    const startDate = typeof body.startDate === 'string' ? body.startDate.slice(0, 10) : ''
    const date = new Date(`${startDate}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== startDate) {
        return { error: 'Enter a valid tournament date' }
    }
    const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    if (!validTime(body.startTime) || !validTime(body.endTime)) {
        return { error: 'Enter valid start and end times' }
    }
    if (body.endTime <= body.startTime) {
        return { error: 'End time must be later than start time on the tournament date' }
    }
    return { value: {
        address,
        location: fields.map(field => address[field]).filter(Boolean).join(', '),
        startDate,
        startTime: body.startTime,
        endTime: body.endTime
    } }
}

module.exports = { tournamentStart, validateTournamentDetails }
