import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

import {
    FaTrophy,
    FaCalendarAlt,
    FaBell,
    FaUser,
    FaSearch,
    FaRunning,
    FaFlagCheckered,
    FaMapMarkerAlt,
    FaUserTie,
    FaClock
} from 'react-icons/fa'


function PlayerDashboard(){

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    const [stats, setStats] = useState(null)

    const [quickPlayStats, setQuickPlayStats] =
        useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    // ==========================
    // LOAD DASHBOARD
    // ==========================

    useEffect(() => {

        fetchDashboard()

        const interval = setInterval(() => {
            fetchDashboard()
        }, 30000)

        return () => clearInterval(interval)

    }, [])


    // ==========================
    // FETCH DASHBOARD
    // ==========================

    const fetchDashboard = async () => {

        try{

            const token =
                localStorage.getItem('token')

            const [
                tournamentRes,
                quickPlayRes
            ] = await Promise.all([

                axios.get(
                    'http://localhost:5000/api/tournaments/player/stats',
                    {
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    'http://localhost:5000/api/queue'
                )

            ])


            setStats(
                tournamentRes.data
            )


            const sessions =
                Array.isArray(quickPlayRes.data)
                    ? quickPlayRes.data
                    : []


            const openSessions =
                sessions.filter(
                    session =>
                        session.status === 'Open'
                )


            const waitingSessions =
                sessions.filter(
                    session =>
                        session.waitingPlayers?.some(
                            player =>
                                (player?._id || player)
                                    ?.toString() ===
                                user?.id?.toString()
                        )
                )


            const totalWaiting =
                openSessions.reduce(
                    (total, session) =>
                        total +
                        (
                            session.waitingPlayers?.length ||
                            0
                        ),
                    0
                )


            const recentSessions =
                [...sessions]
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt) -
                            new Date(a.createdAt)
                    )
                    .slice(0, 4)


            setQuickPlayStats({

                totalSessions:
                    sessions.length,

                openSessions:
                    openSessions.length,

                waitingSessions:
                    waitingSessions.length,

                totalWaiting,

                recentSessions

            })


            setError('')

        }catch(err){

            console.log(
                'PLAYER DASHBOARD ERROR:',
                err.response?.data || err.message
            )

            setError(
                err.response?.data?.message ||
                'Failed to load player dashboard.'
            )

        }finally{

            setLoading(false)

        }

    }


    // ==========================
    // LOADING
    // ==========================

    if(loading){

        return(

            <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">

                <p className="text-gray-500">
                    Loading dashboard...
                </p>

            </div>

        )

    }


    // ==========================
    // ERROR
    // ==========================

    if(
        error ||
        !stats ||
        !quickPlayStats
    ){

        return(

            <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">

                <div className="text-center">

                    <p className="text-red-500 font-semibold mb-3">
                        {error || 'Unable to load dashboard.'}
                    </p>

                    <button
                        onClick={fetchDashboard}
                        className="cursor-pointer bg-[#34C759] hover:bg-[#2fb350] text-white px-5 py-2 rounded-lg font-semibold transition"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        )

    }


    return(

        <div className="min-h-screen bg-[#F8F8F8] p-8">


            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="mb-8">

                <h1 className="text-3xl font-semibold text-[#34C759]">
                    Player Dashboard
                </h1>

                <p className="text-gray-500">

                    Welcome back,

                    <span className="font-semibold text-gray-700">
                        {' '}{user?.username}
                    </span>

                </p>

            </div>


            {/* ========================= */}
            {/* OVERVIEW */}
            {/* ========================= */}

            <div className="mb-10">

                <div className="flex items-center justify-between mb-5">

                    <div>

                        <h2 className="text-2xl font-semibold text-gray-700">
                            Overview
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            View your tournament and Quick Play activity.
                        </p>

                    </div>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                    {/* ========================= */}
                    {/* TOURNAMENT SUMMARY */}
                    {/* ========================= */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-6">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Tournaments
                                </p>

                                <h2 className="text-3xl font-bold text-gray-700 mt-1">
                                    {stats.joinedCount || 0}
                                </h2>

                                <p className="text-xs text-gray-400 mt-1">
                                    Joined tournaments
                                </p>

                            </div>


                            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

                                <FaTrophy className="text-[#34C759] text-2xl"/>

                            </div>

                        </div>


                        <div className="grid grid-cols-3 gap-3">

                            <Link
                                to="/tournaments?filter=upcoming"
                                className="bg-[#F8F8F8] rounded-xl p-4 hover:bg-green-50 transition"
                            >

                                <p className="text-xs text-gray-400">
                                    Upcoming
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {stats.upcomingCount || 0}
                                </p>

                            </Link>


                            <Link
                                to="/tournaments?filter=live"
                                className="bg-[#F8F8F8] rounded-xl p-4 hover:bg-green-50 transition"
                            >

                                <p className="text-xs text-gray-400">
                                    Live
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {stats.liveCount || 0}
                                </p>

                            </Link>


                            <Link
                                to="/tournaments?filter=finished"
                                className="bg-[#F8F8F8] rounded-xl p-4 hover:bg-green-50 transition"
                            >

                                <p className="text-xs text-gray-400">
                                    Finished
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {stats.finishedCount || 0}
                                </p>

                            </Link>

                        </div>


                        <Link
                            to="/my-tournaments"
                            className="mt-5 w-full inline-flex items-center justify-center border border-[#34C759] text-[#34C759] hover:bg-green-50 px-5 py-3 rounded-xl font-semibold transition"
                        >
                            My Tournaments
                        </Link>

                    </div>


                    {/* ========================= */}
                    {/* QUICK PLAY SUMMARY */}
                    {/* ========================= */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-6">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Quick Play
                                </p>

                                <h2 className="text-3xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.totalSessions || 0}
                                </h2>

                                <p className="text-xs text-gray-400 mt-1">
                                    Available sessions
                                </p>

                            </div>


                            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

                                <FaRunning className="text-[#34C759] text-2xl"/>

                            </div>

                        </div>


                        <div className="grid grid-cols-3 gap-3">

                            <Link
                                to="/quick-play"
                                className="bg-[#F8F8F8] rounded-xl p-4 hover:bg-green-50 transition"
                            >

                                <p className="text-xs text-gray-400">
                                    Open
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.openSessions || 0}
                                </p>

                            </Link>


                            <Link
                                to="/quick-play"
                                className="bg-[#F8F8F8] rounded-xl p-4 hover:bg-green-50 transition"
                            >

                                <p className="text-xs text-gray-400">
                                    You're In
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.waitingSessions || 0}
                                </p>

                            </Link>


                            <Link
                                to="/quick-play"
                                className="bg-[#F8F8F8] rounded-xl p-4 hover:bg-green-50 transition"
                            >

                                <p className="text-xs text-gray-400">
                                    Waiting
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.totalWaiting || 0}
                                </p>

                            </Link>

                        </div>


                        <Link
                            to="/quick-play"
                            className="mt-5 w-full inline-flex items-center justify-center bg-[#34C759] hover:bg-[#2fb350] text-white px-5 py-3 rounded-xl font-semibold transition"
                        >
                            Browse Quick Play
                        </Link>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* QUICK PLAY OVERVIEW */}
            {/* ========================= */}

            <div className="mb-8">

                <div className="flex items-center justify-between mb-5">

                    <div>

                        <h2 className="text-2xl font-semibold text-gray-700">
                            Quick Play Overview
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            See available sessions and your current queue activity.
                        </p>

                    </div>


                    <Link
                        to="/quick-play"
                        className="text-sm font-semibold text-[#34C759] hover:underline"
                    >
                        View all
                    </Link>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


                    {/* SUMMARY */}

                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                        <div className="flex items-center justify-between mb-6">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Open Sessions
                                </p>

                                <h2 className="text-4xl font-semibold text-gray-700 mt-1">
                                    {quickPlayStats.openSessions || 0}
                                </h2>

                            </div>


                            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">

                                <FaRunning className="text-[#34C759] text-2xl"/>

                            </div>

                        </div>


                        <div className="grid grid-cols-2 gap-4">

                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    You're Waiting In
                                </p>

                                <p className="text-2xl font-semibold text-gray-700 mt-1">
                                    {quickPlayStats.waitingSessions || 0}
                                </p>

                            </div>


                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Players Waiting
                                </p>

                                <p className="text-2xl font-semibold text-gray-700 mt-1">
                                    {quickPlayStats.totalWaiting || 0}
                                </p>

                            </div>

                        </div>


                        <Link
                            to="/quick-play"
                            className="mt-5 w-full inline-flex items-center justify-center bg-[#34C759] hover:bg-[#2fb350] text-white px-5 py-3 rounded-xl font-semibold transition"
                        >
                            Browse Quick Play
                        </Link>

                    </div>


                    {/* RECENT SESSIONS */}

                    <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-6">

                        <div className="flex justify-between items-center mb-5">

                            <h2 className="text-xl font-semibold text-gray-700">
                                Recent Quick Play Sessions
                            </h2>

                            <Link
                                to="/quick-play"
                                className="text-sm font-semibold text-[#34C759] hover:underline"
                            >
                                View all
                            </Link>

                        </div>


                        {!quickPlayStats.recentSessions?.length ? (

                            <p className="text-gray-500">
                                No Quick Play sessions available.
                            </p>

                        ) : (

                            <div>

                                {quickPlayStats.recentSessions.map(
                                    session => (

                                        <Link
                                            key={session._id}
                                            to={`/quick-play/${session._id}`}
                                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4 px-2 border-b border-[#F3F4F6] last:border-none hover:bg-[#F8F8F8] rounded-lg transition"
                                        >

                                            <div>

                                                <p className="font-semibold text-gray-700">
                                                    {session.name}
                                                </p>


                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">

                                                    {session.location && (

                                                        <span className="flex items-center gap-1">

                                                            <FaMapMarkerAlt className="text-xs"/>

                                                            {session.location}

                                                        </span>

                                                    )}


                                                    <span>
                                                        {session.gameType}
                                                    </span>


                                                    <span>
                                                        {session.waitingPlayers?.length || 0} waiting
                                                    </span>

                                                </div>

                                            </div>


                                            <span
                                                className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                                                    session.status === 'Open'
                                                        ? 'bg-green-100 text-green-600'
                                                        : session.status === 'Closed'
                                                        ? 'bg-orange-100 text-orange-600'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {session.status}
                                            </span>

                                        </Link>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* MAIN GRID */}
            {/* ========================= */}

            <div className="grid xl:grid-cols-3 gap-6 mb-6">


                {/* ========================= */}
                {/* QUICK ACTIONS */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <h2 className="text-xl font-semibold text-gray-700 mb-5">
                        Quick Actions
                    </h2>


                    <div className="grid grid-cols-2 gap-4">


                        <Link
                            to="/tournaments"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaSearch className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Browse
                            </p>

                        </Link>


                        <Link
                            to="/my-tournaments"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaTrophy className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                My Tournaments
                            </p>

                        </Link>


                        <Link
                            to="/quick-play"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaRunning className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Quick Play
                            </p>

                        </Link>


                        <Link
                            to="/notifications"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaBell className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Notifications
                            </p>

                        </Link>


                        <Link
                            to="/profile"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaUser className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Profile
                            </p>

                        </Link>

                    </div>

                </div>


                {/* ========================= */}
                {/* NEXT TOURNAMENT */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-gray-700">
                            Next Tournament
                        </h2>

                        {stats.nextTournament && (

                            <Link
                                to={`/tournament/${stats.nextTournament._id}`}
                                className="text-sm font-semibold text-[#34C759] hover:underline"
                            >
                                View
                            </Link>

                        )}

                    </div>


                    {stats.nextTournament ? (

                        <Link
                            to={`/tournament/${stats.nextTournament._id}`}
                            className="block border-2 border-dashed border-[#34C759] rounded-xl p-6 hover:bg-[#F8F8F8] transition"
                        >

                            <div className="flex items-center justify-center mb-5">

                                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">

                                    <FaCalendarAlt className="text-[#34C759] text-2xl"/>

                                </div>

                            </div>


                            <h3 className="text-center text-lg font-semibold text-gray-700 mb-5">

                                {stats.nextTournament.title}

                            </h3>


                            <div className="space-y-3">


                                {/* DATE */}

                                <div className="flex items-center gap-3 text-gray-600">

                                    <FaCalendarAlt className="text-[#34C759]"/>

                                    <span className="text-sm">

                                        {new Date(
                                            stats.nextTournament.startDate
                                        ).toLocaleDateString()}

                                    </span>

                                </div>


                                {/* TIME */}

                                <div className="flex items-center gap-3 text-gray-600">

                                    <FaClock className="text-[#34C759]"/>

                                    <span className="text-sm">

                                        {new Date(
                                            stats.nextTournament.startDate
                                        ).toLocaleTimeString(
                                            [],
                                            {
                                                hour:'2-digit',
                                                minute:'2-digit'
                                            }
                                        )}

                                    </span>

                                </div>


                                {/* LOCATION */}

                                {stats.nextTournament.location && (

                                    <div className="flex items-center gap-3 text-gray-600">

                                        <FaMapMarkerAlt className="text-[#34C759]"/>

                                        <span className="text-sm">
                                            {stats.nextTournament.location}
                                        </span>

                                    </div>

                                )}


                                {/* ORGANIZER */}

                                {stats.nextTournament.organizer?.username && (

                                    <div className="flex items-center gap-3 text-gray-600">

                                        <FaUserTie className="text-[#34C759]"/>

                                        <span className="text-sm">

                                            Organizer:{' '}

                                            {stats.nextTournament.organizer.username}

                                        </span>

                                    </div>

                                )}

                            </div>

                        </Link>

                    ) : (

                        <div className="border-2 border-dashed border-[#34C759] rounded-xl p-8 text-center">

                            <FaCalendarAlt className="mx-auto text-5xl text-[#34C759] mb-4"/>

                            <p className="text-gray-500">
                                You haven't joined any upcoming tournaments.
                            </p>


                            <Link
                                to="/tournaments"
                                className="inline-block mt-4 text-[#34C759] font-semibold hover:underline"
                            >
                                Browse Tournaments
                            </Link>

                        </div>

                    )}

                </div>


                {/* ========================= */}
                {/* RECENT NOTIFICATIONS */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-gray-700">
                            Recent Notifications
                        </h2>

                        <Link
                            to="/notifications"
                            className="text-sm font-semibold text-[#34C759] hover:underline"
                        >
                            View all
                        </Link>

                    </div>


                    {!stats.notifications?.length ? (

                        <div className="text-center py-12 text-gray-500">

                            <FaBell className="mx-auto text-4xl mb-4"/>

                            <p>
                                No notifications yet.
                            </p>

                        </div>

                    ) : (

                        <div>

                            {stats.notifications.map(notification => (

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
                                    className="block py-3 px-2 border-b border-[#F3F4F6] last:border-none hover:bg-[#F8F8F8] rounded-lg transition"
                                >

                                    <div className="flex gap-3">

                                        <div className="w-9 h-9 shrink-0 rounded-full bg-green-100 flex items-center justify-center">

                                            <FaBell className="text-[#34C759] text-sm"/>

                                        </div>


                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-gray-700">

                                                {notification.message}

                                            </p>


                                            {notification.tournamentTitle && (

                                                <p className="text-xs text-gray-500 mt-1 truncate">

                                                    {notification.tournamentTitle}

                                                </p>

                                            )}


                                            <p className="text-xs text-gray-400 mt-1">

                                                {new Date(
                                                    notification.createdAt
                                                ).toLocaleString()}

                                            </p>

                                        </div>

                                    </div>

                                </Link>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>

    )

}

export default PlayerDashboard