import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import {
    FaTrophy,
    FaUsers,
    FaRunning,
    FaFlagCheckered,
    FaPlus,
    FaList,
    FaClipboardList,
    FaClock,
    FaLock,
    FaCheckCircle,
    FaCalendarAlt,
    FaMapMarkerAlt
} from 'react-icons/fa'


function OrganizerDashboard(){

    const navigate = useNavigate()

    const [stats, setStats] = useState(null)

    const [quickPlayStats, setQuickPlayStats] =
        useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    // ==========================
    // LOAD DASHBOARD
    // ==========================

    useEffect(() => {

        fetchStats()

        const interval = setInterval(() => {
            fetchStats()
        }, 30000)

        return () => clearInterval(interval)

    }, [])


    // ==========================
    // FETCH STATS
    // ==========================

    const fetchStats = async () => {

        try {

            const token =
                localStorage.getItem('token')


            const [
                tournamentRes,
                quickPlayRes
            ] = await Promise.all([

                axios.get(
                    'http://localhost:5000/api/tournaments/organizer/stats',
                    {
                        headers:{
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    'http://localhost:5000/api/queue/organizer/stats',
                    {
                        headers:{
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )

            ])


            setStats(
                tournamentRes.data
            )

            setQuickPlayStats(
                quickPlayRes.data
            )

            setError('')


        } catch (err) {

            console.log(
                'ORGANIZER DASHBOARD ERROR:',
                err.response?.data ||
                err.message
            )

            setError(
                err.response?.data?.message ||
                'Failed to load organizer dashboard.'
            )

        } finally {

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
                        onClick={fetchStats}
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

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                <div>

                    <h1 className="text-3xl font-semibold text-[#34C759]">
                        Organizer Dashboard
                    </h1>

                    <p className="text-gray-500">
                        Manage your tournaments and monitor participant activity.
                    </p>

                </div>


                <div className="flex flex-col sm:flex-row gap-3">

                    <Link
                        to="/create-tournament"
                        className="inline-flex items-center justify-center gap-2 bg-[#34C759] hover:bg-[#2fb350] text-white px-5 py-3 rounded-xl font-semibold transition"
                    >

                        <FaPlus />

                        Create Tournament

                    </Link>


                    <Link
                        to="/create-queue"
                        className="inline-flex items-center justify-center gap-2 border border-[#34C759] text-[#34C759] hover:bg-green-50 px-5 py-3 rounded-xl font-semibold transition"
                    >

                        <FaPlus />

                        Create Quick Play

                    </Link>

                </div>

            </div>


            {/* ========================= */}
            {/* OVERVIEW */}
            {/* ========================= */}

            <div className="mb-10">

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                    {/* TOURNAMENT SUMMARY */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-6">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Tournaments
                                </p>

                                <h2 className="text-3xl font-bold text-gray-700 mt-1">
                                    {stats.createdTournaments || 0}
                                </h2>

                                <p className="text-xs text-gray-400 mt-1">
                                    Total created
                                </p>

                            </div>


                            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

                                <FaTrophy className="text-[#34C759] text-2xl"/>

                            </div>

                        </div>


                        <div className="grid grid-cols-3 gap-3">

                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Participants
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {stats.totalParticipants || 0}
                                </p>

                            </div>


                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Active
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {stats.activeTournaments || 0}
                                </p>

                            </div>


                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Finished
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {stats.finishedTournaments || 0}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* QUICK PLAY SUMMARY */}

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
                                    Total sessions
                                </p>

                            </div>


                            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

                                <FaUsers className="text-[#34C759] text-2xl"/>

                            </div>

                        </div>


                        <div className="grid grid-cols-3 gap-3">

                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Active
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.activeSessions || 0}
                                </p>

                            </div>


                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Queued
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.playersQueued || 0}
                                </p>

                            </div>


                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Matches Today
                                </p>

                                <p className="text-xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.matchesCompletedToday || 0}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>



            {/* ========================= */}
            {/* TOURNAMENT MANAGEMENT */}
            {/* ========================= */}

            <div className="mb-10">

                <div className="flex items-center justify-between mb-5">

                    <div>

                        <h2 className="text-2xl font-semibold text-gray-700">
                            Tournament Management
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Monitor tournament status, registrations, participants, and recent activity.
                        </p>

                    </div>


                    <Link
                        to="/my-tournaments"
                        className="text-sm text-[#34C759] font-semibold hover:underline"
                    >
                        View all
                    </Link>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">


                    {/* TOURNAMENT OVERVIEW */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <div className="flex justify-between items-center mb-5">

                            <h2 className="text-xl font-semibold text-gray-700">
                                Tournament Overview
                            </h2>

                        </div>


                        <div className="space-y-3">


                            <div className="flex justify-between items-center bg-[#F8F8F8] rounded-xl p-3">

                                <div className="flex items-center gap-3">

                                    <FaTrophy className="text-[#34C759]"/>

                                    <span className="text-gray-600">
                                        Open
                                    </span>

                                </div>

                                <span className="font-bold text-green-600">
                                    {stats.openTournaments || 0}
                                </span>

                            </div>


                            <div className="flex justify-between items-center bg-[#F8F8F8] rounded-xl p-3">

                                <div className="flex items-center gap-3">

                                    <FaLock className="text-orange-500"/>

                                    <span className="text-gray-600">
                                        Closed
                                    </span>

                                </div>

                                <span className="font-bold text-orange-500">
                                    {stats.closedTournaments || 0}
                                </span>

                            </div>


                            <div className="flex justify-between items-center bg-[#F8F8F8] rounded-xl p-3">

                                <div className="flex items-center gap-3">

                                    <FaRunning className="text-yellow-500"/>

                                    <span className="text-gray-600">
                                        Ongoing
                                    </span>

                                </div>

                                <span className="font-bold text-yellow-600">
                                    {stats.ongoingTournaments || 0}
                                </span>

                            </div>


                            <div className="flex justify-between items-center bg-[#F8F8F8] rounded-xl p-3">

                                <div className="flex items-center gap-3">

                                    <FaCheckCircle className="text-gray-500"/>

                                    <span className="text-gray-600">
                                        Finished
                                    </span>

                                </div>

                                <span className="font-bold text-gray-600">
                                    {stats.finishedTournaments || 0}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* UPCOMING TOURNAMENTS */}

                    <div className="xl:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <div className="flex justify-between items-center mb-5">

                            <h2 className="text-xl font-semibold text-gray-700">
                                Upcoming Tournaments
                            </h2>

                            <Link
                                to="/my-tournaments"
                                className="text-sm text-[#34C759] font-semibold hover:underline"
                            >
                                View all
                            </Link>

                        </div>


                        {!stats.upcomingTournaments?.length ? (

                            <p className="text-gray-500">
                                No upcoming tournaments.
                            </p>

                        ) : (

                            <div>

                                {stats.upcomingTournaments.map(t => (

                                    <Link
                                        key={t._id}
                                        to={`/tournament/${t._id}`}
                                        className="flex justify-between items-center py-3 px-2 border-b border-[#F3F4F6] last:border-none hover:bg-[#F8F8F8] rounded-lg transition"
                                    >

                                        <div>

                                            <p className="font-semibold text-gray-700">
                                                {t.title}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">

                                                <FaCalendarAlt className="text-xs"/>

                                                {new Date(
                                                    t.startDate
                                                ).toLocaleDateString()}

                                            </div>

                                        </div>


                                        <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-semibold">
                                            Upcoming
                                        </span>

                                    </Link>

                                ))}

                            </div>

                        )}

                    </div>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">


                    {/* PARTICIPANT PROGRESS */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <h2 className="text-xl font-semibold text-gray-700 mb-6">
                            Participant Progress
                        </h2>


                        {!stats.participantProgress?.length ? (

                            <p className="text-gray-500">
                                No tournaments available.
                            </p>

                        ) : (

                            stats.participantProgress.map(t => {

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
                                        className="block mb-6 last:mb-0 hover:bg-[#F8F8F8] rounded-xl p-2 transition"
                                    >

                                        <div className="flex justify-between mb-2">

                                            <div>

                                                <span className="font-semibold text-gray-700">
                                                    {t.title}
                                                </span>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {Math.round(percent)}% full
                                                </p>

                                            </div>


                                            <span className="text-sm text-gray-500">
                                                {t.players}/{t.maxPlayers}
                                            </span>

                                        </div>


                                        <div className="bg-gray-200 rounded-full h-3">

                                            <div
                                                className="bg-[#34C759] rounded-full h-3 transition-all duration-300"
                                                style={{
                                                    width:`${percent}%`
                                                }}
                                            />

                                        </div>

                                    </Link>

                                )

                            })

                        )}

                    </div>


                    {/* REGISTRATION CLOSING */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <h2 className="text-xl font-semibold text-gray-700 mb-6">
                            Registration Closing Soon
                        </h2>


                        {!stats.closingSoon?.length ? (

                            <p className="text-gray-500">
                                Nothing closing soon.
                            </p>

                        ) : (

                            stats.closingSoon.map(t => (

                                <Link
                                    key={t._id}
                                    to={`/tournament/${t._id}`}
                                    className="flex justify-between items-center py-3 px-2 border-b border-[#F3F4F6] last:border-none hover:bg-[#F8F8F8] rounded-lg transition"
                                >

                                    <div>

                                        <p className="font-semibold text-gray-700">
                                            {t.title}
                                        </p>

                                        {t.registrationDeadline && (

                                            <p className="text-xs text-gray-400 mt-1">

                                                Closes{' '}

                                                {new Date(
                                                    t.registrationDeadline
                                                ).toLocaleDateString()}

                                            </p>

                                        )}

                                    </div>


                                    <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">

                                        <FaClock/>

                                        {t.daysLeft <= 0
                                            ? 'Today'
                                            : `${t.daysLeft} day${t.daysLeft === 1 ? '' : 's'}`
                                        }

                                    </span>

                                </Link>

                            ))

                        )}

                    </div>

                </div>


                {/* RECENT TOURNAMENTS */}

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-gray-700">
                            Recent Tournaments
                        </h2>

                        <Link
                            to="/my-tournaments"
                            className="text-sm text-[#34C759] font-semibold hover:underline"
                        >
                            View all
                        </Link>

                    </div>


                    {!stats.recentTournaments?.length ? (

                        <p className="text-gray-500">
                            No tournaments created yet.
                        </p>

                    ) : (

                        stats.recentTournaments.map(t => (

                            <Link
                                key={t._id}
                                to={`/tournament/${t._id}`}
                                className="flex items-center justify-between py-4 px-2 border-b border-[#F3F4F6] last:border-none hover:bg-[#F8F8F8] rounded-lg transition"
                            >

                                <div>

                                    <p className="font-semibold text-gray-700">
                                        {t.title}
                                    </p>


                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">

                                        {t.location && (

                                            <span className="flex items-center gap-1">

                                                <FaMapMarkerAlt className="text-xs"/>

                                                {t.location}

                                            </span>

                                        )}


                                        {t.startDate && (

                                            <span className="flex items-center gap-1">

                                                <FaCalendarAlt className="text-xs"/>

                                                {new Date(
                                                    t.startDate
                                                ).toLocaleDateString()}

                                            </span>

                                        )}

                                    </div>

                                </div>


                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        t.status === 'Open'
                                            ? 'bg-green-100 text-green-600'
                                            : t.status === 'Closed'
                                            ? 'bg-orange-100 text-orange-600'
                                            : t.status === 'Ongoing'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {t.status}
                                </span>

                            </Link>

                        ))

                    )}

                </div>

            </div>



            {/* ========================= */}
            {/* QUICK PLAY MANAGEMENT */}
            {/* ========================= */}

            <div className="mb-10">

                <div className="flex items-center justify-between mb-5">

                    <div>

                        <h2 className="text-2xl font-semibold text-gray-700">
                            Quick Play Management
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Monitor live queue activity and recent Quick Play sessions.
                        </p>

                    </div>


                    <Link
                        to="/quick-play"
                        className="text-sm text-[#34C759] font-semibold hover:underline"
                    >
                        View all
                    </Link>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


                    {/* QUICK PLAY SUMMARY */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-6">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Active Sessions
                                </p>

                                <h2 className="text-4xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.activeSessions || 0}
                                </h2>

                            </div>


                            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

                                <FaRunning className="text-[#34C759] text-2xl"/>

                            </div>

                        </div>


                        <div className="grid grid-cols-2 gap-4 mb-4">

                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Waiting Players
                                </p>

                                <p className="text-2xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.playersQueued || 0}
                                </p>

                            </div>


                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-xs text-gray-400">
                                    Matches Today
                                </p>

                                <p className="text-2xl font-bold text-gray-700 mt-1">
                                    {quickPlayStats.matchesCompletedToday || 0}
                                </p>

                            </div>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-4 mb-5">

                            <p className="text-xs text-gray-400">
                                Total Sessions
                            </p>

                            <p className="text-2xl font-bold text-gray-700 mt-1">
                                {quickPlayStats.totalSessions || 0}
                            </p>

                        </div>


                        <Link
                            to="/quick-play"
                            className="w-full inline-flex items-center justify-center bg-[#34C759] hover:bg-[#2fb350] text-white px-5 py-3 rounded-xl font-semibold transition"
                        >
                            Manage Quick Play
                        </Link>

                    </div>


                    {/* RECENT QUICK PLAY */}

                    <div className="xl:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <div className="flex justify-between items-center mb-5">

                            <h2 className="text-xl font-semibold text-gray-700">
                                Recent Quick Play Sessions
                            </h2>

                            <Link
                                to="/quick-play"
                                className="text-sm text-[#34C759] font-semibold hover:underline"
                            >
                                View all
                            </Link>

                        </div>


                        {!quickPlayStats.recentSessions?.length ? (

                            <p className="text-gray-500">
                                No Quick Play sessions created yet.
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
                                                        {session.numberOfCourts}{' '}

                                                        {session.numberOfCourts === 1
                                                            ? 'Court'
                                                            : 'Courts'
                                                        }
                                                    </span>


                                                    <span>
                                                        {session.waitingPlayers?.length || 0}{' '}
                                                        waiting
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
            {/* OTHER */}
            {/* ========================= */}

            <div>

                <div className="mb-5">

                    <h2 className="text-2xl font-semibold text-gray-700">
                        Other
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Quick access to common actions and recent notifications.
                    </p>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                    {/* QUICK ACTIONS */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <h2 className="text-xl font-semibold text-gray-700 mb-5">
                            Quick Actions
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">


    {/* CREATE TOURNAMENT */}

    <Link
        to="/create-tournament"
        className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
    >

        <FaPlus className="text-2xl mb-3"/>

        <p className="font-semibold">
            Create Tournament
        </p>

    </Link>


    {/* CREATE QUICK PLAY */}

    <Link
        to="/create-queue"
        className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
    >

        <FaPlus className="text-2xl mb-3"/>

        <p className="font-semibold">
            Create Quick Play
        </p>

    </Link>


    {/* MY TOURNAMENTS */}

    <Link
        to="/my-tournaments"
        className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
    >

        <FaList className="text-2xl mb-3"/>

        <p className="font-semibold">
            My Tournaments
        </p>

    </Link>


    {/* TOURNAMENTS */}

    <Link
        to="/tournaments"
        className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
    >

        <FaTrophy className="text-2xl mb-3"/>

        <p className="font-semibold">
            Tournaments
        </p>

    </Link>


    {/* QUICK PLAY */}

    <Link
        to="/quick-play"
        className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
    >

        <FaUsers className="text-2xl mb-3"/>

        <p className="font-semibold">
            Quick Play
        </p>

    </Link>


    {/* NOTIFICATIONS */}

    <Link
        to="/notifications"
        className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
    >

        <FaClipboardList className="text-2xl mb-3"/>

        <p className="font-semibold">
            Notifications
        </p>

    </Link>


</div>

                    </div>


                    {/* RECENT NOTIFICATIONS */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                        <div className="flex justify-between items-center mb-5">

                            <h2 className="text-xl font-semibold text-gray-700">
                                Recent Notifications
                            </h2>

                            <Link
                                to="/notifications"
                                className="text-sm text-[#34C759] font-semibold hover:underline"
                            >
                                View all
                            </Link>

                        </div>


                        {!stats.recentRegistrations?.length ? (

                            <p className="text-gray-500">
                                No recent notifications.
                            </p>

                        ) : (

                            stats.recentRegistrations.map(notification => (

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

                                    <p className="font-semibold text-gray-700">
                                        {notification.message}
                                    </p>


                                    {notification.tournamentTitle && (

                                        <p className="text-sm text-gray-500 mt-1">

                                            Tournament:{' '}

                                            <span className="font-medium text-gray-700">
                                                {notification.tournamentTitle}
                                            </span>

                                        </p>

                                    )}


                                    <p className="text-xs text-gray-400 mt-2">

                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString()}

                                    </p>

                                </Link>

                            ))

                        )}

                    </div>

                </div>

            </div>


        </div>

    )

}


export default OrganizerDashboard