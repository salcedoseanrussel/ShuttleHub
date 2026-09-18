import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

import {
    FaArrowRight,
    FaBell,
    FaBolt,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaList,
    FaMapMarkerAlt,
    FaPlus,
    FaRunning,
    FaTrophy,
    FaUsers
} from 'react-icons/fa'


const API_BASE_URL = 'http://localhost:5000'


function OrganizerDashboard(){

    const [stats, setStats] = useState(null)
    const [quickPlayStats, setQuickPlayStats] = useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    useEffect(() => {

        fetchStats()

        const interval = setInterval(() => {
            fetchStats()
        }, 30000)

        return () => clearInterval(interval)

    }, [])


    const fetchStats = async () => {

        try {

            const token = localStorage.getItem('token')

            const [
                tournamentRes,
                quickPlayRes
            ] = await Promise.all([

                axios.get(
                    `${API_BASE_URL}/api/tournaments/organizer/stats`,
                    {
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    `${API_BASE_URL}/api/queue/organizer/stats`,
                    {
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    }
                )

            ])

            setStats(tournamentRes.data)
            setQuickPlayStats(quickPlayRes.data)

            setError('')

        } catch (err) {

            console.log(
                'ORGANIZER DASHBOARD ERROR:',
                err.response?.data || err.message
            )

            setError(
                err.response?.data?.message ||
                'Failed to load organizer dashboard.'
            )

        } finally {

            setLoading(false)

        }

    }


    const formatDate = value => {

        if(!value) return 'No date'

        return new Date(value).toLocaleDateString(
            undefined,
            {
                month:'short',
                day:'numeric',
                year:'numeric'
            }
        )

    }


    const getTournamentStatusClass = status => {

        if(status === 'Open'){
            return 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }

        if(status === 'Closed'){
            return 'bg-orange-50 text-orange-700 border-orange-100'
        }

        if(status === 'Ongoing'){
            return 'bg-amber-50 text-amber-700 border-amber-100'
        }

        return 'bg-slate-100 text-slate-600 border-slate-200'

    }


    const getQuickPlayStatusClass = status => {

        if(status === 'Open'){
            return 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }

        if(status === 'Closed'){
            return 'bg-orange-50 text-orange-700 border-orange-100'
        }

        return 'bg-slate-100 text-slate-600 border-slate-200'

    }


    if(loading){

        return(

            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">

                <div className="bg-white border border-slate-200 rounded-2xl px-7 py-6 shadow-sm text-center">

                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>

                    <p className="text-sm font-medium text-slate-600">
                        Loading organizer dashboard...
                    </p>

                </div>

            </div>

        )

    }


    if(
        error ||
        !stats ||
        !quickPlayStats
    ){

        return(

            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">

                <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 shadow-sm text-center">

                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900">
                        Dashboard unavailable
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                        {error || 'Unable to load dashboard.'}
                    </p>

                    <button
                        onClick={fetchStats}
                        className="cursor-pointer mt-5 bg-[#34C759] hover:bg-[#2FB350] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        )

    }


    const tournamentCount = stats.createdTournaments || 0
    const participantCount = stats.totalParticipants || 0
    const activeTournamentCount = stats.activeTournaments || 0

    const activeQuickPlayCount = quickPlayStats.activeSessions || 0
    const waitingPlayerCount = quickPlayStats.playersQueued || 0
    const matchesTodayCount = quickPlayStats.matchesCompletedToday || 0

    const statusItems = [
        {
            label:'Open',
            value:stats.openTournaments || 0,
            dot:'bg-[#34C759]'
        },
        {
            label:'Closed',
            value:stats.closedTournaments || 0,
            dot:'bg-orange-400'
        },
        {
            label:'Ongoing',
            value:stats.ongoingTournaments || 0,
            dot:'bg-amber-400'
        },
        {
            label:'Finished',
            value:stats.finishedTournaments || 0,
            dot:'bg-slate-400'
        }
    ]


    return(

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


                {/* ===================================================== */}
                {/* PAGE HEADER */}
                {/* ===================================================== */}

                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">

                    <div>

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                            <span className="w-6 h-px bg-[#34C759]"/>
                            Organizer workspace
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                            Dashboard
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                            Keep track of tournaments, Quick Play sessions, registrations, and recent activity from one place.
                        </p>

                    </div>


                    <div className="flex flex-col sm:flex-row gap-3">

                        <Link
                            to="/create-tournament"
                            className="inline-flex items-center justify-center gap-2 bg-[#34C759] hover:bg-[#2FB350] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                        >
                            <FaPlus className="text-xs"/>
                            New Tournament
                        </Link>

                        <Link
                            to="/create-queue"
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                        >
                            <FaBolt className="text-xs text-[#34C759]"/>
                            New Quick Play
                        </Link>

                    </div>

                </div>


                {/* ===================================================== */}
                {/* PRIMARY METRICS */}
                {/* ===================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">


                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Total Tournaments
                                </p>

                                <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                    {tournamentCount}
                                </p>

                            </div>

                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#34C759] flex items-center justify-center">
                                <FaTrophy/>
                            </div>

                        </div>

                        <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
                            <span className="font-semibold text-emerald-600">
                                {activeTournamentCount}
                            </span>
                            active tournaments
                        </div>

                    </div>


                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Participants
                                </p>

                                <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                    {participantCount}
                                </p>

                            </div>

                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FaUsers/>
                            </div>

                        </div>

                        <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
                            Across your tournaments
                        </div>

                    </div>


                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Active Quick Play
                                </p>

                                <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                    {activeQuickPlayCount}
                                </p>

                            </div>

                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                <FaRunning/>
                            </div>

                        </div>

                        <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
                            <span className="font-semibold text-violet-600">
                                {waitingPlayerCount}
                            </span>
                            players waiting
                        </div>

                    </div>


                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Matches Today
                                </p>

                                <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                    {matchesTodayCount}
                                </p>

                            </div>

                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <FaCheckCircle/>
                            </div>

                        </div>

                        <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
                            Quick Play completed matches
                        </div>

                    </div>

                </div>


                {/* ===================================================== */}
                {/* MAIN WORKSPACE */}
                {/* ===================================================== */}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-7">


                    {/* LEFT: UPCOMING TOURNAMENTS */}

                    <section className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Upcoming Tournaments
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Your next scheduled tournament events.
                                </p>

                            </div>

                            <Link
                                to="/my-tournaments"
                                className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41] transition"
                            >
                                View all
                                <FaArrowRight className="text-xs"/>
                            </Link>

                        </div>


                        {!stats.upcomingTournaments?.length ? (

                            <div className="px-6 py-14 text-center">

                                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <FaCalendarAlt/>
                                </div>

                                <p className="font-medium text-slate-700">
                                    No upcoming tournaments
                                </p>

                                <p className="text-sm text-slate-500 mt-1">
                                    Create a tournament to start organizing your next event.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {stats.upcomingTournaments.slice(0, 5).map(t => (

                                    <Link
                                        key={t._id}
                                        to={`/tournament/${t._id}`}
                                        className="group flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition"
                                    >

                                        <div className="min-w-0">

                                            <div className="flex items-center gap-2">

                                                <p className="font-semibold text-slate-900 truncate group-hover:text-[#279A45] transition">
                                                    {t.title}
                                                </p>

                                                <span className="shrink-0 border border-emerald-100 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                                    Upcoming
                                                </span>

                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">

                                                <span className="inline-flex items-center gap-1.5">
                                                    <FaCalendarAlt className="text-slate-400"/>
                                                    {formatDate(t.startDate)}
                                                </span>

                                                {t.location && (

                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FaMapMarkerAlt className="text-slate-400"/>
                                                        {t.location}
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                        <FaArrowRight className="hidden md:block shrink-0 text-xs text-slate-300 group-hover:text-[#34C759] transition"/>

                                    </Link>

                                ))}

                            </div>

                        )}

                    </section>


                    {/* RIGHT: QUICK ACTIONS */}

                    <section className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="mb-5">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Quick Actions
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Common organizer tasks.
                            </p>

                        </div>


                        <div className="space-y-2.5">

                            <Link
                                to="/create-tournament"
                                className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/60 transition"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 text-[#34C759] flex items-center justify-center">
                                    <FaPlus/>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Create Tournament
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Set up a new badminton event.
                                    </p>
                                </div>

                                <FaArrowRight className="text-xs text-slate-300 group-hover:text-[#34C759]"/>
                            </Link>


                            <Link
                                to="/create-queue"
                                className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50/50 transition"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                    <FaBolt/>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Create Quick Play
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Open a queue and assign courts.
                                    </p>
                                </div>

                                <FaArrowRight className="text-xs text-slate-300 group-hover:text-violet-500"/>
                            </Link>


                            <Link
                                to="/my-tournaments"
                                className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <FaList/>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Manage Tournaments
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        View and update your events.
                                    </p>
                                </div>

                                <FaArrowRight className="text-xs text-slate-300 group-hover:text-blue-500"/>
                            </Link>


                            <Link
                                to="/reports"
                                className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-amber-200 hover:bg-amber-50/50 transition"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <FaTrophy/>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        View Reports
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Review finished event records.
                                    </p>
                                </div>

                                <FaArrowRight className="text-xs text-slate-300 group-hover:text-amber-500"/>
                            </Link>

                        </div>

                    </section>

                </div>


                {/* ===================================================== */}
                {/* TOURNAMENT OPERATIONS */}
                {/* ===================================================== */}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-7">


                    {/* STATUS BREAKDOWN */}

                    <section className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="mb-5">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Tournament Status
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Current distribution of your events.
                            </p>

                        </div>


                        <div className="space-y-3">

                            {statusItems.map(item => (

                                <div
                                    key={item.label}
                                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3.5"
                                >

                                    <div className="flex items-center gap-3">

                                        <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`}/>

                                        <span className="text-sm font-medium text-slate-600">
                                            {item.label}
                                        </span>

                                    </div>

                                    <span className="text-base font-bold text-slate-900">
                                        {item.value}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* REGISTRATION PROGRESS */}

                    <section className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Registration Progress
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Participant capacity for your current tournaments.
                            </p>

                        </div>


                        {!stats.participantProgress?.length ? (

                            <div className="px-6 py-12 text-center text-sm text-slate-500">
                                No tournament registration data available.
                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {stats.participantProgress.slice(0, 6).map(t => {

                                    const percent =
                                        t.maxPlayers > 0
                                            ? Math.min(
                                                (t.players / t.maxPlayers) * 100,
                                                100
                                            )
                                            : 0

                                    return(

                                        <Link
                                            key={t._id}
                                            to={`/tournament/${t._id}`}
                                            className="block px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition"
                                        >

                                            <div className="flex items-center justify-between gap-4 mb-2">

                                                <div className="min-w-0">

                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {t.title}
                                                    </p>

                                                </div>

                                                <div className="shrink-0 text-xs text-slate-500">
                                                    <span className="font-semibold text-slate-800">
                                                        {t.players}
                                                    </span>
                                                    /{t.maxPlayers} players
                                                </div>

                                            </div>


                                            <div className="flex items-center gap-3">

                                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">

                                                    <div
                                                        className="h-2 rounded-full bg-[#34C759]"
                                                        style={{
                                                            width:`${percent}%`
                                                        }}
                                                    />

                                                </div>

                                                <span className="w-10 text-right text-[11px] font-semibold text-slate-500">
                                                    {Math.round(percent)}%
                                                </span>

                                            </div>

                                        </Link>

                                    )

                                })}

                            </div>

                        )}

                    </section>

                </div>


                {/* ===================================================== */}
                {/* QUICK PLAY + DEADLINES */}
                {/* ===================================================== */}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-7">


                    {/* QUICK PLAY */}

                    <section className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Recent Quick Play
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Latest queue sessions and live court activity.
                                </p>

                            </div>

                            <Link
                                to="/quick-play"
                                className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                                <FaArrowRight className="text-xs"/>
                            </Link>

                        </div>


                        {!quickPlayStats.recentSessions?.length ? (

                            <div className="px-6 py-14 text-center">

                                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <FaRunning/>
                                </div>

                                <p className="font-medium text-slate-700">
                                    No Quick Play sessions yet
                                </p>

                                <p className="text-sm text-slate-500 mt-1">
                                    Create a session when players are ready to queue.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {quickPlayStats.recentSessions.slice(0, 5).map(session => (

                                    <Link
                                        key={session._id}
                                        to={`/quick-play/${session._id}`}
                                        className="group flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition"
                                    >

                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#279A45] transition">
                                                {session.name}
                                            </p>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">

                                                {session.location && (

                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FaMapMarkerAlt className="text-slate-400"/>
                                                        {session.location}
                                                    </span>

                                                )}

                                                <span>
                                                    {session.gameType}
                                                </span>

                                                <span>
                                                    {session.numberOfCourts}{' '}
                                                    {session.numberOfCourts === 1 ? 'court' : 'courts'}
                                                </span>

                                                <span>
                                                    {session.waitingPlayers?.length || 0} waiting
                                                </span>

                                            </div>

                                        </div>


                                        <span
                                            className={`w-fit shrink-0 border text-[11px] font-semibold px-2.5 py-1 rounded-full ${getQuickPlayStatusClass(session.status)}`}
                                        >
                                            {session.status}
                                        </span>

                                    </Link>

                                ))}

                            </div>

                        )}

                    </section>


                    {/* REGISTRATION DEADLINES */}

                    <section className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Registration Deadlines
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Tournaments closing soon.
                            </p>

                        </div>


                        {!stats.closingSoon?.length ? (

                            <div className="px-6 py-12 text-center">

                                <FaClock className="text-slate-300 text-xl mx-auto mb-3"/>

                                <p className="text-sm text-slate-500">
                                    No registrations closing soon.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {stats.closingSoon.slice(0, 5).map(t => (

                                    <Link
                                        key={t._id}
                                        to={`/tournament/${t._id}`}
                                        className="block px-5 py-4 hover:bg-slate-50/70 transition"
                                    >

                                        <div className="flex items-start justify-between gap-3">

                                            <div className="min-w-0">

                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {t.title}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {formatDate(t.registrationDeadline)}
                                                </p>

                                            </div>

                                            <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                                                {t.daysLeft <= 0
                                                    ? 'Today'
                                                    : `${t.daysLeft}d`
                                                }
                                            </span>

                                        </div>

                                    </Link>

                                ))}

                            </div>

                        )}

                    </section>

                </div>


                {/* ===================================================== */}
                {/* RECENT ACTIVITY */}
                {/* ===================================================== */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">


                    {/* RECENT TOURNAMENTS */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Recent Tournaments
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Your latest tournament activity.
                                </p>

                            </div>

                            <Link
                                to="/my-tournaments"
                                className="text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                            </Link>

                        </div>


                        {!stats.recentTournaments?.length ? (

                            <div className="px-6 py-12 text-center text-sm text-slate-500">
                                No tournaments created yet.
                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {stats.recentTournaments.slice(0, 5).map(t => (

                                    <Link
                                        key={t._id}
                                        to={`/tournament/${t._id}`}
                                        className="group flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition"
                                    >

                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#279A45] transition">
                                                {t.title}
                                            </p>

                                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">

                                                {t.location && (
                                                    <span>{t.location}</span>
                                                )}

                                                {t.startDate && (
                                                    <span>{formatDate(t.startDate)}</span>
                                                )}

                                            </div>

                                        </div>


                                        <span
                                            className={`shrink-0 border text-[11px] font-semibold px-2.5 py-1 rounded-full ${getTournamentStatusClass(t.status)}`}
                                        >
                                            {t.status}
                                        </span>

                                    </Link>

                                ))}

                            </div>

                        )}

                    </section>


                    {/* RECENT NOTIFICATIONS */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Recent Notifications
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Latest registration and tournament updates.
                                </p>

                            </div>

                            <Link
                                to="/notifications"
                                className="text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                            </Link>

                        </div>


                        {!stats.recentRegistrations?.length ? (

                            <div className="px-6 py-12 text-center">

                                <FaBell className="text-slate-300 text-xl mx-auto mb-3"/>

                                <p className="text-sm text-slate-500">
                                    No recent notifications.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {stats.recentRegistrations.slice(0, 5).map(notification => (

                                    <Link
                                        key={notification._id}
                                        to={
                                            notification.tournament
                                                ? `/tournament/${
                                                    notification.tournament?._id ||
                                                    notification.tournament
                                                }`
                                                : '/notifications'
                                        }
                                        className="block px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition"
                                    >

                                        <div className="flex gap-3">

                                            <div className="w-9 h-9 shrink-0 rounded-full bg-emerald-50 text-[#34C759] flex items-center justify-center mt-0.5">
                                                <FaBell className="text-xs"/>
                                            </div>

                                            <div className="min-w-0">

                                                <p className="text-sm font-medium text-slate-800 leading-5">
                                                    {notification.message}
                                                </p>

                                                {notification.tournamentTitle && (

                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {notification.tournamentTitle}
                                                    </p>

                                                )}

                                                <p className="text-[11px] text-slate-400 mt-1.5">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>

                                            </div>

                                        </div>

                                    </Link>

                                ))}

                            </div>

                        )}

                    </section>

                </div>


            </div>

        </div>

    )

}


export default OrganizerDashboard
