import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Link, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'

function Tournaments(){
    const [searchParams] = useSearchParams()

    const [tournaments, setTournaments] = useState([])

    const [filter, setFilter] = useState(
        searchParams.get('filter') || 'all'
    )
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('date-desc')

    const [page, setPage] = useState(1)
    const itemsPerPage = 6

    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        fetchTournaments()
    }, [])

    useEffect(() => {

        setFilter(
            searchParams.get('filter') || 'all'
        )

    }, [searchParams])

        useEffect(() => {
        setPage(1)
    }, [search, filter, sort])

    const fetchTournaments = async() => {
        try{
            const res = await axios.get('http://localhost:5000/api/tournaments')
            setTournaments(res.data)
        }catch(err){
            console.log(err)
        }
    }

    const handleJoinTournament = async (tournament) => {

        const result = await Swal.fire({
            title: 'Join Tournament?',
            text: `You are about to register for "${tournament.title}".`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#34C759',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Join',
            cancelButtonText: 'Cancel'
        })

        if (!result.isConfirmed) return

        try {

            const token = localStorage.getItem('token')

            const res = await axios.post(
                `http://localhost:5000/api/tournaments/join/${tournament._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            toast.success(res.data.message)

            fetchTournaments()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to join tournament'
            )

        }

    }

    // =========================
    // FILTER + SEARCH + SORT
    // =========================
    const processed = useMemo(() => {

        let data = [...tournaments]

        // SEARCH
        if (search.trim()) {

            const searchText = search.toLowerCase()

            data = data.filter(t =>
                t.title?.toLowerCase().includes(searchText) ||
                t.game?.toLowerCase().includes(searchText) ||
                t.location?.toLowerCase().includes(searchText)
            )

        }

        // FILTERS
        data = data.filter(t => {

            if (filter === 'all') {
                return true
            }

            if (filter === 'open') {
                return t.status === 'Open'
            }

            if (filter === 'closed') {
                return t.status === 'Closed'
            }

            if (filter === 'upcoming') {
                return (
                    new Date(t.startDate) > new Date() &&
                    t.status !== 'Finished'
                )
            }

            if (filter === 'live') {
                return t.status === 'Ongoing'
            }

            if (filter === 'finished') {
                return t.status === 'Finished'
            }

            if (filter === 'joined') {
                return t.players?.some(
                    p =>
                        p === user?.id ||
                        p?._id === user?.id
                )
            }

            if (filter === 'created') {
                return (
                    t.organizer?._id?.toString() ===
                    user?.id?.toString()
                )
            }

            return true

        })

        // SORTING
        if (sort === 'date-desc') {

            data.sort(
                (a, b) =>
                    new Date(b.startDate) -
                    new Date(a.startDate)
            )

        }

        if (sort === 'date-asc') {

            data.sort(
                (a, b) =>
                    new Date(a.startDate) -
                    new Date(b.startDate)
            )

        }

        if (sort === 'players-desc') {

            data.sort(
                (a, b) =>
                    (b.players?.length || 0) -
                    (a.players?.length || 0)
            )

        }

        if (sort === 'title-asc') {

            data.sort(
                (a, b) =>
                    a.title.localeCompare(b.title)
            )

        }

        return data

    }, [tournaments, search, filter, sort, user])

    // =========================
    // PAGINATION
    // =========================
    const totalPages = Math.ceil(processed.length / itemsPerPage)

    const paginated = processed.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    )

    return(

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">

            {/* HEADER */}

            <div className="mb-7">

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                    <span className="w-6 h-px bg-[#34C759]"/>
                    Tournaments
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                    Available Tournaments
                </h1>

                <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                    Browse tournaments, check event details, and find the right competition to join.
                </p>

            </div>

            {/* SEARCH + SORT */}
            <div className="flex flex-col lg:flex-row gap-3 mb-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

                {/* SEARCH INPUT */}
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tournaments..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                />

                {/* SORT DROPDOWN */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                >
                    <option value="date-desc">Newest</option>
                    <option value="date-asc">Oldest</option>
                    <option value="players-desc">Most Players</option>
                    <option value="title-asc">Title A-Z</option>
                </select>

            </div>

            {/* FILTERS */}
            <div className="flex gap-2 mb-6 flex-wrap">

                {['all','open','closed','upcoming','live','finished'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`cursor-pointer px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter === f
                                ? 'bg-[#34C759] text-white border-[#34C759] shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}

                {user?.role === 'Player' && (
                    <button
                        onClick={() => setFilter('joined')}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter === 'joined'
                                ? 'bg-[#34C759] text-white border-[#34C759] shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                    >
                        Joined
                    </button>
                )}

                {user?.role === 'Organizer' && (
                    <button
                        onClick={() => setFilter('created')}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter === 'created'
                                ? 'bg-[#34C759] text-white border-[#34C759] shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                    >
                        Created
                    </button>
                )}

            </div>

            {/* GRID */}

            {paginated.length === 0 ? (

                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

                    <h3 className="text-lg font-semibold text-slate-900">
                        No Tournaments Found
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">

                        {filter === 'all'
                            ? 'There are currently no tournaments available.'
                            : `There are no tournaments that match the "${filter}" filter.`
                        }

                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">

                    {paginated.map((tournament) => (

                        <Link
                            key={tournament._id}
                            to={`/tournament/${tournament._id}`}
                        >

                            <div className="group relative h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">

                                <div className="p-5 sm:p-6">

                                    {/* BADGES */}

                                    <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">

                                        {tournament.status === 'Open' && (

                                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                                                Open
                                            </span>

                                        )}


                                        {tournament.status === 'Closed' && (

                                            <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold">
                                                Closed
                                            </span>

                                        )}


                                        {tournament.status === 'Ongoing' && (

                                            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold">
                                                Ongoing
                                            </span>

                                        )}


                                        {tournament.status === 'Finished' && (

                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                                                Finished
                                            </span>

                                        )}

                                    </div>


                                    <h2 className="text-xl font-semibold text-slate-950 pr-24 leading-snug group-hover:text-[#279A45] transition">
                                        {tournament.title}
                                    </h2>


                                    <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                                        {tournament.description}
                                    </p>


                                    <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-5 text-sm">

                                        <div>

                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Game
                                            </p>

                                            <p className="font-semibold text-slate-800">
                                                {tournament.game}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Players
                                            </p>

                                            <p className="font-semibold text-slate-800">
                                                {tournament.players?.length || 0}/{tournament.maxPlayers}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Location
                                            </p>

                                            <p className="font-semibold text-slate-800">
                                                {tournament.location}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Date
                                            </p>

                                            <p className="font-semibold text-slate-800">
                                                {new Date(
                                                    tournament.startDate
                                                ).toLocaleDateString()}
                                            </p>

                                        </div>


                                        <div className="col-span-2">

                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Organizer
                                            </p>

                                            <p className="font-semibold text-slate-800">
                                                {tournament.organizer?.username}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* JOIN BUTTON */}

                                {user?.role === 'Player' &&
                                    tournament.status === 'Open' &&
                                    tournament.players?.length < tournament.maxPlayers &&
                                    !tournament.players?.some(
                                        p =>
                                            p === user?.id ||
                                            p?._id === user?.id
                                    ) && (

                                        <div className="px-5 sm:px-6 pb-5 sm:pb-6">

                                            <button
                                                onClick={(e) => {

                                                    e.preventDefault()

                                                    handleJoinTournament(
                                                        tournament
                                                    )

                                                }}
                                                className="w-full bg-[#34C759] hover:bg-[#2FB350] text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                                            >
                                                Join Tournament
                                            </button>

                                        </div>

                                    )
                                }

                            </div>

                        </Link>

                    ))}

                </div>

            )}

            {/* PAGINATION */}
            <div className="flex gap-2 mt-7 justify-center">

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`cursor-pointer min-w-9 h-9 px-3 border rounded-xl text-sm font-semibold transition ${
                            page === i + 1
                                ? 'bg-[#34C759] text-white border-[#34C759]'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}

            </div>

            </div>

        </div>
    )
}

export default Tournaments