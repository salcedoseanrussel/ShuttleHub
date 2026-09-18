import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function QuickPlay() {

    const navigate = useNavigate()

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {

        fetchSessions()

    }, [])


    const fetchSessions = async () => {

        try {

            const res = await axios.get(
                'http://localhost:5000/api/queue'
            )

            setSessions(res.data)

        } catch (err) {

            console.error(
                'LOAD QUEUE SESSIONS ERROR:',
                err
            )

        } finally {

            setLoading(false)

        }

    }


    // =========================
    // SEPARATE SESSIONS
    // =========================

    const availableSessions =
        sessions.filter(
            session =>
                session.status !== 'Finished'
        )


    const finishedSessions =
        sessions.filter(
            session =>
                session.status === 'Finished'
        )


    if (loading) {

        return (

            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">

                <div className="bg-white border border-slate-200 rounded-2xl px-7 py-6 shadow-sm text-center">

                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>

                    <p className="text-sm font-medium text-slate-600">
                        Loading Quick Play sessions...
                    </p>

                </div>

            </div>

        )

    }


    return (

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


                {/* ========================= */}
                {/* HEADER */}
                {/* ========================= */}

                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">

                    <div>

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                            <span className="w-6 h-px bg-[#34C759]"/>
                            Quick Play
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                            Quick Play Sessions
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                            Browse active badminton sessions, check available courts, and view completed Quick Play results.
                        </p>

                    </div>


                    {user?.role === 'Organizer' && (

                        <button
                            onClick={() =>
                                navigate('/create-queue')
                            }
                            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm transition"
                        >
                            <span className="text-base leading-none">+</span>
                            Create Quick Play
                        </button>

                    )}

                </div>


                {/* ========================= */}
                {/* SUMMARY */}
                {/* ========================= */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <p className="text-sm font-medium text-slate-500">
                            Available Sessions
                        </p>

                        <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                            {availableSessions.length}
                        </p>

                    </div>


                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <p className="text-sm font-medium text-slate-500">
                            Finished Sessions
                        </p>

                        <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                            {finishedSessions.length}
                        </p>

                    </div>


                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <p className="text-sm font-medium text-slate-500">
                            Total Sessions
                        </p>

                        <p className="text-3xl font-bold tracking-tight text-slate-950 mt-2">
                            {sessions.length}
                        </p>

                    </div>

                </div>


                {/* ========================= */}
                {/* AVAILABLE SESSIONS */}
                {/* ========================= */}

                <section className="mb-9">

                    <div className="flex items-center justify-between gap-4 mb-4">

                        <div>

                            <h2 className="text-lg font-semibold text-slate-950">
                                Available Sessions
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Sessions that are currently open or still active.
                            </p>

                        </div>

                        <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                            {availableSessions.length}
                        </span>

                    </div>


                    {availableSessions.length > 0 ? (

                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">


                            {availableSessions.map(session => (

                                <Link
                                    key={session._id}
                                    to={`/quick-play/${session._id}`}
                                    className="block h-full"
                                >

                                    <article className="group h-full bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden">

                                        <div className="p-5 sm:p-6">


                                            <div className="flex items-start justify-between gap-4">

                                                <div className="min-w-0">

                                                    <h3 className="text-lg font-semibold text-slate-950 leading-snug group-hover:text-[#279A45] transition truncate">
                                                        {session.name}
                                                    </h3>

                                                    <p className="text-sm text-slate-500 mt-1.5 truncate">
                                                        {session.location}
                                                    </p>

                                                </div>


                                                <span
                                                    className={`shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                                                        session.status === 'Open'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-orange-50 text-orange-700 border-orange-100'
                                                    }`}
                                                >
                                                    {session.status}
                                                </span>

                                            </div>


                                            <div className="grid grid-cols-2 gap-3 mt-5">

                                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Game Type
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-800 mt-1">
                                                        {session.gameType}
                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Courts
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-800 mt-1">
                                                        {session.numberOfCourts}
                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">
                                                        Waiting
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-900 mt-1">
                                                        {session.waitingPlayers?.length || 0}
                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">
                                                        Organizer
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                                                        {session.organizer?.username || 'Unknown'}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60">

                                            <div className="flex items-center justify-between">

                                                <span className="text-sm font-medium text-slate-600">
                                                    View session
                                                </span>

                                                <span className="text-[#34C759] font-semibold group-hover:translate-x-0.5 transition-transform">
                                                    →
                                                </span>

                                            </div>

                                        </div>

                                    </article>

                                </Link>

                            ))}

                        </div>

                    ) : (

                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">🏸</span>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-800">
                                No Available Sessions
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                There are currently no active Quick Play sessions.
                            </p>

                        </div>

                    )}

                </section>


                {/* ========================= */}
                {/* FINISHED SESSIONS */}
                {/* ========================= */}

                <section>

                    <div className="flex items-center justify-between gap-4 mb-4">

                        <div>

                            <h2 className="text-lg font-semibold text-slate-950">
                                Finished Sessions
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Review completed sessions and their final activity.
                            </p>

                        </div>

                        <span className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                            {finishedSessions.length}
                        </span>

                    </div>


                    {finishedSessions.length > 0 ? (

                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">


                            {finishedSessions.map(session => (

                                <Link
                                    key={session._id}
                                    to={`/quick-play/${session._id}`}
                                    className="block h-full"
                                >

                                    <article className="group h-full bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition overflow-hidden">

                                        <div className="p-5 sm:p-6">


                                            <div className="flex items-start justify-between gap-4">

                                                <div className="min-w-0">

                                                    <h3 className="text-lg font-semibold text-slate-800 leading-snug truncate">
                                                        {session.name}
                                                    </h3>

                                                    <p className="text-sm text-slate-500 mt-1.5 truncate">
                                                        {session.location}
                                                    </p>

                                                </div>


                                                <span className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold">
                                                    Finished
                                                </span>

                                            </div>


                                            <div className="grid grid-cols-2 gap-3 mt-5">

                                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Game Type
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-700 mt-1">
                                                        {session.gameType}
                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Courts
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-700 mt-1">
                                                        {session.numberOfCourts}
                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Waiting
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-700 mt-1">
                                                        0
                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">

                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Organizer
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-700 mt-1 truncate">
                                                        {session.organizer?.username || 'Unknown'}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60">

                                            <div className="flex items-center justify-between">

                                                <span className="text-sm font-medium text-slate-600">
                                                    View results
                                                </span>

                                                <span className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all">
                                                    →
                                                </span>

                                            </div>

                                        </div>

                                    </article>

                                </Link>

                            ))}

                        </div>

                    ) : (

                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">✓</span>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-800">
                                No Finished Sessions
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Finished Quick Play sessions will appear here.
                            </p>

                        </div>

                    )}

                </section>

            </div>

        </div>

    )

}


export default QuickPlay
