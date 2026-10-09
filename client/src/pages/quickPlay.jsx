import BackLink from '../components/backLink'
import { useEffect, useState, useMemo, useRef } from 'react'
import axios from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom'

function QuickPlay() {
    const location = useLocation()
    const savedView = location.state?.listView
    const firstListRender = useRef(true)


    const navigate = useNavigate()

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    const [filter, setFilter] = useState(savedView?.filter ?? 'all')
    const [search, setSearch] = useState(savedView?.search ?? '')
    const [sort, setSort] = useState(savedView?.sort ?? 'date-desc')

    const [page, setPage] = useState(savedView?.page ?? 1)
    const itemsPerPage = 6


    useEffect(() => {

        fetchSessions()

    }, [])


    useEffect(() => {

        if (firstListRender.current) {
            firstListRender.current = false
            return
        }
        setPage(1)

    }, [search, filter, sort])


    const fetchSessions = async () => {

        try {

            const res = await axios.get(
                'http://localhost:5000/api/queue'
            )

            const sessionsWithTopPlayers = await Promise.all(
                res.data.map(async session => {

                    if (session.status !== 'Finished') {
                        return session
                    }

                    try {

                        const statsRes = await axios.get(
                            `http://localhost:5000/api/queue/${session._id}/stats`
                        )

                        return {
                            ...session,
                            topPlayers: [...(statsRes.data.playerStats || [])]
                                .sort((a, b) => b.winRate - a.winRate)
                                .slice(0, 3)
                        }

                    } catch (err) {

                        console.error('LOAD TOP QUEUE PLAYERS ERROR:', err)
                        return session

                    }

                })
            )

            setSessions(sessionsWithTopPlayers)

        } catch (err) {

            console.error(
                'LOAD QUEUE SESSIONS ERROR:',
                err
            )

        } finally {

            setLoading(false)

        }

    }


    // =========================
    // FILTER + SEARCH + SORT
    // =========================

    const processed = useMemo(() => {

        let data = [...sessions]


        // SEARCH

        if (search.trim()) {

            const searchText =
                search.toLowerCase()

            data = data.filter(
                session =>
                    session.name
                        ?.toLowerCase()
                        .includes(searchText) ||
                    session.gameType
                        ?.toLowerCase()
                        .includes(searchText) ||
                    session.location
                        ?.toLowerCase()
                        .includes(searchText) ||
                    session.organizer
                        ?.username
                        ?.toLowerCase()
                        .includes(searchText)
            )

        }


        // FILTERS

        data = data.filter(
            session => {

                if (filter === 'all') {
                    return true
                }

                if (filter === 'open') {
                    return session.status === 'Open'
                }

                if (filter === 'closed') {
                    return session.status === 'Closed'
                }

                if (filter === 'finished') {
                    return session.status === 'Finished'
                }

                return true

            }
        )


        // SORTING

        if (sort === 'date-desc') {

            data.sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )

        }


        if (sort === 'date-asc') {

            data.sort(
                (a, b) =>
                    new Date(a.createdAt) -
                    new Date(b.createdAt)
            )

        }


        if (sort === 'players-desc') {

            data.sort(
                (a, b) =>
                    (b.participants?.length || 0) -
                    (a.participants?.length || 0)
            )

        }


        if (sort === 'title-asc') {

            data.sort(
                (a, b) =>
                    (a.name || '')
                        .localeCompare(
                            b.name || ''
                        )
            )

        }


        return data

    }, [
        sessions,
        search,
        filter,
        sort
    ])


    // =========================
    // PAGINATION
    // =========================

    const totalPages =
        Math.ceil(
            processed.length /
            itemsPerPage
        )


    const paginated =
        processed.slice(
            (page - 1) *
                itemsPerPage,
            page *
                itemsPerPage
        )


    if (loading) {

        return (

            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">

                <div className="bg-white border border-slate-200 rounded-2xl px-7 py-6 shadow-sm text-center">

                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>

                    <p className="text-sm font-medium text-slate-600">
                        Loading Queue Mode sessions...
                    </p>

                </div>

            </div>

        )

    }


    return (

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">
                <BackLink optional fallbackTo="/" fallbackLabel="Back to Dashboard" />


                {/* HEADER */}

                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">

                    <div>

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">

                            <span className="w-6 h-px bg-[#34C759]"/>

                            Queue Mode

                        </div>


                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                            Available Queue Sessions
                        </h1>


                        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                            Browse Queue Mode sessions, check session details, and find the right badminton queue to join.
                        </p>

                    </div>


                    {user?.role === 'Organizer' && (

                        <button
                            onClick={() =>
                                navigate('/create-queue', { state: { back: { to: '/quick-play', label: 'Back to Queue', state: { back: location.state?.back, listView: { filter, search, sort, page } } } } })
                            }
                            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm transition"
                        >
                            <span className="text-base leading-none">
                                +
                            </span>

                            Create Queue
                        </button>

                    )}

                </div>


                {/* SEARCH + SORT */}

                <div className="flex flex-col lg:flex-row gap-3 mb-4">

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search queue sessions..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                    />


                    <select
                        value={sort}
                        onChange={(e) =>
                            setSort(
                                e.target.value
                            )
                        }
                        className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                    >

                        <option value="date-desc">
                            Newest
                        </option>

                        <option value="date-asc">
                            Oldest
                        </option>

                        <option value="players-desc">
                            Most Players
                        </option>

                        <option value="title-asc">
                            Title A-Z
                        </option>

                    </select>

                </div>


                {/* FILTERS */}

                <div className="flex gap-2 mb-6 flex-wrap">

                    {[
                        'all',
                        'open',
                        'closed',
                        'finished'
                    ].map(f => (

                        <button
                            key={f}
                            onClick={() =>
                                setFilter(f)
                            }
                            className={`cursor-pointer px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                                filter === f
                                    ? 'bg-[#34C759] text-white border-[#34C759] shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>

                    ))}

                </div>


                {/* GRID */}

                {paginated.length === 0 ? (

                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

                        <h3 className="text-lg font-semibold text-slate-900">
                            No Queue Sessions Found
                        </h3>


                        <p className="text-sm text-slate-500 mt-2">

                            {search.trim()
                                ? 'No Queue Mode sessions match your search.'
                                : filter === 'all'
                                ? 'There are currently no Queue Mode sessions available.'
                                : `There are no Queue Mode sessions that match the "${filter}" filter.`
                            }

                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">

                        {paginated.map(
                            session => (

                                <Link
                                    key={session._id}
                                    to={`/quick-play/${session._id}`}
                                    state={{ back: { to: '/quick-play', label: 'Back to Queue', state: { back: location.state?.back, listView: { filter, search, sort, page } } } }}
                                >

                                    <div className="group relative h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">

                                        <div className="p-5 sm:p-6">


                                            {/* BADGES */}

                                            <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">

                                                {session.status === 'Open' && (

                                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                                                        Open
                                                    </span>

                                                )}


                                                {session.status === 'Closed' && (

                                                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold">
                                                        Closed
                                                    </span>

                                                )}


                                                {session.status === 'Finished' && (

                                                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                                                        Finished
                                                    </span>

                                                )}

                                            </div>


                                            <h2 className="text-xl font-semibold text-slate-950 pr-24 leading-snug group-hover:text-[#279A45] transition">
                                                {session.name}
                                            </h2>


                                            <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                                                {session.location}
                                            </p>


                                            <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-5 text-sm">


                                                <div>

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Game
                                                    </p>

                                                    <p className="font-semibold text-slate-800">
                                                        {session.gameType}
                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Players
                                                    </p>

                                                    <p className="font-semibold text-slate-800">
                                                        {session.participants?.length || 0}
                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Location
                                                    </p>

                                                    <p className="font-semibold text-slate-800">
                                                        {session.location}
                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Courts
                                                    </p>

                                                    <p className="font-semibold text-slate-800">
                                                        {session.numberOfCourts}
                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Waiting
                                                    </p>

                                                    <p className="font-semibold text-slate-800">
                                                        {session.waitingPlayers?.length || 0}
                                                    </p>

                                                </div>


                                                <div>

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Date
                                                    </p>

                                                    <p className="font-semibold text-slate-800">
                                                        {new Date(
                                                            session.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>

                                                </div>


                                                <div className="col-span-2">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Organizer
                                                    </p>

                                                    <p className="font-semibold text-slate-800">
                                                        {session.organizer?.username || 'Unknown'}
                                                    </p>

                                                </div>

                                            </div>

                                            {session.status === 'Finished' && (

                                                <div className="mt-5 pt-4 border-t border-slate-200">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-3">
                                                        Top 3 Players
                                                    </p>

                                                    {session.topPlayers?.length > 0 ? (

                                                        <div className="space-y-2">
                                                            {session.topPlayers.map((player, index) => (
                                                                <div key={player._id} className="flex items-center justify-between gap-3 text-sm">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span className="font-semibold text-[#279A45]">#{index + 1}</span>
                                                                        <span className="font-semibold text-slate-800 truncate">
                                                                            {`${player.firstName || ''} ${player.lastName || ''}`.trim() || player.username || 'Player'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-slate-500 shrink-0">{player.winRate}% win rate</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                    ) : (

                                                        <p className="text-sm text-slate-500">
                                                            {session.topPlayers ? 'No player statistics available.' : 'Player statistics could not be loaded.'}
                                                        </p>

                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </Link>

                            )
                        )}

                    </div>

                )}


                {/* PAGINATION */}

                <div className="flex gap-2 mt-7 justify-center">

                    {Array.from(
                        {
                            length:
                                totalPages
                        },
                        (_, i) => (

                            <button
                                key={i}
                                onClick={() =>
                                    setPage(
                                        i + 1
                                    )
                                }
                                className={`cursor-pointer min-w-9 h-9 px-3 border rounded-xl text-sm font-semibold transition ${
                                    page === i + 1
                                        ? 'bg-[#34C759] text-white border-[#34C759]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                                }`}
                            >
                                {i + 1}
                            </button>

                        )
                    )}

                </div>

            </div>

        </div>

    )

}


export default QuickPlay
