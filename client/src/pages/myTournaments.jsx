import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function MyTournaments(){

    const [tournaments, setTournaments] = useState([])
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('date-desc')
    const navigate = useNavigate()

    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        fetchMyTournaments()
    }, [])

    const fetchMyTournaments = async () => {

        try{

            const token = localStorage.getItem('token')

            const url =
                user?.role === 'Organizer'
                    ? 'http://localhost:5000/api/tournaments/created'
                    : 'http://localhost:5000/api/tournaments/my'

            const response = await axios.get(url, {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            setTournaments(response.data)

        }catch(err){
            console.log(err)
        }
    }

    const processed = useMemo(() => {

        let data = [...tournaments]

        if (search.trim()) {

            data = data.filter(t =>
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.game.toLowerCase().includes(search.toLowerCase()) ||
                t.location.toLowerCase().includes(search.toLowerCase())
            )

        }

        data = data.filter(t => {

            if (filter === 'all') return true

            if (filter === 'open') {
                return t.status === 'Open'
            }

            if (filter === 'upcoming') {
                return t.status === 'Open' || t.status === 'Closed'
            }

            if (filter === 'live') {
                return t.status === 'Ongoing'
            }

            if (filter === 'finished') {
                return t.status === 'Finished'
            }

            if (filter === 'closed') {
                return t.status === 'Closed'
            }

            return true

        })

        if (sort === 'date-desc') {
            data.sort((a,b)=>new Date(b.startDate)-new Date(a.startDate))
        }

        if (sort === 'date-asc') {
            data.sort((a,b)=>new Date(a.startDate)-new Date(b.startDate))
        }

        if (sort === 'players-desc') {
            data.sort((a,b)=>(b.players?.length||0)-(a.players?.length||0))
        }

        if (sort === 'title-asc') {
            data.sort((a,b)=>a.title.localeCompare(b.title))
        }

        return data

    }, [tournaments, search, filter, sort])

    return(

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">

            <div className="mb-7">

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                    <span className="w-6 h-px bg-[#34C759]"/>
                    Tournament Management
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                    My Tournaments
                </h1>

                <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                    Browse and manage tournaments connected to your account.
                </p>

            </div>

            <div className="flex flex-col lg:flex-row gap-3 mb-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

                <input
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    placeholder="Search tournaments..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                />

                <select
                    value={sort}
                    onChange={(e)=>setSort(e.target.value)}
                    className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                >
                    <option value="date-desc">Newest</option>
                    <option value="date-asc">Oldest</option>
                    <option value="players-desc">Most Players</option>
                    <option value="title-asc">Title A-Z</option>
                </select>

            </div>

            <div className="flex gap-2 mb-6 flex-wrap">

                {['all','open','upcoming','live','finished'].map(f=>(
                    <button
                        key={f}
                        onClick={()=>setFilter(f)}
                        className={`cursor-pointer px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter===f
                                ? 'bg-[#34C759] text-white border-[#34C759] shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                    >
                        {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                ))}

            </div>

            {/* GRID */}

            {processed.length === 0 ? (

                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

                    <h3 className="text-lg font-semibold text-slate-700">
                        No Tournaments Found
                    </h3>

                    <p className="text-slate-500 mt-2">

                        {search.trim()
                            ? 'No tournaments match your search.'
                            : filter === 'all'
                            ? 'You currently have no tournaments.'
                            : `There are no tournaments that match the "${
                                filter.charAt(0).toUpperCase() +
                                filter.slice(1)
                            }" filter.`
                        }

                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">

                    {processed.map((tournament) => (

                        <div
                            key={tournament._id}
                            onClick={() =>
                                navigate(
                                    `/tournament/${tournament._id}`
                                )
                            }
                            className="group relative h-full cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-200 hover:shadow-md transition"
                        >

                            <div className="p-5 sm:p-6">

                                {/* STATUS BADGE */}

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


                                {/* TITLE */}

                                <h2 className="text-xl font-semibold text-slate-950 pr-24 leading-tight group-hover:text-[#279A45] transition">
                                    {tournament.title}
                                </h2>


                                {/* DESCRIPTION */}

                                <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                                    {tournament.description}
                                </p>


                                {/* INFO GRID */}

                                <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-5 text-sm">


                                    {/* GAME */}

                                    <div>

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Game
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {tournament.game}
                                        </p>

                                    </div>


                                    {/* PLAYERS */}

                                    <div>

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Players
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {tournament.players?.length || 0}/{tournament.maxPlayers}
                                        </p>

                                    </div>


                                    {/* LOCATION */}

                                    <div>

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Location
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {tournament.location}
                                        </p>

                                    </div>


                                    {/* DATE */}

                                    <div>

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Date
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {new Date(
                                                tournament.startDate
                                            ).toLocaleDateString()}
                                        </p>

                                    </div>


                                    {/* ORGANIZER */}

                                    <div className="col-span-2">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Organizer
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {tournament.organizer?.username || 'Unknown'}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            </div>

        </div>

    )

}

export default MyTournaments