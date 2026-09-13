import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function RoundRobinStandings({
    tournamentId,
    tournamentStatus
}) {

    const [standings, setStandings] =
        useState([])

    const [loading, setLoading] =
        useState(true)


    useEffect(() => {

        fetchStandings()

    }, [
        tournamentId,
        tournamentStatus
    ])


    const fetchStandings =
        async () => {

        try {

            setLoading(true)

            const res =
                await axios.get(
                    `http://localhost:5000/api/tournaments/${tournamentId}/standings`
                )

            setStandings(
                res.data.standings || []
            )

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to load standings'
            )

        } finally {

            setLoading(false)

        }

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


    const getEntryName =
        item => {

            if (
                item.teamName
            ) {
                return item.teamName
            }

            return (
                item.members || []
            )
                .map(
                    getPlayerName
                )
                .join(' / ')
        }


    const getMemberNames =
        item => {

            if (
                !item.teamName
            ) {
                return ''
            }

            return (
                item.members || []
            )
                .map(
                    getPlayerName
                )
                .join(' / ')
        }


    if (loading) {

        return (

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-gray-500">
                Loading standings...
            </div>

        )

    }


    return (

        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

            <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>

                    <h2 className="text-2xl font-bold text-gray-700">
                        Standings
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Win = 1 point · Loss = 0 points
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        fetchStandings
                    }
                    className="self-start px-4 py-2 rounded-xl border border-[#E5E7EB] text-gray-500 hover:border-[#34C759] hover:text-[#34C759] text-sm font-semibold cursor-pointer transition"
                >
                    Refresh
                </button>

            </div>


            <div className="overflow-x-auto">

                <table className="w-full min-w-[820px]">

                    <thead>

                        <tr className="bg-[#F8F8F8] text-left text-xs uppercase tracking-wide text-gray-400">

                            <th className="px-5 py-4">
                                Rank
                            </th>

                            <th className="px-5 py-4">
                                Player / Team
                            </th>

                            <th className="px-5 py-4 text-center">
                                P
                            </th>

                            <th className="px-5 py-4 text-center">
                                W
                            </th>

                            <th className="px-5 py-4 text-center">
                                L
                            </th>

                            <th className="px-5 py-4 text-center">
                                SF
                            </th>

                            <th className="px-5 py-4 text-center">
                                SA
                            </th>

                            <th className="px-5 py-4 text-center">
                                Diff
                            </th>

                            <th className="px-5 py-4 text-center">
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

                                <td className="px-5 py-4">

                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                            item.rank === 1
                                                ? 'bg-green-100 text-[#34C759]'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {item.rank}
                                    </div>

                                </td>


                                <td className="px-5 py-4">

                                    <p className="font-semibold text-gray-700">
                                        {getEntryName(
                                            item
                                        )}
                                    </p>

                                    {getMemberNames(
                                        item
                                    ) && (

                                        <p className="text-xs text-gray-400 mt-1">
                                            {getMemberNames(
                                                item
                                            )}
                                        </p>

                                    )}

                                </td>


                                <td className="px-5 py-4 text-center text-gray-600">
                                    {item.played}
                                </td>

                                <td className="px-5 py-4 text-center font-semibold text-[#34C759]">
                                    {item.wins}
                                </td>

                                <td className="px-5 py-4 text-center text-red-500">
                                    {item.losses}
                                </td>

                                <td className="px-5 py-4 text-center text-gray-600">
                                    {item.scoreFor}
                                </td>

                                <td className="px-5 py-4 text-center text-gray-600">
                                    {item.scoreAgainst}
                                </td>

                                <td className="px-5 py-4 text-center text-gray-600">
                                    {item.scoreDifference > 0
                                        ? `+${item.scoreDifference}`
                                        : item.scoreDifference}
                                </td>

                                <td className="px-5 py-4 text-center">

                                    <span className="inline-flex min-w-9 justify-center px-3 py-1.5 rounded-lg bg-[#34C759]/10 text-[#34C759] font-bold">
                                        {item.points}
                                    </span>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>


            {standings.length === 0 && (

                <div className="p-10 text-center text-gray-500">
                    No standings available.
                </div>

            )}

        </div>

    )

}

export default RoundRobinStandings