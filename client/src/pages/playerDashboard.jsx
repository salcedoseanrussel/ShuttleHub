import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

import {
    FaArrowRight,
    FaBell,
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaRunning,
    FaSearch,
    FaTrophy,
    FaUser,
    FaUserTie,
    FaUsers
} from 'react-icons/fa'


const API_BASE_URL = 'http://localhost:5000'


function PlayerDashboard(){

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    const [stats, setStats] = useState(null)

    const [quickPlayStats, setQuickPlayStats] =
        useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    useEffect(() => {

        fetchDashboard()

        const interval = setInterval(() => {
            fetchDashboard()
        }, 30000)

        return () => clearInterval(interval)

    }, [])


    const fetchDashboard = async () => {

        try{

            const token =
                localStorage.getItem('token')

            const [
                tournamentRes,
                quickPlayRes
            ] = await Promise.all([

                axios.get(
                    `${API_BASE_URL}/api/tournaments/player/stats`,
                    {
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    `${API_BASE_URL}/api/queue`
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


    const formatTime = value => {

        if(!value) return ''

        return new Date(value).toLocaleTimeString(
            [],
            {
                hour:'2-digit',
                minute:'2-digit'
            }
        )

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


    if(loading){

        return(

            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">

                <div className="bg-white border border-slate-200 rounded-2xl px-7 py-6 shadow-sm text-center">

                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>

                    <p className="text-sm font-medium text-slate-600">
                        Loading player dashboard...
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
                        onClick={fetchDashboard}
                        className="cursor-pointer mt-5 bg-[#34C759] hover:bg-[#2FB350] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        )

    }


    return(

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


                {/* HEADER */}

                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">

                    <div>

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                            <span className="w-6 h-px bg-[#34C759]"/>
                            Player workspace
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                            Welcome back{user?.username ? `, ${user.username}` : ''}
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                            Track your tournaments, find Quick Play sessions, and stay updated with your latest activity.
                        </p>

                    </div>


                    <div className="flex flex-col sm:flex-row gap-3">

                        <Link
                            to="/tournaments"
                            className="inline-flex items-center justify-center gap-2 bg-[#34C759] hover:bg-[#2FB350] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                        >
                            <FaSearch className="text-xs"/>
                            Browse Tournaments
                        </Link>

                        <Link
                            to="/quick-play"
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                        >
                            <FaRunning className="text-xs text-[#34C759]"/>
                            Quick Play
                        </Link>

                    </div>

                </div>


                {/* PRIMARY METRICS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">


                    <Link
                        to="/my-tournaments"
                        className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-200 transition"
                    >

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Joined Tournaments
                                </p>

                                <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                    {stats.joinedCount || 0}
                                </p>

                            </div>

                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#34C759] flex items-center justify-center">
                                <FaTrophy/>
                            </div>

                        </div>

                        <p className="text-xs text-slate-500 mt-5">
                            View all tournaments you joined
                        </p>

                    </Link>


                    <Link
                        to="/tournaments?filter=upcoming"
                        className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-200 transition"
                    >

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Upcoming
                                </p>

                                <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                    {stats.upcomingCount || 0}
                                </p>

                            </div>

                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FaCalendarAlt/>
                            </div>

                        </div>

                        <p className="text-xs text-slate-500 mt-5">
                            Scheduled tournaments ahead
                        </p>

                    </Link>


                    <Link
                        to="/quick-play"
                        className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-violet-200 transition"
                    >

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Open Quick Play
                                </p>

                                <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                    {quickPlayStats.openSessions || 0}
                                </p>

                            </div>

                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                <FaRunning/>
                            </div>

                        </div>

                        <p className="text-xs text-slate-500 mt-5">
                            Sessions currently accepting players
                        </p>

                    </Link>


                    <Link
                        to="/quick-play"
                        className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-amber-200 transition"
                    >

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Players Waiting
                                </p>

                                <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                                    {quickPlayStats.totalWaiting || 0}
                                </p>

                            </div>

                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <FaUsers/>
                            </div>

                        </div>

                        <p className="text-xs text-slate-500 mt-5">
                            Across all open Quick Play sessions
                        </p>

                    </Link>

                </div>


                {/* MAIN AREA */}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-7">


                    {/* NEXT TOURNAMENT */}

                    <section className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Next Tournament
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Your nearest upcoming tournament.
                                </p>

                            </div>

                            {stats.nextTournament && (

                                <Link
                                    to={`/tournament/${stats.nextTournament._id}`}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                                >
                                    View details
                                    <FaArrowRight className="text-xs"/>
                                </Link>

                            )}

                        </div>


                        {stats.nextTournament ? (

                            <Link
                                to={`/tournament/${stats.nextTournament._id}`}
                                className="block p-5 sm:p-6 hover:bg-slate-50/60 transition"
                            >

                                <div className="flex flex-col md:flex-row md:items-start gap-5">

                                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-50 text-[#34C759] flex items-center justify-center">
                                        <FaCalendarAlt className="text-xl"/>
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <h3 className="text-xl font-semibold text-slate-950">
                                            {stats.nextTournament.title}
                                        </h3>

                                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-5 text-sm text-slate-600">

                                            <div className="flex items-center gap-2.5">
                                                <FaCalendarAlt className="text-slate-400"/>
                                                <span>{formatDate(stats.nextTournament.startDate)}</span>
                                            </div>

                                            <div className="flex items-center gap-2.5">
                                                <FaClock className="text-slate-400"/>
                                                <span>{formatTime(stats.nextTournament.startDate)}</span>
                                            </div>

                                            {stats.nextTournament.location && (

                                                <div className="flex items-center gap-2.5">
                                                    <FaMapMarkerAlt className="text-slate-400"/>
                                                    <span>{stats.nextTournament.location}</span>
                                                </div>

                                            )}

                                            {stats.nextTournament.organizer?.username && (

                                                <div className="flex items-center gap-2.5">
                                                    <FaUserTie className="text-slate-400"/>
                                                    <span>{stats.nextTournament.organizer.username}</span>
                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </Link>

                        ) : (

                            <div className="px-6 py-14 text-center">

                                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <FaCalendarAlt/>
                                </div>

                                <p className="font-medium text-slate-700">
                                    No upcoming tournament
                                </p>

                                <p className="text-sm text-slate-500 mt-1">
                                    Browse available tournaments and join your next event.
                                </p>

                                <Link
                                    to="/tournaments"
                                    className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#2FAE4F]"
                                >
                                    Browse tournaments
                                    <FaArrowRight className="text-xs"/>
                                </Link>

                            </div>

                        )}

                    </section>


                    {/* QUICK ACTIONS */}

                    <section className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="mb-5">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Quick Actions
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Jump to your most-used pages.
                            </p>

                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            {[
                                {
                                    to:'/tournaments',
                                    icon:<FaSearch/>,
                                    title:'Browse Tournaments',
                                    text:'Find events to join',
                                    box:'bg-emerald-50 text-[#34C759]'
                                },
                                {
                                    to:'/my-tournaments',
                                    icon:<FaTrophy/>,
                                    title:'My Tournaments',
                                    text:'View joined events',
                                    box:'bg-blue-50 text-blue-600'
                                },
                                {
                                    to:'/quick-play',
                                    icon:<FaRunning/>,
                                    title:'Quick Play',
                                    text:'Join a queue',
                                    box:'bg-violet-50 text-violet-600'
                                },
                                {
                                    to:'/notifications',
                                    icon:<FaBell/>,
                                    title:'Notifications',
                                    text:'Check recent updates',
                                    box:'bg-amber-50 text-amber-600'
                                },
                                {
                                    to:'/profile',
                                    icon:<FaUser/>,
                                    title:'Profile',
                                    text:'Manage your account',
                                    box:'bg-slate-100 text-slate-600'
                                }
                            ].map(item => (

                                <Link
                                    key={item.title}
                                    to={item.to}
                                    className="group flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
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

                </div>


                {/* QUICK PLAY */}

                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-7">

                    <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100">

                        <div>

                            <h2 className="text-lg font-semibold text-slate-950">
                                Recent Quick Play
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Recently created sessions you can join.
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

                        <div className="px-6 py-14 text-center text-sm text-slate-500">
                            No Quick Play sessions available.
                        </div>

                    ) : (

                        <div className="divide-y divide-slate-100">

                            {quickPlayStats.recentSessions.map(session => (

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
                                                <span>{session.location}</span>
                                            )}

                                            <span>{session.gameType}</span>

                                            <span>
                                                {session.waitingPlayers?.length || 0} waiting
                                            </span>

                                        </div>

                                    </div>

                                    <span
                                        className={`w-fit shrink-0 border text-[11px] font-semibold px-2.5 py-1 rounded-full ${getSessionStatusClass(session.status)}`}
                                    >
                                        {session.status}
                                    </span>

                                </Link>

                            ))}

                        </div>

                    )}

                </section>


                {/* ACTIVITY */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">


                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Tournament Activity
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                A quick view of your tournament progress.
                            </p>

                        </div>


                        <div className="grid grid-cols-3 divide-x divide-slate-100">

                            <Link
                                to="/tournaments?filter=upcoming"
                                className="p-5 text-center hover:bg-slate-50 transition"
                            >
                                <p className="text-2xl font-bold text-slate-950">
                                    {stats.upcomingCount || 0}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Upcoming
                                </p>
                            </Link>

                            <Link
                                to="/tournaments?filter=live"
                                className="p-5 text-center hover:bg-slate-50 transition"
                            >
                                <p className="text-2xl font-bold text-slate-950">
                                    {stats.liveCount || 0}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Live
                                </p>
                            </Link>

                            <Link
                                to="/tournaments?filter=finished"
                                className="p-5 text-center hover:bg-slate-50 transition"
                            >
                                <p className="text-2xl font-bold text-slate-950">
                                    {stats.finishedCount || 0}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Finished
                                </p>
                            </Link>

                        </div>

                    </section>


                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Recent Notifications
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Your latest account and tournament updates.
                                </p>

                            </div>

                            <Link
                                to="/notifications"
                                className="text-sm font-semibold text-[#2FAE4F] hover:text-[#258E41]"
                            >
                                View all
                            </Link>

                        </div>


                        {!stats.notifications?.length ? (

                            <div className="px-6 py-12 text-center">

                                <FaBell className="text-slate-300 text-xl mx-auto mb-3"/>

                                <p className="text-sm text-slate-500">
                                    No notifications yet.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {stats.notifications.slice(0, 5).map(notification => (

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

                                            <div className="w-9 h-9 shrink-0 rounded-full bg-emerald-50 text-[#34C759] flex items-center justify-center">
                                                <FaBell className="text-xs"/>
                                            </div>

                                            <div className="min-w-0">

                                                <p className="text-sm font-medium text-slate-800 leading-5">
                                                    {notification.message}
                                                </p>

                                                {notification.tournamentTitle && (

                                                    <p className="text-xs text-slate-500 mt-1 truncate">
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


export default PlayerDashboard
