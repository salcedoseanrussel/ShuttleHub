function summarizeOrganizerProfile(tournaments = [], queues = [], matchCounts = {}) {
    const uniquePlayers = new Set()
    const summarize = (events, members, finishedMatches) => {
        let participantEntries = 0
        const statuses = { Open: 0, Closed: 0, Ongoing: 0, Finished: 0 }
        for (const event of events) {
            if (event.status in statuses) statuses[event.status] += 1
            const ids = new Set((event[members] || []).map(player => String(player?._id || player)))
            participantEntries += ids.size
            for (const id of ids) uniquePlayers.add(id)
        }
        return {
            created: events.length,
            finished: statuses.Finished,
            unfinished: events.length - statuses.Finished,
            participantEntries,
            matchesCompleted: finishedMatches || 0,
            statuses,
            recentEvents: [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(event => ({
                _id: event._id,
                name: event.title || event.name,
                location: event.location,
                status: event.status,
                createdAt: event.createdAt
            }))
        }
    }
    const tournament = summarize(tournaments, 'players', matchCounts.tournament)
    const queue = summarize(queues, 'participants', matchCounts.queue)
    return {
        role: 'Organizer',
        eventsCreated: tournament.created + queue.created,
        eventsCompleted: tournament.finished + queue.finished,
        uniquePlayers: uniquePlayers.size,
        modes: { tournament, queue }
    }
}

module.exports = summarizeOrganizerProfile
