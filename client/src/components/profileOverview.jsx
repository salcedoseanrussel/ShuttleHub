import { useState } from 'react'
import { FaCamera, FaPen } from 'react-icons/fa'
import OrganizerProfileStats from './organizerProfileStats'

function ProfileOverview({ user, stats, loading, error, onRetry, onEdit, onPhotoChange, onRemovePhoto, uploadingPicture, readOnly = false }) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'
    const [activeMode, setActiveMode] = useState('queue')
    const mode = stats?.modes?.[activeMode]
    const queuePlayed = stats?.modes?.queue?.played || 0
    const tournamentPlayed = stats?.modes?.tournament?.played || 0
    const totalPlayed = queuePlayed + tournamentPlayed
    const mostPlayed = totalPlayed === 0
        ? 'No matches played yet'
        : queuePlayed === tournamentPlayed
        ? 'Both modes equally'
        : queuePlayed > tournamentPlayed ? 'Queue Mode' : 'Tournaments'
    const queueShare = totalPlayed > 0 ? Math.round(queuePlayed / totalPlayed * 100) : 0
    const decided = (mode?.wins || 0) + (mode?.losses || 0)
    const winRate = decided > 0 ? Math.round((mode.wins / decided) * 100) : 0
    const metrics = [
        { label: 'Matches played', value: mode?.played },
        { label: 'Wins', value: mode?.wins },
        { label: 'Losses', value: mode?.losses },
        { label: 'Win rate', value: `${winRate}%` }
    ]

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="shrink-0">
                        <div className="relative w-24 h-24">
                            <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-emerald-50 bg-[#34C759] flex items-center justify-center">
                                {user.profilePicture ? (
                                    <img src={`http://localhost:5000/api/users/profile-picture/${user.profilePicture}`} alt={fullName} className="h-full w-full object-cover" />
                                ) : <span className="text-3xl font-bold text-white">{initials || 'P'}</span>}
                            </div>
                            {!readOnly && (<>
                            <input id="profile-picture-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} disabled={uploadingPicture} className="sr-only" />
                            <label htmlFor="profile-picture-input" aria-label="Change profile photo" title="Change profile photo" className={`absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#279A45] ${uploadingPicture ? 'opacity-60' : 'cursor-pointer hover:bg-emerald-50'}`}>
                                <FaCamera />
                            </label>
                            </>)}
                        </div>
                        {!readOnly && (
                        <div className="mt-3 flex gap-3 text-xs">
                            <label htmlFor="profile-picture-input" className={`text-[#279A45] ${uploadingPicture ? 'opacity-60' : 'cursor-pointer hover:underline'}`}>
                                {uploadingPicture ? 'Updating photo...' : 'Change photo'}
                            </label>
                            {user.profilePicture && !uploadingPicture && <button type="button" onClick={onRemovePhoto} className="text-slate-400 hover:text-red-500 cursor-pointer">Remove</button>}
                        </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#279A45]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />{user.role}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 mt-3 break-words">{fullName}</h2>
                        <p className="text-sm text-slate-500 mt-2 break-words">@{user.username}</p>
                        <p className="text-xs text-slate-400 mt-3">Member since {memberSince}</p>
                        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-4">
                            {!readOnly && (
                                <div className="min-w-0">
                                    <dt className="text-xs text-slate-400">Email address</dt>
                                    <dd className="text-sm font-medium text-slate-800 mt-1 break-words">{user.email}</dd>
                                </div>
                            )}
                            <div className="min-w-0">
                                <dt className="text-xs text-slate-400">User ID</dt>
                                <dd className="text-sm font-medium text-slate-800 mt-1 break-words">{user.userId || '—'}</dd>
                            </div>
                        </dl>
                    </div>
                    {!readOnly && (
                    <button type="button" onClick={onEdit} className="self-start sm:self-center inline-flex items-center gap-2 rounded-xl bg-[#34C759] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2FB350] transition cursor-pointer">
                        <FaPen className="text-xs" /> Edit profile
                    </button>
                    )}
                </div>
            </section>

            {user.isRestricted && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Your account has restrictions. Some actions may be unavailable.</div>}

            {user.role === 'Player' && (
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-950">Player Statistics</h2>
                        <p className="text-sm text-slate-500 mt-1">View your results separately for each game mode.</p>
                    </div>

                    {error ? (
                        <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-slate-500">{error}</p>
                            <button type="button" onClick={onRetry} className="text-sm font-semibold text-[#279A45] cursor-pointer hover:underline">Try again</button>
                        </div>
                    ) : (
                        <div className="p-5 sm:p-6 space-y-5" aria-busy={loading}>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Most played mode</p>
                                        <p className="text-lg font-semibold text-slate-900 mt-1">{loading || !stats ? 'Loading statistics...' : mostPlayed}</p>
                                    </div>
                                    <p className="text-xs text-slate-400">Based on completed matches</p>
                                </div>

                                {!loading && stats && (
                                    <>
                                        <div className="flex justify-between gap-3 text-sm text-slate-600 mt-4">
                                            <span>Queue Mode <strong className="text-slate-800">{queuePlayed}</strong></span>
                                            <span>Tournaments <strong className="text-slate-800">{tournamentPlayed}</strong></span>
                                        </div>
                                        <div aria-label={`Completed matches: Queue Mode ${queuePlayed}, Tournaments ${tournamentPlayed}`} className="flex h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
                                            {totalPlayed > 0 && <>
                                                <div className="bg-[#34C759]" style={{ width: `${queueShare}%` }} />
                                                <div className="bg-slate-400" style={{ width: `${100 - queueShare}%` }} />
                                            </>}
                                        </div>
                                    </>
                                )}
                            </div>

                            <nav aria-label="Player statistics modes" className="flex flex-wrap gap-2">
                                {[{ id: 'queue', label: 'Queue Mode' }, { id: 'tournament', label: 'Tournaments' }].map(item => (
                                    <button key={item.id} type="button" onClick={() => setActiveMode(item.id)} aria-pressed={activeMode === item.id}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${activeMode === item.id ? 'bg-[#34C759] text-white border-[#34C759]' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">{activeMode === 'queue' ? 'Queue Mode record' : 'Tournament record'}</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                                    {metrics.map(metric => (
                                        <div key={metric.label} className="rounded-xl border border-slate-200 p-4">
                                            <p className="text-xs text-slate-400">{metric.label}</p>
                                            <p className={`text-2xl font-semibold text-slate-950 mt-2 ${loading ? 'animate-pulse' : ''}`}>{loading || !stats ? '—' : metric.value ?? '—'}</p>
                                        </div>
                                    ))}
                                </div>
                                {!loading && stats && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm">
                                        <p className="text-slate-500">
                                            {activeMode === 'queue' ? `${stats.queueSessionsJoined} sessions joined` : `${stats.tournamentsJoined} tournaments joined`}
                                        </p>
                                        <a href={activeMode === 'queue' ? '/quick-play' : '/tournaments'} className="font-semibold text-[#279A45] hover:underline">
                                            {activeMode === 'queue' ? 'Browse Queue Mode' : 'Browse tournaments'}
                                        </a>
                                    </div>
                                )}
                                {!loading && stats && mode?.played === 0 && <p className="text-sm text-slate-400 mt-3">No completed matches in this mode yet.</p>}
                                <p className="text-xs text-slate-400 mt-3">Win rate includes only matches with a recorded winner.</p>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {user.role === 'Organizer' && (
                <OrganizerProfileStats stats={stats} loading={loading} error={error} onRetry={onRetry} readOnly={readOnly} />
            )}


        </div>
    )
}

export default ProfileOverview
