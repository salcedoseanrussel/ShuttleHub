import BackLink from '../components/backLink'
import {
    useEffect,
    useMemo,
    useState
} from 'react'

import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'


function MyQueues() {
    const location = useLocation()
    const savedView = location.state?.listView


    const [queues, setQueues] =
        useState([])

    const [filter, setFilter] =
        useState(savedView?.filter ?? 'all')

    const [search, setSearch] =
        useState(savedView?.search ?? '')

    const [sort, setSort] =
        useState(savedView?.sort ?? 'date-desc')

    const navigate =
        useNavigate()

    const user =
        JSON.parse(
            localStorage.getItem('user')
        )


    useEffect(() => {
        fetchMyQueues()
    }, [])


    const fetchMyQueues =
        async () => {

            try {

                const token =
                    localStorage.getItem('token')

                const response =
                    await axios.get(
                        'http://localhost:5000/api/queue/my-queues',
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )

                setQueues(
                    response.data?.queues || []
                )

            } catch (err) {

                console.log(
                    'MY QUEUES ERROR:',
                    err.response?.data ||
                    err.message
                )

            }

        }


    const processed =
        useMemo(() => {

            let data =
                [...queues]


            if (search.trim()) {

                const searchText =
                    search
                        .trim()
                        .toLowerCase()

                data =
                    data.filter(
                        queue =>
                            queue.name
                                ?.toLowerCase()
                                .includes(searchText) ||
                            queue.gameType
                                ?.toLowerCase()
                                .includes(searchText) ||
                            queue.location
                                ?.toLowerCase()
                                .includes(searchText) ||
                            queue.organizer
                                ?.username
                                ?.toLowerCase()
                                .includes(searchText)
                    )

            }


            data =
                data.filter(
                    queue => {

                        if (
                            filter === 'all'
                        ) {
                            return true
                        }

                        if (
                            filter === 'open'
                        ) {
                            return (
                                queue.status ===
                                'Open'
                            )
                        }

                        if (
                            filter === 'closed'
                        ) {
                            return (
                                queue.status ===
                                'Closed'
                            )
                        }

                        if (
                            filter === 'finished'
                        ) {
                            return (
                                queue.status ===
                                'Finished'
                            )
                        }

                        return true

                    }
                )


            if (
                sort === 'date-desc'
            ) {

                data.sort(
                    (a, b) =>
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                )

            }


            if (
                sort === 'date-asc'
            ) {

                data.sort(
                    (a, b) =>
                        new Date(
                            a.createdAt
                        ) -
                        new Date(
                            b.createdAt
                        )
                )

            }


            if (
                sort === 'players-desc'
            ) {

                data.sort(
                    (a, b) =>
                        (
                            b.participantCount ||
                            b.participants?.length ||
                            0
                        ) -
                        (
                            a.participantCount ||
                            a.participants?.length ||
                            0
                        )
                )

            }


            if (
                sort === 'title-asc'
            ) {

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
            queues,
            search,
            filter,
            sort
        ])


    const getParticipantCount =
        queue =>
            queue.participantCount ??
            queue.participants?.length ??
            0


    return (

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">
                <BackLink optional fallbackTo="/" fallbackLabel="Back to Dashboard" />


                <div className="mb-7">

                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">

                        <span className="w-6 h-px bg-[#34C759]"/>

                        Queue Mode

                    </div>


                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                        My Queues
                    </h1>


                    <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">

                        {user?.role === 'Organizer'
                            ? 'Browse and manage queue sessions you created.'
                            : 'Browse queue sessions connected to your account.'}

                    </p>

                </div>


                <div className="flex flex-col lg:flex-row gap-3 mb-4">

                    <input
                        value={search}
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Search queues..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                    />


                    <select
                        value={sort}
                        onChange={
                            event =>
                                setSort(
                                    event.target.value
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


                <div className="flex gap-2 mb-6 flex-wrap">

                    {[
                        'all',
                        'open',
                        'closed',
                        'finished'
                    ].map(
                        item => (

                            <button
                                key={item}
                                onClick={() =>
                                    setFilter(item)
                                }
                                className={`cursor-pointer px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                                    filter === item
                                        ? 'bg-[#34C759] text-white border-[#34C759] shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                                }`}
                            >
                                {item
                                    .charAt(0)
                                    .toUpperCase() +
                                    item.slice(1)}
                            </button>

                        )
                    )}

                </div>


                {processed.length === 0 ? (

                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

                        <h3 className="text-lg font-semibold text-slate-700">
                            No Queues Found
                        </h3>


                        <p className="text-slate-500 mt-2">

                            {search.trim()
                                ? 'No queues match your search.'
                                : filter === 'all'
                                ? user?.role === 'Organizer'
                                    ? 'You currently have no created queues.'
                                    : 'You currently have no joined queues.'
                                : `There are no queues that match the "${
                                    filter
                                        .charAt(0)
                                        .toUpperCase() +
                                    filter.slice(1)
                                }" filter.`
                            }

                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">

                        {processed.map(
                            queue => (

                                <div
                                    key={queue._id}
                                    onClick={() =>
                                        navigate(
                                            `/quick-play/${queue._id}`,
                                    { state: { back: { to: '/my-queues', label: 'Back to My Queues', state: { back: location.state?.back, listView: { filter, search, sort } } } } }
                                        )
                                    }
                                    className="group relative h-full cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-200 hover:shadow-md transition"
                                >

                                    <div className="p-5 sm:p-6">


                                        <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">

                                            {queue.status === 'Open' && (

                                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                                                    Open
                                                </span>

                                            )}


                                            {queue.status === 'Closed' && (

                                                <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold">
                                                    Closed
                                                </span>

                                            )}


                                            {queue.status === 'Finished' && (

                                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                                                    Finished
                                                </span>

                                            )}

                                        </div>


                                        <h2 className="text-xl font-semibold text-slate-950 pr-24 leading-tight group-hover:text-[#279A45] transition">
                                            {queue.name}
                                        </h2>


                                        <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                                            {queue.location}
                                        </p>


                                        <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-5 text-sm">


                                            <div>

                                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Game
                                                </p>

                                                <p className="font-semibold text-slate-800 mt-1">
                                                    {queue.gameType}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Players
                                                </p>

                                                <p className="font-semibold text-slate-800 mt-1">
                                                    {getParticipantCount(queue)}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Location
                                                </p>

                                                <p className="font-semibold text-slate-800 mt-1">
                                                    {queue.location}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Date
                                                </p>

                                                <p className="font-semibold text-slate-800 mt-1">
                                                    {new Date(
                                                        queue.createdAt
                                                    ).toLocaleDateString()}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Courts
                                                </p>

                                                <p className="font-semibold text-slate-800 mt-1">
                                                    {queue.numberOfCourts}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Matches
                                                </p>

                                                <p className="font-semibold text-slate-800 mt-1">
                                                    {queue.totalMatches || 0}
                                                </p>

                                            </div>


                                            <div className="col-span-2">

                                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Organizer
                                                </p>

                                                <p className="font-semibold text-slate-800 mt-1">
                                                    {queue.organizer?.username || 'Unknown'}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    )

}

export default MyQueues
