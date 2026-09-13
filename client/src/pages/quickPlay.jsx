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

            <div className="min-h-screen bg-[#F8F8F8] p-8">

                <p className="text-gray-500">
                    Loading Quick Play sessions...
                </p>

            </div>

        )

    }


    return (

        <div className="min-h-screen bg-[#F8F8F8] p-8">


            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                <div>

                    <h1 className="text-3xl font-semibold text-[#34C759]">
                        Quick Play
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Join casual badminton sessions and wait for your turn.
                    </p>

                </div>


                {user?.role === 'Organizer' && (

                    <button
                        onClick={() =>
                            navigate('/create-queue')
                        }
                        className="cursor-pointer px-5 py-3 rounded-xl bg-[#34C759] hover:bg-[#2DB84F] text-white font-semibold transition"
                    >
                        + Create Quick Play
                    </button>

                )}

            </div>



            {/* ========================= */}
            {/* AVAILABLE SESSIONS */}
            {/* ========================= */}

            <div className="mb-10">

                {availableSessions.length > 0 ? (

                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">


                        {availableSessions.map(session => (

                            <Link
                                key={session._id}
                                to={`/quick-play/${session._id}`}
                            >

                                <div className="relative h-full bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

                                    <div className="p-6">


                                        {/* STATUS BADGE */}

                                        <div className="absolute top-5 right-5">

                                            {session.status === 'Open' && (

                                                <span className="px-3 py-1 rounded-full bg-green-100 text-[#34C759] text-xs font-semibold">
                                                    Open
                                                </span>

                                            )}


                                            {session.status === 'Closed' && (

                                                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
                                                    Closed
                                                </span>

                                            )}

                                        </div>



                                        {/* SESSION NAME */}

                                        <h2 className="text-2xl font-bold text-gray-700 pr-24 leading-tight">
                                            {session.name}
                                        </h2>


                                        <p className="text-gray-500 mt-3">
                                            {session.location}
                                        </p>



                                        {/* SESSION INFORMATION */}

                                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6 text-sm">


                                            <div>

                                                <p className="text-gray-400">
                                                    Game Type
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {session.gameType}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-gray-400">
                                                    Courts
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {session.numberOfCourts}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-gray-400">
                                                    Waiting
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {session.waitingPlayers?.length || 0}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-gray-400">
                                                    Status
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {session.status}
                                                </p>

                                            </div>


                                            <div className="col-span-2">

                                                <p className="text-gray-400">
                                                    Organizer
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {session.organizer?.username || 'Unknown'}
                                                </p>

                                            </div>


                                        </div>

                                    </div>


                                    {/* VIEW SESSION */}

                                    <div className="px-6 pb-6">

                                        <div className="w-full bg-[#34C759] hover:bg-[#2DB84F] text-white py-3 rounded-xl font-semibold transition text-center">
                                            View Session
                                        </div>

                                    </div>

                                </div>

                            </Link>

                        ))}

                    </div>

                ) : (

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                        <h3 className="text-lg font-semibold text-gray-700">
                            No Available Sessions
                        </h3>

                        <p className="text-gray-500 mt-2">
                            There are currently no active Quick Play sessions.
                        </p>

                    </div>

                )}

            </div>



            {/* ========================= */}
            {/* FINISHED SESSIONS */}
            {/* ========================= */}

            <div>

                <div className="flex items-center gap-4 mb-6">

                    <div className="h-px bg-gray-300 flex-1"/>

                    <span className="text-sm font-semibold text-gray-400 whitespace-nowrap">
                        Finished Sessions
                    </span>

                    <div className="h-px bg-gray-300 flex-1"/>

                </div>


                {finishedSessions.length > 0 ? (

                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">


                        {finishedSessions.map(session => (

                            <Link
                                key={session._id}
                                to={`/quick-play/${session._id}`}
                            >

                                <div className="relative h-full bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden opacity-75 hover:opacity-100 transition">

                                    <div className="p-6">


                                        {/* FINISHED BADGE */}

                                        <div className="absolute top-5 right-5">

                                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                                                Finished
                                            </span>

                                        </div>



                                        {/* SESSION NAME */}

                                        <h2 className="text-2xl font-bold text-gray-500 pr-24 leading-tight">
                                            {session.name}
                                        </h2>


                                        <p className="text-gray-400 mt-3">
                                            {session.location}
                                        </p>



                                        {/* SESSION INFORMATION */}

                                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6 text-sm">


                                            <div>

                                                <p className="text-gray-400">
                                                    Game Type
                                                </p>

                                                <p className="font-semibold text-gray-500">
                                                    {session.gameType}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-gray-400">
                                                    Courts
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {session.numberOfCourts}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-gray-400">
                                                    Waiting
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    0
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-gray-400">
                                                    Status
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    Finished
                                                </p>

                                            </div>


                                            <div className="col-span-2">

                                                <p className="text-gray-400">
                                                    Organizer
                                                </p>

                                                <p className="font-semibold text-gray-700">
                                                    {session.organizer?.username || 'Unknown'}
                                                </p>

                                            </div>


                                        </div>

                                    </div>


                                    {/* VIEW RESULTS */}

                                    <div className="px-6 pb-6">

                                        <div className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition text-center">
                                            View Results
                                        </div>

                                    </div>

                                </div>

                            </Link>

                        ))}

                    </div>

                ) : (

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                        <h3 className="text-lg font-semibold text-gray-700">
                            No Finished Sessions
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Finished Quick Play sessions will appear here.
                        </p>

                    </div>

                )}

            </div>


        </div>

    )

}

export default QuickPlay