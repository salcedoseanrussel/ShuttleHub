import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

import {
    FaArrowRight,
    FaBan,
    FaClipboardList,
    FaCog,
    FaDatabase,
    FaPlayCircle,
    FaServer,
    FaTrophy,
    FaUser,
    FaUserShield,
    FaUserTie,
    FaUsers
} from 'react-icons/fa'


const API_BASE_URL = 'http://localhost:5000'


function AdminDashboard(){

    const navigate = useNavigate()

    const [stats, setStats] = useState(null)

    const [quickPlayStats, setQuickPlayStats] =
        useState(null)

    const [loading, setLoading] = useState(true)


    useEffect(() => {

        fetchStats()

        const interval = setInterval(
            fetchStats,
            30000
        )

        return () => clearInterval(interval)

    }, [])


    const fetchStats = async () => {

        try {

            const token =
                localStorage.getItem('token')

            const [
                adminRes,
                quickPlayRes
            ] = await Promise.all([

                axios.get(
                    `${API_BASE_URL}/api/admin/stats`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    `${API_BASE_URL}/api/queue`
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


    const getSessionStatusClass = status => {

        if(status === 'Open'){
            return 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }

        if(status === 'Closed'){
            return 'bg-orange-50 text-orange-700 border-orange-100'
        }

        return 'bg-slate-100 text-slate-600 border-slate-200'

    }


    if (
        loading ||
        !stats ||
        !quickPlayStats
    ) {

        return (

            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">

                <div className="bg-white border border-slate-200 rounded-2xl px-7 py-6 shadow-sm text-center">

                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>

                    <p className="text-sm font-medium text-slate-600">
                        Loading admin dashboard...
                    </p>

                </div>

            </div>

        )

    }


    const userCards = [
        {
            label:'Total Users',
            value:stats.totalUsers,
            icon:<FaUsers/>,
            iconClass:'bg-slate-100 text-slate-700',
            route:'/admin/users'
        },
        {
            label:'Players',
            value:stats.players,
            icon:<FaUser/>,
            iconClass:'bg-emerald-50 text-[#34C759]',
            route:'/admin/users?filter=Player'
        },
        {
            label:'Organizers',
            value:stats.organizers,
            icon:<FaUserTie/>,
            iconClass:'bg-blue-50 text-blue-600',
            route:'/admin/users?filter=Organizer'
        },
        {
            label:'Admins',
            value:stats.admins,
            icon:<FaUserShield/>,
            iconClass:'bg-violet-50 text-violet-600',
            route:'/admin/users?filter=Admin'
        },
        {
            label:'Restricted',
            value:stats.restrictedUsers,
            icon:<FaBan/>,
            iconClass:'bg-red-50 text-red-600',
            route:'/admin/users?filter=Banned'
        }
    ]


    return (

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


                {/* HEADER */}

                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">

                    <div>

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                            <span className="w-6 h-px bg-[#34C759]"/>
                            Administration
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                            Admin Dashboard
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                            Monitor users, tournaments, Quick Play activity, and the overall health of ShuttleHub.
                        </p>

                    </div>


                    <div className="flex flex-col sm:flex-row gap-3">

                        <Link
                            to="/admin/users"
                            className="inline-flex items-center justify-center gap-2 bg-[#34C759] hover:bg-[#2FB350] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                        >
                            <FaUsers className="text-xs"/>
                            Manage Users
                        </Link>

                        <Link
                            to="/tournaments"
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                        >
                            <FaTrophy className="text-xs text-[#34C759]"/>
                            View Tournaments
                        </Link>

                    </div>

                </div>


                {/* USER METRICS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-7">

                    {userCards.map(card => (

                        <button
                            key={card.label}
                            onClick={() => navigate(card.route)}
                            className="cursor-pointer text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition"
                        >

                            <div className="flex items-start justify-between gap-4">

                                <div>

                                    <p className="text-sm font-medium text-slate-500">
                                        {card.label}
                                    </p>

                                    <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                        {card.value || 0}
                                    </p>

                                </div>

                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconClass}`}>
                                    {card.icon}
                                </div>

                            </div>

                        </button>

                    ))}

                </div>


                {/* MAIN GRID */}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-7">


                    {/* TOURNAMENT OVERVIEW */}

                    <section className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="flex items-center justify-between gap-4 mb-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Tournament Overview
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Platform-wide tournament status.
                                </p>

                            </div>

                            <Link
                                to="/tournaments"
                                className="text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                            </Link>

                        </div>


                        <div className="space-y-3">

                            {[
                                ['Total', stats.totalTournaments, 'bg-slate-400'],
                                ['Open', stats.openTournaments, 'bg-[#34C759]'],
                                ['Closed', stats.closedTournaments, 'bg-orange-400'],
                                ['Ongoing', stats.ongoingTournaments, 'bg-amber-400'],
                                ['Finished', stats.finishedTournaments, 'bg-slate-500']
                            ].map(([label, value, dot]) => (

                                <div
                                    key={label}
                                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3.5"
                                >

                                    <div className="flex items-center gap-3">

                                        <span className={`w-2.5 h-2.5 rounded-full ${dot}`}/>

                                        <span className="text-sm font-medium text-slate-600">
                                            {label}
                                        </span>

                                    </div>

                                    <span className="text-base font-bold text-slate-900">
                                        {value || 0}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* QUICK PLAY OVERVIEW */}

                    <section className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="flex items-center justify-between gap-4 mb-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Quick Play Overview
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Current queue and session activity.
                                </p>

                            </div>

                            <Link
                                to="/quick-play"
                                className="text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                            </Link>

                        </div>


                        <div className="grid grid-cols-1 gap-3">

                            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4">

                                <p className="text-xs text-slate-500">
                                    Total Sessions
                                </p>

                                <p className="text-2xl font-bold text-slate-950 mt-1">
                                    {quickPlayStats.totalSessions || 0}
                                </p>

                            </div>


                            <div className="grid grid-cols-2 gap-3">

                                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-4">

                                    <p className="text-xs text-emerald-700">
                                        Active
                                    </p>

                                    <p className="text-2xl font-bold text-slate-950 mt-1">
                                        {quickPlayStats.activeSessions || 0}
                                    </p>

                                </div>

                                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-4">

                                    <p className="text-xs text-amber-700">
                                        Queued
                                    </p>

                                    <p className="text-2xl font-bold text-slate-950 mt-1">
                                        {quickPlayStats.playersQueued || 0}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* SYSTEM STATUS */}

                    <section className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="mb-5">

                            <h2 className="text-lg font-semibold text-slate-950">
                                System Status
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Backend and database availability.
                            </p>

                        </div>


                        <div className="space-y-3">

                            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-4">

                                <div className="flex items-center gap-3">
                                    <FaServer className="text-slate-400"/>
                                    <span className="text-sm font-medium text-slate-600">
                                        Server API
                                    </span>
                                </div>

                                <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        stats.systemStatus?.api
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-red-50 text-red-600 border border-red-100'
                                    }`}
                                >
                                    {stats.systemStatus?.api
                                        ? 'Operational'
                                        : 'Offline'
                                    }
                                </span>

                            </div>


                            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-4">

                                <div className="flex items-center gap-3">
                                    <FaDatabase className="text-slate-400"/>
                                    <span className="text-sm font-medium text-slate-600">
                                        Database
                                    </span>
                                </div>

                                <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        stats.systemStatus?.database
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-red-50 text-red-600 border border-red-100'
                                    }`}
                                >
                                    {stats.systemStatus?.database
                                        ? 'Connected'
                                        : 'Disconnected'
                                    }
                                </span>

                            </div>


                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">

                                <FaPlayCircle className="mx-auto text-[#34C759] text-xl mb-2"/>

                                <p className="text-sm font-medium text-slate-700">
                                    {stats.systemStatus?.database
                                        ? 'ShuttleHub is running normally.'
                                        : 'ShuttleHub requires attention.'
                                    }
                                </p>

                            </div>

                        </div>

                    </section>

                </div>


                {/* QUICK ACTIONS */}

                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-7">

                    <div className="mb-5">

                        <h2 className="text-lg font-semibold text-slate-950">
                            Quick Actions
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Common administrative tools.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">

                        {[
                            {
                                to:'/admin/users',
                                icon:<FaUsers/>,
                                title:'Users',
                                text:'Manage user accounts',
                                box:'bg-slate-100 text-slate-700'
                            },
                            {
                                to:'/tournaments',
                                icon:<FaTrophy/>,
                                title:'Tournaments',
                                text:'Review all events',
                                box:'bg-emerald-50 text-[#34C759]'
                            },
                            {
                                to:'/quick-play',
                                icon:<FaPlayCircle/>,
                                title:'Quick Play',
                                text:'View active sessions',
                                box:'bg-violet-50 text-violet-600'
                            },
                            {
                                to:'/notifications',
                                icon:<FaClipboardList/>,
                                title:'Notifications',
                                text:'Check platform alerts',
                                box:'bg-amber-50 text-amber-600'
                            },
                            {
                                to:'/profile',
                                icon:<FaCog/>,
                                title:'Profile',
                                text:'Manage admin account',
                                box:'bg-blue-50 text-blue-600'
                            }
                        ].map(item => (

                            <Link
                                key={item.title}
                                to={item.to}
                                className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                            >

                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${item.box}`}>
                                    {item.icon}
                                </div>

                                <div className="min-w-0">

                                    <p className="text-sm font-semibold text-slate-900">
                                        {item.title}
                                    </p>

                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {item.text}
                                    </p>

                                </div>

                            </Link>

                        ))}

                    </div>

                </section>


                {/* RECENT ACTIVITY */}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">


                    {/* RECENT USERS */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Recent Users
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Newly created accounts.
                                </p>

                            </div>

                            <Link
                                to="/admin/users"
                                className="text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                            </Link>

                        </div>


                        {stats.recentUsers?.length > 0 ? (

                            <div className="divide-y divide-slate-100">

                                {stats.recentUsers.slice(0, 5).map(user => (

                                    <button
                                        key={user._id}
                                        onClick={() => navigate('/admin/users')}
                                        className="cursor-pointer w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition"
                                    >

                                        <div className="flex items-center gap-3 min-w-0">

                                            <div
                                                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${
                                                    user.role === 'Organizer'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : user.role === 'Admin'
                                                        ? 'bg-violet-50 text-violet-600'
                                                        : 'bg-emerald-50 text-emerald-600'
                                                }`}
                                            >
                                                {user.firstName
                                                    ?.charAt(0)
                                                    .toUpperCase()
                                                }
                                            </div>

                                            <div className="min-w-0">

                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {user.firstName}{' '}
                                                    {user.lastName}
                                                </p>

                                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                                    @{user.username}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="shrink-0 text-right">

                                            <p
                                                className={`text-[11px] font-semibold ${
                                                    user.isBanned
                                                        ? 'text-red-600'
                                                        : 'text-slate-600'
                                                }`}
                                            >
                                                {user.isBanned
                                                    ? 'Restricted'
                                                    : user.role
                                                }
                                            </p>

                                            <p className="text-[11px] text-slate-400 mt-1">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </p>

                                        </div>

                                    </button>

                                ))}

                            </div>

                        ) : (

                            <div className="px-5 py-12 text-center text-sm text-slate-500">
                                No users found.
                            </div>

                        )}

                    </section>


                    {/* RECENT TOURNAMENTS */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Recent Tournaments
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Latest tournament activity.
                                </p>

                            </div>

                            <Link
                                to="/tournaments"
                                className="text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                            </Link>

                        </div>


                        {stats.recentTournaments?.length > 0 ? (

                            <div className="divide-y divide-slate-100">

                                {stats.recentTournaments.slice(0, 5).map(tournament => (

                                    <button
                                        key={tournament._id}
                                        onClick={() =>
                                            navigate(
                                                `/tournament/${tournament._id}`
                                            )
                                        }
                                        className="cursor-pointer w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition"
                                    >

                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {tournament.title}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1 truncate">
                                                {tournament.organizer?.username
                                                    ? `Organizer: ${tournament.organizer.username}`
                                                    : 'Unknown organizer'
                                                }
                                            </p>

                                        </div>


                                        <div className="shrink-0 text-right">

                                            <span
                                                className={`border text-[11px] font-semibold px-2.5 py-1 rounded-full ${getTournamentStatusClass(tournament.status)}`}
                                            >
                                                {tournament.status}
                                            </span>

                                            <p className="text-[11px] text-slate-400 mt-2">
                                                {new Date(tournament.createdAt).toLocaleDateString()}
                                            </p>

                                        </div>

                                    </button>

                                ))}

                            </div>

                        ) : (

                            <div className="px-5 py-12 text-center text-sm text-slate-500">
                                No tournaments found.
                            </div>

                        )}

                    </section>


                    {/* RECENT QUICK PLAY */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Recent Quick Play
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Latest queue sessions.
                                </p>

                            </div>

                            <Link
                                to="/quick-play"
                                className="text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                            </Link>

                        </div>


                        {quickPlayStats.recentSessions?.length > 0 ? (

                            <div className="divide-y divide-slate-100">

                                {quickPlayStats.recentSessions.map(session => (

                                    <button
                                        key={session._id}
                                        onClick={() =>
                                            navigate(
                                                `/quick-play/${session._id}`
                                            )
                                        }
                                        className="cursor-pointer w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition"
                                    >

                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {session.name}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                {session.gameType} · {session.waitingPlayers?.length || 0} waiting
                                            </p>

                                        </div>


                                        <span
                                            className={`shrink-0 border text-[11px] font-semibold px-2.5 py-1 rounded-full ${getSessionStatusClass(session.status)}`}
                                        >
                                            {session.status}
                                        </span>

                                    </button>

                                ))}

                            </div>

                        ) : (

                            <div className="px-5 py-12 text-center text-sm text-slate-500">
                                No Quick Play sessions found.
                            </div>

                        )}

                    </section>

                </div>


            </div>

        </div>

    )

}


export default AdminDashboard
