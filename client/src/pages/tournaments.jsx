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

        <div className="min-h-screen bg-[#f8f8f8] p-8">

            {/* HEADER */}
            <h1 className="text-3xl font-semibold text-[#34C759] mb-6">
                Available Tournaments
            </h1>

            {/* SEARCH + SORT */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">

                {/* SEARCH INPUT */}
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tournaments..."
                    className="flex-1 px-5 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 focus:outline-none focus:border-[#34C759]"
                />

                {/* SORT DROPDOWN */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="cursor-pointer px-5 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 focus:outline-none focus:border-[#34C759]"
                >
                    <option value="date-desc">Newest</option>
                    <option value="date-asc">Oldest</option>
                    <option value="players-desc">Most Players</option>
                    <option value="title-asc">Title A-Z</option>
                </select>

            </div>

            {/* FILTERS */}
            <div className="flex gap-2 mb-8 flex-wrap">

                {['all','open','closed','upcoming','live','finished'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter === f
                                ? 'bg-[#34C759] text-white border-[#34C759]'
                                : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-[#34C759]'
                        }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}

                {user?.role === 'Player' && (
                    <button
                        onClick={() => setFilter('joined')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter === 'joined'
                                ? 'bg-[#34C759] text-white border-[#34C759]'
                                : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-[#34C759]'
                        }`}
                    >
                        Joined
                    </button>
                )}

                {user?.role === 'Organizer' && (
                    <button
                        onClick={() => setFilter('created')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter === 'created'
                                ? 'bg-[#34C759] text-white border-[#34C759]'
                                : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-[#34C759]'
                        }`}
                    >
                        Created
                    </button>
                )}

            </div>

            {/* GRID */}

            {paginated.length === 0 ? (

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                    <h3 className="text-lg font-semibold text-gray-700">
                        No Tournaments Found
                    </h3>

                    <p className="text-gray-500 mt-2">

                        {filter === 'all'
                            ? 'There are currently no tournaments available.'
                            : `There are no tournaments that match the "${filter}" filter.`
                        }

                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">

                    {paginated.map((tournament) => (

                        <Link
                            key={tournament._id}
                            to={`/tournament/${tournament._id}`}
                        >

                            <div className="relative h-full bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

                                <div className="p-6">

                                    {/* BADGES */}

                                    <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">

                                        {tournament.status === 'Open' && (

                                            <span className="px-3 py-1 rounded-full bg-green-100 text-[#34C759] text-xs font-semibold">
                                                Open
                                            </span>

                                        )}


                                        {tournament.status === 'Closed' && (

                                            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
                                                Closed
                                            </span>

                                        )}


                                        {tournament.status === 'Ongoing' && (

                                            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                Ongoing
                                            </span>

                                        )}


                                        {tournament.status === 'Finished' && (

                                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                                                Finished
                                            </span>

                                        )}

                                    </div>


                                    <h2 className="text-2xl font-bold text-gray-700 pr-24 leading-tight">
                                        {tournament.title}
                                    </h2>


                                    <p className="text-gray-500 mt-3 line-clamp-2">
                                        {tournament.description}
                                    </p>


                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6 text-sm">

                                        <div>

                                            <p className="text-gray-400">
                                                Game
                                            </p>

                                            <p className="font-semibold text-gray-700">
                                                {tournament.game}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-gray-400">
                                                Players
                                            </p>

                                            <p className="font-semibold text-gray-700">
                                                {tournament.players?.length || 0}/{tournament.maxPlayers}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-gray-400">
                                                Location
                                            </p>

                                            <p className="font-semibold text-gray-700">
                                                {tournament.location}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-gray-400">
                                                Date
                                            </p>

                                            <p className="font-semibold text-gray-700">
                                                {new Date(
                                                    tournament.startDate
                                                ).toLocaleDateString()}
                                            </p>

                                        </div>


                                        <div className="col-span-2">

                                            <p className="text-gray-400">
                                                Organizer
                                            </p>

                                            <p className="font-semibold text-gray-700">
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

                                        <div className="px-6 pb-6">

                                            <button
                                                onClick={(e) => {

                                                    e.preventDefault()

                                                    handleJoinTournament(
                                                        tournament
                                                    )

                                                }}
                                                className="w-full bg-[#34C759] hover:bg-[#2DB84F] text-white py-3 rounded-xl font-semibold transition"
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
            <div className="flex gap-2 mt-6 justify-center">

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 border rounded ${
                            page === i + 1
                                ? 'bg-[#34C759] text-white'
                                : 'bg-white'
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}

            </div>

        </div>
    )
}

export default Tournaments