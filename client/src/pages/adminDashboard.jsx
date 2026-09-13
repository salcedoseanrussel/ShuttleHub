import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

import {
    FaUsers,
    FaUser,
    FaUserTie,
    FaUserShield,
    FaTrophy,
    FaPlayCircle,
    FaClipboardList,
    FaCog,
    FaBan,
    FaClock,
    FaLock,
    FaFlagCheckered,
    FaDatabase,
    FaServer
} from 'react-icons/fa'

function AdminDashboard(){

    const navigate = useNavigate()

    const [stats, setStats] = useState(null)

    const [quickPlayStats, setQuickPlayStats] =
        useState(null)

    const [loading, setLoading] = useState(true)


    // ==========================
    // LOAD DASHBOARD
    // ==========================

    useEffect(() => {

        fetchStats()

        // auto refresh every 30 seconds
        const interval = setInterval(
            fetchStats,
            30000
        )

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
                adminRes,
                quickPlayRes
            ] = await Promise.all([

                axios.get(
                    'http://localhost:5000/api/admin/stats',
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    'http://localhost:5000/api/queue'
                )

            ])


            setStats(
                adminRes.data
            )


            const sessions =
                Array.isArray(quickPlayRes.data)
                    ? quickPlayRes.data
                    : []


            const activeSessions =
                sessions.filter(
                    session =>
                        session.status === 'Open' ||
                        session.status === 'Closed'
                )


            const playersQueued =
                activeSessions.reduce(
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

                activeSessions:
                    activeSessions.length,

                playersQueued,

                recentSessions
            })

        } catch (err) {

            console.log(
                'ADMIN DASHBOARD ERROR:',
                err.response?.data ||
                err.message
            )

        } finally {

            setLoading(false)

        }

    }


    // ==========================
    // LOADING
    // ==========================

    if (
        loading ||
        !stats ||
        !quickPlayStats
    ) {

        return (

            <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">

                <p className="text-gray-500">
                    Loading dashboard...
                </p>

            </div>

        )

    }


    return (

        <div className="min-h-screen bg-[#F8F8F8] p-8">


            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="mb-8">

                <h1 className="text-3xl font-semibold text-[#34C759]">
                    Admin Dashboard
                </h1>

                <p className="text-gray-500">
                    Manage users, tournaments and monitor the platform.
                </p>

            </div>


            {/* ========================= */}
            {/* TOP USER STATS */}
            {/* ========================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">


                {/* TOTAL USERS */}

                <div
                    onClick={() =>
                        navigate('/admin/users')
                    }
                    className="cursor-pointer bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#34C759] transition"
                >

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-gray-500 text-sm">
                                Total Users
                            </p>

                            <h2 className="text-3xl font-bold text-gray-700 mt-2">
                                {stats.totalUsers}
                            </h2>

                        </div>

                        <div className="w-14 h-14 rounded-xl bg-[#34C759]/10 flex items-center justify-center">

                            <FaUsers className="text-[#34C759] text-2xl"/>

                        </div>

                    </div>

                </div>


                {/* PLAYERS */}

                <div
                    onClick={() =>
                        navigate(
                            '/admin/users?filter=Player'
                        )
                    }
                    className="cursor-pointer bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#34C759] transition"
                >

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-gray-500 text-sm">
                                Players
                            </p>

                            <h2 className="text-3xl font-bold text-gray-700 mt-2">
                                {stats.players}
                            </h2>

                        </div>

                        <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">

                            <FaUser className="text-green-600 text-2xl"/>

                        </div>

                    </div>

                </div>


                {/* ORGANIZERS */}

                <div
                    onClick={() =>
                        navigate(
                            '/admin/users?filter=Organizer'
                        )
                    }
                    className="cursor-pointer bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#34C759] transition"
                >

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-gray-500 text-sm">
                                Organizers
                            </p>

                            <h2 className="text-3xl font-bold text-gray-700 mt-2">
                                {stats.organizers}
                            </h2>

                        </div>

                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">

                            <FaUserTie className="text-blue-600 text-2xl"/>

                        </div>

                    </div>

                </div>


                {/* ADMINS */}

                <div
                    onClick={() =>
                        navigate(
                            '/admin/users?filter=Admin'
                        )
                    }
                    className="cursor-pointer bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#34C759] transition"
                >

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-gray-500 text-sm">
                                Admins
                            </p>

                            <h2 className="text-3xl font-bold text-gray-700 mt-2">
                                {stats.admins}
                            </h2>

                        </div>

                        <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">

                            <FaUserShield className="text-red-600 text-2xl"/>

                        </div>

                    </div>

                </div>


                {/* RESTRICTED */}

                <div
                    onClick={() =>
                        navigate(
                            '/admin/users?filter=Banned'
                        )
                    }
                    className="cursor-pointer bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-red-400 transition"
                >

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-gray-500 text-sm">
                                Restricted
                            </p>

                            <h2 className="text-3xl font-bold text-gray-700 mt-2">
                                {stats.restrictedUsers}
                            </h2>

                        </div>

                        <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">

                            <FaBan className="text-red-600 text-2xl"/>

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* MAIN GRID */}
            {/* ========================= */}

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">


                {/* QUICK ACTIONS */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <h2 className="text-xl font-semibold text-gray-700 mb-5">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-2 gap-4">


                        <Link
                            to="/admin/users"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaUsers className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Users
                            </p>

                        </Link>


                        <Link
                            to="/tournaments"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaTrophy className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Tournaments
                            </p>

                        </Link>


                        <Link
                            to="/quick-play"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaPlayCircle className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Quick Play
                            </p>

                        </Link>


                        <Link
                            to="/notifications"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaClipboardList className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Notifications
                            </p>

                        </Link>


                        <Link
                            to="/profile"
                            className="border border-[#E5E7EB] rounded-xl p-5 text-gray-700 hover:bg-[#34C759] hover:text-white transition"
                        >

                            <FaCog className="text-2xl mb-3"/>

                            <p className="font-semibold">
                                Profile
                            </p>

                        </Link>

                    </div>

                </div>


                {/* ========================= */}
                {/* TOURNAMENT OVERVIEW */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-gray-700">
                            Tournament Overview
                        </h2>

                        <Link
                            to="/tournaments"
                            className="text-sm font-semibold text-[#34C759] hover:underline"
                        >
                            View all
                        </Link>

                    </div>

                    <div className="space-y-3">


                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#F8F8F8]">

                            <span className="text-gray-600">
                                Total
                            </span>

                            <span className="font-bold text-[#34C759]">
                                {stats.totalTournaments}
                            </span>

                        </div>


                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#F8F8F8]">

                            <span className="text-gray-600">
                                Open
                            </span>

                            <span className="font-bold text-green-600">
                                {stats.openTournaments}
                            </span>

                        </div>


                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#F8F8F8]">

                            <span className="text-gray-600">
                                Closed
                            </span>

                            <span className="font-bold text-orange-500">
                                {stats.closedTournaments}
                            </span>

                        </div>


                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#F8F8F8]">

                            <span className="text-gray-600">
                                Ongoing
                            </span>

                            <span className="font-bold text-yellow-500">
                                {stats.ongoingTournaments}
                            </span>

                        </div>


                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#F8F8F8]">

                            <span className="text-gray-600">
                                Finished
                            </span>

                            <span className="font-bold text-gray-600">
                                {stats.finishedTournaments}
                            </span>

                        </div>

                    </div>

                </div>


                {/* ========================= */}
                {/* QUICK PLAY OVERVIEW */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-gray-700">
                            Quick Play Overview
                        </h2>

                        <Link
                            to="/quick-play"
                            className="text-sm font-semibold text-[#34C759] hover:underline"
                        >
                            View all
                        </Link>

                    </div>


                    <div className="space-y-3">


                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#F8F8F8]">

                            <span className="text-gray-600">
                                Total Sessions
                            </span>

                            <span className="font-bold text-[#34C759]">
                                {quickPlayStats.totalSessions || 0}
                            </span>

                        </div>


                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#F8F8F8]">

                            <span className="text-gray-600">
                                Active Sessions
                            </span>

                            <span className="font-bold text-green-600">
                                {quickPlayStats.activeSessions || 0}
                            </span>

                        </div>


                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#F8F8F8]">

                            <span className="text-gray-600">
                                Players Queued
                            </span>

                            <span className="font-bold text-yellow-600">
                                {quickPlayStats.playersQueued || 0}
                            </span>

                        </div>

                    </div>


                    <Link
                        to="/quick-play"
                        className="mt-5 w-full inline-flex items-center justify-center border border-[#34C759] text-[#34C759] hover:bg-green-50 px-4 py-2.5 rounded-xl font-semibold transition"
                    >
                        Browse Quick Play
                    </Link>

                </div>


                {/* ========================= */}
                {/* SYSTEM STATUS */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <h2 className="text-xl font-semibold text-gray-700 mb-5">
                        System Status
                    </h2>


                    <div className="space-y-4">


                        {/* API */}

                        <div className="flex items-center justify-between bg-[#F8F8F8] rounded-xl p-4">

                            <div className="flex items-center gap-3">

                                <FaServer className="text-gray-500"/>

                                <span className="text-gray-600">
                                    Server API
                                </span>

                            </div>

                            <span
                                className={`text-sm font-semibold ${
                                    stats.systemStatus?.api
                                        ? 'text-[#34C759]'
                                        : 'text-red-500'
                                }`}
                            >

                                {stats.systemStatus?.api
                                    ? 'Operational'
                                    : 'Offline'}

                            </span>

                        </div>


                        {/* DATABASE */}

                        <div className="flex items-center justify-between bg-[#F8F8F8] rounded-xl p-4">

                            <div className="flex items-center gap-3">

                                <FaDatabase className="text-gray-500"/>

                                <span className="text-gray-600">
                                    Database
                                </span>

                            </div>

                            <span
                                className={`text-sm font-semibold ${
                                    stats.systemStatus?.database
                                        ? 'text-[#34C759]'
                                        : 'text-red-500'
                                }`}
                            >

                                {stats.systemStatus?.database
                                    ? 'Connected'
                                    : 'Disconnected'}

                            </span>

                        </div>


                        {/* GENERAL */}

                        <div className="border-2 border-dashed border-[#34C759] rounded-xl p-5 text-center">

                            <FaPlayCircle className="mx-auto text-4xl text-[#34C759] mb-3"/>

                            <p className="text-gray-600 font-medium">

                                {stats.systemStatus?.database
                                    ? 'ShuttleHub is running normally.'
                                    : 'ShuttleHub requires attention.'}

                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* ACTIVITY GRID */}
            {/* ========================= */}

            <div className="grid xl:grid-cols-3 gap-6">


                {/* ========================= */}
                {/* RECENT USERS */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-gray-700">
                            Recent Users
                        </h2>

                        <Link
                            to="/admin/users"
                            className="text-sm font-semibold text-[#34C759] hover:underline"
                        >
                            View all
                        </Link>

                    </div>


                    {stats.recentUsers?.length > 0 ? (

                        <div>

                            {stats.recentUsers.map(
                                user => (

                                    <div
                                        key={user._id}
                                        onClick={() =>
                                            navigate(
                                                `/admin/users`
                                            )
                                        }
                                        className="cursor-pointer flex items-center justify-between py-4 border-b border-[#F3F4F6] last:border-none"
                                    >

                                        <div className="flex items-center gap-4">

                                            <div
                                                className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold ${
                                                    user.role === 'Organizer'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : user.role === 'Admin'
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-green-100 text-green-600'
                                                }`}
                                            >
                                                {user.firstName
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>

                                                <p className="font-semibold text-gray-700">

                                                    {user.firstName}{' '}
                                                    {user.lastName}

                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    @{user.username}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="text-right">

                                            <p
                                                className={`text-sm font-semibold ${
                                                    user.isBanned
                                                        ? 'text-red-500'
                                                        : user.role === 'Organizer'
                                                        ? 'text-blue-600'
                                                        : user.role === 'Admin'
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }`}
                                            >

                                                {user.isBanned
                                                    ? 'Restricted'
                                                    : user.role}

                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">

                                                {new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()}

                                            </p>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="text-gray-500">
                            No users found.
                        </p>

                    )}

                </div>


                {/* ========================= */}
                {/* RECENT TOURNAMENTS */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-gray-700">
                            Recent Tournaments
                        </h2>

                        <Link
                            to="/tournaments"
                            className="text-sm font-semibold text-[#34C759] hover:underline"
                        >
                            View all
                        </Link>

                    </div>


                    {stats.recentTournaments?.length > 0 ? (

                        <div>

                            {stats.recentTournaments.map(
                                tournament => (

                                    <div
                                        key={tournament._id}
                                        onClick={() =>
                                            navigate(
                                                `/tournament/${tournament._id}`
                                            )
                                        }
                                        className="cursor-pointer flex items-center justify-between py-4 border-b border-[#F3F4F6] last:border-none"
                                    >

                                        <div>

                                            <p className="font-semibold text-gray-700">
                                                {tournament.title}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">

                                                {tournament.organizer?.username
                                                    ? `Organizer: ${tournament.organizer.username}`
                                                    : 'Unknown organizer'}

                                            </p>

                                        </div>


                                        <div className="text-right">

                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    tournament.status === 'Open'
                                                        ? 'bg-green-100 text-green-600'
                                                        : tournament.status === 'Closed'
                                                        ? 'bg-orange-100 text-orange-600'
                                                        : tournament.status === 'Ongoing'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {tournament.status}
                                            </span>

                                            <p className="text-xs text-gray-400 mt-2">

                                                {new Date(
                                                    tournament.createdAt
                                                ).toLocaleDateString()}

                                            </p>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="text-gray-500">
                            No tournaments found.
                        </p>

                    )}

                </div>


                {/* ========================= */}
                {/* RECENT QUICK PLAY */}
                {/* ========================= */}

                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-gray-700">
                            Recent Quick Play
                        </h2>

                        <Link
                            to="/quick-play"
                            className="text-sm font-semibold text-[#34C759] hover:underline"
                        >
                            View all
                        </Link>

                    </div>


                    {quickPlayStats.recentSessions?.length > 0 ? (

                        <div>

                            {quickPlayStats.recentSessions.map(
                                session => (

                                    <div
                                        key={session._id}
                                        onClick={() =>
                                            navigate(
                                                `/quick-play/${session._id}`
                                            )
                                        }
                                        className="cursor-pointer flex items-center justify-between gap-4 py-4 border-b border-[#F3F4F6] last:border-none"
                                    >

                                        <div className="min-w-0">

                                            <p className="font-semibold text-gray-700 truncate">
                                                {session.name}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {session.gameType} · {session.waitingPlayers?.length || 0} waiting
                                            </p>

                                        </div>


                                        <span
                                            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                                                session.status === 'Open'
                                                    ? 'bg-green-100 text-green-600'
                                                    : session.status === 'Closed'
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {session.status}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="text-gray-500">
                            No Quick Play sessions found.
                        </p>

                    )}

                </div>

            </div>

        </div>

    )

}

export default AdminDashboard