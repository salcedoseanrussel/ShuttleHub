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

        <div className="min-h-screen bg-[#f8f8f8] p-8">

            <h1 className="text-3xl font-semibold text-[#34C759] mb-6">
                My Tournaments
            </h1>

            <div className="flex flex-col lg:flex-row gap-4 mb-8">

                <input
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    placeholder="Search tournaments..."
                    className="flex-1 px-5 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 focus:outline-none focus:border-[#34C759]"
                />

                <select
                    value={sort}
                    onChange={(e)=>setSort(e.target.value)}
                    className="cursor-pointer px-5 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 focus:outline-none focus:border-[#34C759]"
                >
                    <option value="date-desc">Newest</option>
                    <option value="date-asc">Oldest</option>
                    <option value="players-desc">Most Players</option>
                    <option value="title-asc">Title A-Z</option>
                </select>

            </div>

            <div className="flex gap-2 mb-8 flex-wrap">

                {['all','open','upcoming','live','finished'].map(f=>(
                    <button
                        key={f}
                        onClick={()=>setFilter(f)}
                        className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter===f
                                ? 'bg-[#34C759] text-white border-[#34C759]'
                                : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-[#34C759]'
                        }`}
                    >
                        {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                ))}

            </div>

            {/* GRID */}

            {processed.length === 0 ? (

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                    <h3 className="text-lg font-semibold text-gray-700">
                        No Tournaments Found
                    </h3>

                    <p className="text-gray-500 mt-2">

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

                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">

                    {processed.map((tournament) => (

                        <div
                            key={tournament._id}
                            onClick={() =>
                                navigate(
                                    `/tournament/${tournament._id}`
                                )
                            }
                            className="relative h-full cursor-pointer bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#34C759] transition"
                        >

                            <div className="p-6">

                                {/* STATUS BADGE */}

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


                                {/* TITLE */}

                                <h2 className="text-2xl font-bold text-gray-700 pr-24 leading-tight">
                                    {tournament.title}
                                </h2>


                                {/* DESCRIPTION */}

                                <p className="text-gray-500 mt-3 line-clamp-2">
                                    {tournament.description}
                                </p>


                                {/* INFO GRID */}

                                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6 text-sm">


                                    {/* GAME */}

                                    <div>

                                        <p className="text-gray-400">
                                            Game
                                        </p>

                                        <p className="font-semibold text-gray-700">
                                            {tournament.game}
                                        </p>

                                    </div>


                                    {/* PLAYERS */}

                                    <div>

                                        <p className="text-gray-400">
                                            Players
                                        </p>

                                        <p className="font-semibold text-gray-700">
                                            {tournament.players?.length || 0}/{tournament.maxPlayers}
                                        </p>

                                    </div>


                                    {/* LOCATION */}

                                    <div>

                                        <p className="text-gray-400">
                                            Location
                                        </p>

                                        <p className="font-semibold text-gray-700">
                                            {tournament.location}
                                        </p>

                                    </div>


                                    {/* DATE */}

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


                                    {/* ORGANIZER */}

                                    <div className="col-span-2">

                                        <p className="text-gray-400">
                                            Organizer
                                        </p>

                                        <p className="font-semibold text-gray-700">
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

    )

}

export default MyTournaments