import { useState } from 'react'

function OrganizerProfileStats({ stats, loading, error, onRetry, readOnly = false }) {
    const [activeMode, setActiveMode] = useState('tournament')
    const mode = stats?.modes?.[activeMode]
    const tournamentCount = stats?.modes?.tournament?.created || 0
    const queueCount = stats?.modes?.queue?.created || 0
    const mostHosted = tournamentCount + queueCount === 0
        ? 'No events created yet'
        : tournamentCount === queueCount
        ? 'Both modes equally'
        : tournamentCount > queueCount ? 'Tournaments' : 'Queue Mode'
    const totals = [
        { label: 'Events created', value: stats?.eventsCreated },
        { label: 'Events completed', value: stats?.eventsCompleted },
        { label: 'Unique players hosted', value: stats?.uniquePlayers }
    ]
    const metrics = [
        { label: 'Created', value: mode?.created },
        { label: 'Completed', value: mode?.finished },
        { label: 'Not yet finished', value: mode?.unfinished },
        { label: 'Matches completed', value: mode?.matchesCompleted }
    ]

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-950">Organizer Statistics</h2>
                <p className="text-sm text-slate-500 mt-1">Your tournaments, queue sessions, and the players you bring together.</p>
            </div>

            {error ? (
                <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">{error}</p>
                    <button type="button" onClick={onRetry} className="text-sm font-semibold text-[#279A45] hover:underline cursor-pointer">Try again</button>
                </div>
            ) : (
                <div className="p-5 sm:p-6 space-y-5" aria-busy={loading}>
                    <div className="grid sm:grid-cols-3 gap-3">
                        {totals.map(item => (
                            <div key={item.label} className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs text-slate-400">{item.label}</p>
                                <p className={`text-2xl font-semibold text-slate-950 mt-2 ${loading ? 'animate-pulse' : ''}`}>{loading || !stats ? '—' : item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Most hosted mode</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">{loading || !stats ? 'Loading statistics...' : mostHosted}</p>
                        {!loading && stats && <p className="text-sm text-slate-500 mt-2">{tournamentCount} tournaments · {queueCount} queue sessions created</p>}
                    </div>

                    <nav aria-label="Organizer statistics modes" className="flex flex-wrap gap-2">
                        {[{ id: 'tournament', label: 'Tournaments' }, { id: 'queue', label: 'Queue Mode' }].map(item => (
                            <button key={item.id} type="button" onClick={() => setActiveMode(item.id)} aria-pressed={activeMode === item.id}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${activeMode === item.id ? 'bg-[#34C759] text-white border-[#34C759]' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">{activeMode === 'tournament' ? 'Tournament activity' : 'Queue Mode activity'}</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                            {metrics.map(item => (
                                <div key={item.label} className="rounded-xl border border-slate-200 p-4">
                                    <p className="text-xs text-slate-400">{item.label}</p>
                                    <p className={`text-2xl font-semibold text-slate-950 mt-2 ${loading ? 'animate-pulse' : ''}`}>{loading || !stats ? '—' : item.value}</p>
                                </div>
                            ))}
                        </div>
                        {!loading && mode && <p className="text-sm text-slate-500 mt-3">{mode.participantEntries} participant entries across these events. Repeat players count once per event.</p>}
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold text-slate-800">Recently created</h3>
                            {!readOnly && (<a href={activeMode === 'tournament' ? '/my-tournaments' : '/my-queues'} className="text-sm font-semibold text-[#279A45] hover:underline">View all</a>)}
                        </div>
                        {loading || !stats ? <p className="text-sm text-slate-400 mt-4">Loading events...</p> : mode?.recentEvents?.length > 0 ? (
                            <div className="divide-y divide-slate-100 mt-3">
                                {mode.recentEvents.map(event => (
                                    <a key={event._id} href={activeMode === 'tournament' ? `/tournament/${event._id}` : `/quick-play/${event._id}`}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 group">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 group-hover:text-[#279A45] break-words">{event.name}</p>
                                            <p className="text-xs text-slate-400 mt-1 break-words">{event.location}</p>
                                        </div>
                                        <span className={`self-start shrink-0 px-3 py-1 rounded-full border text-xs font-semibold ${event.status === 'Finished' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-emerald-50 text-[#279A45] border-emerald-100'}`}>{event.status}</span>
                                    </a>
                                ))}
                            </div>
                        ) : <p className="text-sm text-slate-400 mt-4">{activeMode === 'tournament' ? 'No tournaments created yet.' : 'No queue sessions created yet.'}</p>}
                    </div>
                </div>
            )}
        </section>
    )
}

export default OrganizerProfileStats
