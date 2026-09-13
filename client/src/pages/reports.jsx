import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
    FaTrophy,
    FaUsers,
    FaChartBar,
    FaSearch,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaEye
} from 'react-icons/fa'

function Reports() {

    const [activeTab, setActiveTab] =
        useState('tournaments')

    const [tournamentReports, setTournamentReports] =
        useState([])

    const [quickPlayReports, setQuickPlayReports] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [search, setSearch] =
        useState('')


    useEffect(() => {

        fetchReports()

    }, [])


    const fetchReports =
        async () => {

        try {

            setLoading(true)

            const token =
                localStorage.getItem(
                    'token'
                )

            const [
                tournamentRes,
                quickPlayRes
            ] = await Promise.all([

                axios.get(
                    'http://localhost:5000/api/tournaments/organizer/reports',
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    'http://localhost:5000/api/queue/organizer/reports',
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )

            ])


            setTournamentReports(
                tournamentRes.data.reports ||
                []
            )

            setQuickPlayReports(
                quickPlayRes.data.reports ||
                []
            )

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to load reports'
            )

        } finally {

            setLoading(false)

        }

    }


    const formatDate =
        value => {

            if (!value) {
                return '—'
            }

            return new Date(
                value
            ).toLocaleDateString(
                undefined,
                {
                    year:
                        'numeric',
                    month:
                        'short',
                    day:
                        'numeric'
                }
            )

        }


    const filteredTournaments =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase()

                if (!query) {
                    return tournamentReports
                }

                return tournamentReports.filter(
                    report =>
                        [
                            report.title,
                            report.game,
                            report.format,
                            report.location
                        ]
                            .filter(Boolean)
                            .some(
                                value =>
                                    String(
                                        value
                                    )
                                        .toLowerCase()
                                        .includes(
                                            query
                                        )
                            )
                )

            },
            [
                tournamentReports,
                search
            ]
        )


    const filteredQuickPlay =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase()

                if (!query) {
                    return quickPlayReports
                }

                return quickPlayReports.filter(
                    report =>
                        [
                            report.name,
                            report.gameType,
                            report.location
                        ]
                            .filter(Boolean)
                            .some(
                                value =>
                                    String(
                                        value
                                    )
                                        .toLowerCase()
                                        .includes(
                                            query
                                        )
                            )
                )

            },
            [
                quickPlayReports,
                search
            ]
        )


    return (

        <div className="min-h-screen bg-[#F8F8F8] p-8">

            <div className="mb-8">

                <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-2xl bg-[#34C759]/10 flex items-center justify-center">

                        <FaChartBar className="text-[#34C759] text-xl" />

                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-gray-700">
                            Reports
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Historical records for your finished tournaments and Quick Play sessions.
                        </p>

                    </div>

                </div>

            </div>


            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-2 mb-6">

                <div className="flex flex-col sm:flex-row gap-2">

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab(
                                'tournaments'
                            )
                            setSearch('')
                        }}
                        className={`flex-1 px-5 py-3 rounded-xl font-semibold text-sm cursor-pointer transition ${
                            activeTab ===
                            'tournaments'
                                ? 'bg-[#34C759] text-white shadow-sm'
                                : 'text-gray-500 hover:bg-[#F8F8F8]'
                        }`}
                    >
                        Tournament Reports
                        <span className="ml-2 opacity-75">
                            ({tournamentReports.length})
                        </span>
                    </button>


                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab(
                                'quickplay'
                            )
                            setSearch('')
                        }}
                        className={`flex-1 px-5 py-3 rounded-xl font-semibold text-sm cursor-pointer transition ${
                            activeTab ===
                            'quickplay'
                                ? 'bg-[#34C759] text-white shadow-sm'
                                : 'text-gray-500 hover:bg-[#F8F8F8]'
                        }`}
                    >
                        Quick Play Reports
                        <span className="ml-2 opacity-75">
                            ({quickPlayReports.length})
                        </span>
                    </button>

                </div>

            </div>


            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 mb-6">

                <div className="relative">

                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                        type="text"
                        value={search}
                        onChange={
                            e =>
                                setSearch(
                                    e.target.value
                                )
                        }
                        placeholder={
                            activeTab ===
                            'tournaments'
                                ? 'Search tournament reports...'
                                : 'Search Quick Play reports...'
                        }
                        className="w-full pl-11 pr-4 py-3 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#34C759]"
                    />

                </div>

            </div>


            {loading ? (

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center text-gray-500">
                    Loading reports...
                </div>

            ) : activeTab ===
                'tournaments' ? (

                <div className="space-y-4">

                    {filteredTournaments.length ===
                    0 ? (

                        <EmptyState
                            icon={
                                <FaTrophy />
                            }
                            title="No Tournament Reports"
                            text="Finished tournaments you organized will appear here."
                        />

                    ) : (

                        filteredTournaments.map(
                            report => (

                            <div
                                key={
                                    report._id
                                }
                                className="bg-white border border-[#E5E7EB] rounded-2xl p-6"
                            >

                                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                                    <div className="min-w-0">

                                        <div className="flex items-center gap-3 mb-3">

                                            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">

                                                <FaTrophy className="text-[#34C759]" />

                                            </div>

                                            <div className="min-w-0">

                                                <h2 className="text-lg font-bold text-gray-700 truncate">
                                                    {report.title}
                                                </h2>

                                                <p className="text-sm text-gray-500">
                                                    {report.game}
                                                    {' · '}
                                                    {report.format}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                                            <span className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-[#34C759]" />
                                                {report.location ||
                                                'No location'}
                                            </span>

                                            <span className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-[#34C759]" />
                                                Finished {formatDate(
                                                    report.finishedAt
                                                )}
                                            </span>

                                        </div>


                                        <div className="flex flex-wrap gap-2 mt-4">

                                            <Badge
                                                text={`${report.participantCount} participant${
                                                    report.participantCount === 1
                                                        ? ''
                                                        : 's'
                                                }`}
                                            />

                                            {report.teamCount >
                                                0 && (

                                                <Badge
                                                    text={`${report.teamCount} team${
                                                        report.teamCount === 1
                                                            ? ''
                                                            : 's'
                                                    }`}
                                                />

                                            )}

                                            <Badge
                                                text={`${report.completedMatches}/${report.totalMatches} matches completed`}
                                            />

                                        </div>

                                    </div>


                                    <Link
                                        to={`/reports/tournament/${report._id}`}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#34C759] text-white font-semibold hover:opacity-90 transition shrink-0"
                                    >
                                        <FaEye />
                                        View Report
                                    </Link>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            ) : (

                <div className="space-y-4">

                    {filteredQuickPlay.length ===
                    0 ? (

                        <EmptyState
                            icon={
                                <FaUsers />
                            }
                            title="No Quick Play Reports"
                            text="Finished Quick Play sessions you organized will appear here."
                        />

                    ) : (

                        filteredQuickPlay.map(
                            report => (

                            <div
                                key={
                                    report._id
                                }
                                className="bg-white border border-[#E5E7EB] rounded-2xl p-6"
                            >

                                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                                    <div className="min-w-0">

                                        <div className="flex items-center gap-3 mb-3">

                                            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">

                                                <FaUsers className="text-[#34C759]" />

                                            </div>

                                            <div className="min-w-0">

                                                <h2 className="text-lg font-bold text-gray-700 truncate">
                                                    {report.name}
                                                </h2>

                                                <p className="text-sm text-gray-500">
                                                    {report.gameType}
                                                    {' · '}
                                                    {report.numberOfCourts} court{report.numberOfCourts === 1 ? '' : 's'}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                                            <span className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-[#34C759]" />
                                                {report.location ||
                                                'No location'}
                                            </span>

                                            <span className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-[#34C759]" />
                                                Finished {formatDate(
                                                    report.finishedAt
                                                )}
                                            </span>

                                        </div>


                                        <div className="flex flex-wrap gap-2 mt-4">

                                            <Badge
                                                text={`${report.participantCount} participant${
                                                    report.participantCount === 1
                                                        ? ''
                                                        : 's'
                                                }`}
                                            />

                                            <Badge
                                                text={`${report.completedMatches}/${report.totalMatches} matches completed`}
                                            />

                                        </div>

                                    </div>


                                    <Link
                                        to={`/reports/quickplay/${report._id}`}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#34C759] text-white font-semibold hover:opacity-90 transition shrink-0"
                                    >
                                        <FaEye />
                                        View Report
                                    </Link>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            )}

        </div>

    )

}


function Badge({
    text
}) {

    return (

        <span className="px-3 py-1.5 rounded-lg bg-[#F8F8F8] border border-[#E5E7EB] text-xs font-semibold text-gray-500">
            {text}
        </span>

    )

}


function EmptyState({
    icon,
    title,
    text
}) {

    return (

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#34C759]/10 flex items-center justify-center text-[#34C759] text-2xl mb-4">
                {icon}
            </div>

            <h3 className="text-xl font-bold text-gray-700">
                {title}
            </h3>

            <p className="text-gray-500 mt-2">
                {text}
            </p>

        </div>

    )

}


export default Reports
