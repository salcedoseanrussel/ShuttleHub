import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
    FaArrowLeft,
    FaPrint,
    FaTrophy,
    FaUsers,
    FaGamepad,
    FaMapMarkerAlt,
    FaCalendarAlt
} from 'react-icons/fa'

function TournamentReport() {

    const { id } =
        useParams()

    const [report, setReport] =
        useState(null)

    const [loading, setLoading] =
        useState(true)


    useEffect(() => {

        fetchReport()

    }, [id])


    const fetchReport =
        async () => {

        try {

            setLoading(true)

            const token =
                localStorage.getItem(
                    'token'
                )

            const res =
                await axios.get(
                    `http://localhost:5000/api/tournaments/${id}/report`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )

            setReport(
                res.data
            )

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to load tournament report'
            )

        } finally {

            setLoading(false)

        }

    }


    const formatDateTime =
        value => {

            if (!value) {
                return '—'
            }

            return new Date(
                value
            ).toLocaleString(
                undefined,
                {
                    year:
                        'numeric',
                    month:
                        'long',
                    day:
                        'numeric',
                    hour:
                        '2-digit',
                    minute:
                        '2-digit'
                }
            )

        }


    const getPlayerName =
        player => {

            const fullName =
                `${player?.firstName || ''} ${player?.lastName || ''}`.trim()

            return (
                fullName ||
                player?.username ||
                'Player'
            )

        }


    const getSideName =
        players => {

            if (
                !players ||
                players.length === 0
            ) {
                return '—'
            }

            return players
                .map(
                    getPlayerName
                )
                .join(' / ')

        }


    if (loading) {

        return (

            <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center text-gray-500">
                Loading tournament report...
            </div>

        )

    }


    if (!report) {

        return (

            <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">

                <div className="text-center">

                    <p className="font-semibold text-gray-700">
                        Report unavailable
                    </p>

                    <Link
                        to="/reports"
                        className="inline-block mt-4 text-[#34C759] font-semibold"
                    >
                        Back to Reports
                    </Link>

                </div>

            </div>

        )

    }


    const {
        tournament,
        summary,
        participants,
        teams,
        champion,
        runnerUp,
        standings,
        matches,
        generatedAt
    } = report


    return (

        <div className="min-h-screen bg-[#F8F8F8] p-8">

            <style>
                {`
                    @media print {
                        body {
                            background: white !important;
                        }

                        .report-no-print {
                            display: none !important;
                        }

                        .report-print-card {
                            border: 1px solid #E5E7EB !important;
                            box-shadow: none !important;
                            break-inside: avoid;
                        }

                        .report-page {
                            padding: 0 !important;
                            background: white !important;
                        }
                    }
                `}
            </style>


            <div className="report-page max-w-6xl mx-auto">

                <div className="report-no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <Link
                        to="/reports"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#34C759] font-semibold"
                    >
                        <FaArrowLeft />
                        Back to Reports
                    </Link>


                    <button
                        type="button"
                        onClick={() =>
                            window.print()
                        }
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#34C759] text-white rounded-xl font-semibold cursor-pointer hover:opacity-90"
                    >
                        <FaPrint />
                        Print Report
                    </button>

                </div>


                <div className="report-print-card bg-white border border-[#E5E7EB] rounded-2xl p-8 mb-6">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

                        <div>

                            <p className="text-[#34C759] font-bold text-sm uppercase tracking-wider">
                                ShuttleHub
                            </p>

                            <h1 className="text-3xl font-bold text-gray-700 mt-1">
                                Tournament Report
                            </h1>

                            <h2 className="text-xl font-semibold text-gray-600 mt-3">
                                {tournament.title}
                            </h2>

                        </div>


                        <div className="text-sm text-gray-500 md:text-right">

                            <p>
                                Generated
                            </p>

                            <p className="font-semibold text-gray-700">
                                {formatDateTime(
                                    generatedAt
                                )}
                            </p>

                        </div>

                    </div>

                </div>


                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

                    <StatCard
                        label="Participants"
                        value={
                            summary.participantCount
                        }
                        icon={
                            <FaUsers />
                        }
                    />

                    <StatCard
                        label={
                            summary.teamCount >
                            0
                                ? 'Teams'
                                : 'Format'
                        }
                        value={
                            summary.teamCount >
                            0
                                ? summary.teamCount
                                : tournament.format
                        }
                        icon={
                            <FaTrophy />
                        }
                    />

                    <StatCard
                        label="Total Matches"
                        value={
                            summary.totalMatches
                        }
                        icon={
                            <FaGamepad />
                        }
                    />

                    <StatCard
                        label="Completed"
                        value={`${summary.completedMatches}/${summary.totalMatches}`}
                        icon={
                            <FaTrophy />
                        }
                    />

                </div>


                <Section title="Tournament Information">

                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">

                        <Info
                            label="Game Type"
                            value={
                                tournament.game
                            }
                        />

                        <Info
                            label="Format"
                            value={
                                tournament.format
                            }
                        />

                        <Info
                            label="Location"
                            value={
                                tournament.location ||
                                '—'
                            }
                            icon={
                                <FaMapMarkerAlt />
                            }
                        />

                        <Info
                            label="Scheduled Date"
                            value={
                                formatDateTime(
                                    tournament.startDate
                                )
                            }
                            icon={
                                <FaCalendarAlt />
                            }
                        />

                        <Info
                            label="Started"
                            value={
                                formatDateTime(
                                    tournament.startedAt
                                )
                            }
                        />

                        <Info
                            label="Finished"
                            value={
                                formatDateTime(
                                    tournament.finishedAt
                                )
                            }
                        />

                        <Info
                            label="Organizer"
                            value={
                                getPlayerName(
                                    tournament.organizer
                                )
                            }
                        />

                    </div>

                </Section>


                <div className="grid lg:grid-cols-2 gap-6 mb-6">

                    <Section title="Champion">

                        <div className="rounded-xl bg-green-50 border border-green-200 p-5">

                            <p className="text-xs uppercase tracking-wide text-green-600 font-bold mb-2">
                                Champion
                            </p>

                            <p className="text-xl font-bold text-gray-700">
                                {getSideName(
                                    champion
                                )}
                            </p>

                        </div>

                    </Section>


                    <Section title="Runner-up">

                        <div className="rounded-xl bg-[#F8F8F8] border border-[#E5E7EB] p-5">

                            <p className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-2">
                                Runner-up
                            </p>

                            <p className="text-xl font-bold text-gray-700">
                                {getSideName(
                                    runnerUp
                                )}
                            </p>

                        </div>

                    </Section>

                </div>


                {tournament.format ===
                    'Round Robin' &&
                    standings?.length >
                        0 && (

                    <Section title="Final Standings">

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[760px]">

                                <thead>

                                    <tr className="bg-[#F8F8F8] text-xs uppercase text-gray-400">

                                        <th className="text-left px-4 py-3">
                                            Rank
                                        </th>

                                        <th className="text-left px-4 py-3">
                                            Player / Team
                                        </th>

                                        <th className="px-4 py-3">
                                            P
                                        </th>

                                        <th className="px-4 py-3">
                                            W
                                        </th>

                                        <th className="px-4 py-3">
                                            L
                                        </th>

                                        <th className="px-4 py-3">
                                            SF
                                        </th>

                                        <th className="px-4 py-3">
                                            SA
                                        </th>

                                        <th className="px-4 py-3">
                                            Diff
                                        </th>

                                        <th className="px-4 py-3">
                                            Pts
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {standings.map(
                                        item => (

                                        <tr
                                            key={
                                                item.entryId
                                            }
                                            className="border-t border-[#E5E7EB]"
                                        >

                                            <td className="px-4 py-3 font-bold text-gray-700">
                                                {item.rank}
                                            </td>

                                            <td className="px-4 py-3">

                                                <p className="font-semibold text-gray-700">
                                                    {item.teamName ||
                                                    getSideName(
                                                        item.members
                                                    )}
                                                </p>

                                                {item.teamName && (

                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {getSideName(
                                                            item.members
                                                        )}
                                                    </p>

                                                )}

                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {item.played}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {item.wins}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {item.losses}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {item.scoreFor}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {item.scoreAgainst}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {item.scoreDifference}
                                            </td>

                                            <td className="px-4 py-3 text-center font-bold text-[#34C759]">
                                                {item.points}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </Section>

                )}


                <Section title={teams?.length > 0 ? 'Teams' : 'Participants'}>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

                        {teams?.length >
                        0
                            ? teams.map(
                                (
                                    team,
                                    index
                                ) => (

                                <div
                                    key={
                                        team._id
                                    }
                                    className="rounded-xl bg-[#F8F8F8] border border-[#E5E7EB] p-4"
                                >

                                    <p className="text-xs text-gray-400 font-bold">
                                        {team.name ||
                                        `Team ${index + 1}`}
                                    </p>

                                    <p className="font-semibold text-gray-700 mt-1">
                                        {getSideName(
                                            team.players
                                        )}
                                    </p>

                                </div>

                            ))
                            : participants.map(
                                player => (

                                <div
                                    key={
                                        player._id
                                    }
                                    className="rounded-xl bg-[#F8F8F8] border border-[#E5E7EB] p-4"
                                >
                                    <p className="font-semibold text-gray-700">
                                        {getPlayerName(
                                            player
                                        )}
                                    </p>
                                </div>

                            ))
                        }

                    </div>

                </Section>


                <Section title="Match Results">

                    <div className="space-y-4">

                        {matches.map(
                            match => (

                            <div
                                key={
                                    match._id
                                }
                                className="rounded-xl border border-[#E5E7EB] p-5"
                            >

                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

                                    <div>

                                        <p className="text-xs font-bold uppercase text-gray-400">
                                            {match.roundName ||
                                            `Round ${match.roundNumber}`}
                                            {' · '}
                                            Match {match.matchNumber}
                                        </p>

                                    </div>

                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-semibold">
                                        {match.status}
                                    </span>

                                </div>


                                <div className="grid sm:grid-cols-[1fr_auto_1fr] items-center gap-4">

                                    <div>

                                        <p className={`font-semibold ${
                                            match.winnerTeam ===
                                            'A'
                                                ? 'text-[#34C759]'
                                                : 'text-gray-700'
                                        }`}>
                                            {getSideName(
                                                match.teamA
                                            )}
                                        </p>

                                    </div>


                                    <div className="text-center">

                                        <p className="text-xl font-bold text-gray-700">
                                            {match.scoreA ??
                                            '—'}
                                            {' - '}
                                            {match.scoreB ??
                                            '—'}
                                        </p>

                                    </div>


                                    <div className="sm:text-right">

                                        <p className={`font-semibold ${
                                            match.winnerTeam ===
                                            'B'
                                                ? 'text-[#34C759]'
                                                : 'text-gray-700'
                                        }`}>
                                            {getSideName(
                                                match.teamB
                                            )}
                                        </p>

                                    </div>

                                </div>


                                {match.games?.length >
                                    0 && (

                                    <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex flex-wrap gap-2">

                                        {match.games.map(
                                            game => (

                                            <span
                                                key={
                                                    game.gameNumber
                                                }
                                                className="px-3 py-1.5 rounded-lg bg-[#F8F8F8] text-xs font-semibold text-gray-500"
                                            >
                                                Game {game.gameNumber}: {game.scoreA}-{game.scoreB}
                                            </span>

                                        ))}

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                </Section>

            </div>

        </div>

    )

}


function Section({
    title,
    children
}) {

    return (

        <div className="report-print-card bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-700 mb-5">
                {title}
            </h2>

            {children}

        </div>

    )

}


function StatCard({
    label,
    value,
    icon
}) {

    return (

        <div className="report-print-card bg-white border border-[#E5E7EB] rounded-2xl p-5">

            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-[#34C759] mb-3">
                {icon}
            </div>

            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="text-xl font-bold text-gray-700 mt-1 break-words">
                {value}
            </p>

        </div>

    )

}


function Info({
    label,
    value,
    icon
}) {

    return (

        <div>

            <p className="text-xs uppercase tracking-wide font-semibold text-gray-400">
                {label}
            </p>

            <p className="flex items-center gap-2 text-gray-700 font-semibold mt-1">
                {icon && (
                    <span className="text-[#34C759]">
                        {icon}
                    </span>
                )}

                {value}
            </p>

        </div>

    )

}


export default TournamentReport
