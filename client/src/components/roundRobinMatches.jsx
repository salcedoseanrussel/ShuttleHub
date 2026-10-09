import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

function RoundRobinMatches({
    tournamentId,
    isOwner,
    tournamentStatus,
    onTournamentUpdated
}) {

    const [matches, setMatches] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [submittingMatchId, setSubmittingMatchId] =
        useState(null)

    const [filter, setFilter] =
        useState('All')


    useEffect(() => {

        fetchMatches()

    }, [
        tournamentId,
        tournamentStatus
    ])


    const fetchMatches = async () => {

        try {

            setLoading(true)

            const res =
                await axios.get(
                    `http://localhost:5000/api/tournaments/${tournamentId}/matches`
                )

            setMatches(
                res.data || []
            )

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to load Round Robin matches'
            )

        } finally {

            setLoading(false)

        }

    }


    const getPlayerName =
        player => {

            if (!player) {
                return 'TBD'
            }

            const fullName =
                `${player.firstName || ''} ${player.lastName || ''}`.trim()

            return (
                fullName ||
                player.username ||
                'Player'
            )

        }


    const getSideName =
        team => {

            if (
                !team ||
                team.length === 0
            ) {
                return 'TBD'
            }

            return team
                .map(
                    getPlayerName
                )
                .join(' / ')

        }


    const visibleMatches =
        useMemo(() => {

            if (
                filter === 'All'
            ) {

                return matches

            }

            return matches.filter(
                match =>
                    match.status ===
                    filter
            )

        }, [
            matches,
            filter
        ])


    const finishedCount =
        matches.filter(
            match =>
                match.status ===
                'Finished'
        ).length


    const handleSubmitResult =
        async match => {

            const sideA =
                getSideName(
                    match.teamA
                )

            const sideB =
                getSideName(
                    match.teamB
                )


            const result =
                await Swal.fire({

                    title:
                        'Enter Best-of-3 Result',

                    width:
                        620,

                    html: `
                        <div style="
                            text-align:left;
                            margin-top:10px;
                        ">

                            <p style="
                                color:#6B7280;
                                font-size:13px;
                                margin-bottom:16px;
                            ">
                                Enter each badminton game score. First side to win 2 games wins the match.
                            </p>

                            ${[1, 2, 3].map(gameNumber => `
                                <div style="
                                    border:1px solid #E5E7EB;
                                    border-radius:12px;
                                    padding:12px;
                                    margin-bottom:10px;
                                ">

                                    <div style="
                                        font-size:12px;
                                        font-weight:700;
                                        color:#6B7280;
                                        margin-bottom:10px;
                                    ">
                                        GAME ${gameNumber}${gameNumber === 3 ? ' (if needed)' : ''}
                                    </div>

                                    <div style="
                                        display:grid;
                                        grid-template-columns:1fr 82px;
                                        gap:10px;
                                        align-items:center;
                                        margin-bottom:8px;
                                    ">

                                        <strong style="
                                            color:#374151;
                                            font-size:13px;
                                        ">
                                            ${sideA}
                                        </strong>

                                        <input
                                            id="tournament-game-${gameNumber}-a"
                                            type="number"
                                            min="0"
                                            max="30"
                                            class="swal2-input"
                                            style="
                                                width:82px;
                                                margin:0;
                                                text-align:center;
                                            "
                                            placeholder="0"
                                        />

                                    </div>

                                    <div style="
                                        display:grid;
                                        grid-template-columns:1fr 82px;
                                        gap:10px;
                                        align-items:center;
                                    ">

                                        <strong style="
                                            color:#374151;
                                            font-size:13px;
                                        ">
                                            ${sideB}
                                        </strong>

                                        <input
                                            id="tournament-game-${gameNumber}-b"
                                            type="number"
                                            min="0"
                                            max="30"
                                            class="swal2-input"
                                            style="
                                                width:82px;
                                                margin:0;
                                                text-align:center;
                                            "
                                            placeholder="0"
                                        />

                                    </div>

                                </div>
                            `).join('')}

                        </div>
                    `,

                    showCancelButton:
                        true,

                    confirmButtonColor:
                        '#34C759',

                    cancelButtonColor:
                        '#9CA3AF',

                    confirmButtonText:
                        'Save Result',

                    cancelButtonText:
                        'Cancel',

                    focusConfirm:
                        false,

                    preConfirm: () => {

                        const games =
                            []

                        let winsA =
                            0

                        let winsB =
                            0


                        for (
                            let gameNumber = 1;
                            gameNumber <= 3;
                            gameNumber++
                        ) {

                            const rawA =
                                document
                                    .getElementById(
                                        `tournament-game-${gameNumber}-a`
                                    )
                                    ?.value
                                    ?.trim()

                            const rawB =
                                document
                                    .getElementById(
                                        `tournament-game-${gameNumber}-b`
                                    )
                                    ?.value
                                    ?.trim()


                            const bothEmpty =
                                !rawA &&
                                !rawB


                            if (
                                bothEmpty &&
                                gameNumber === 3
                            ) {
                                continue
                            }


                            if (
                                !rawA ||
                                !rawB
                            ) {

                                Swal.showValidationMessage(
                                    `Enter both scores for Game ${gameNumber}`
                                )

                                return false

                            }


                            const scoreA =
                                Number(
                                    rawA
                                )

                            const scoreB =
                                Number(
                                    rawB
                                )


                            if (
                                !Number.isInteger(
                                    scoreA
                                ) ||
                                !Number.isInteger(
                                    scoreB
                                ) ||
                                scoreA < 0 ||
                                scoreB < 0 ||
                                scoreA > 30 ||
                                scoreB > 30 ||
                                scoreA === scoreB
                            ) {

                                Swal.showValidationMessage(
                                    `Game ${gameNumber} has an invalid score`
                                )

                                return false

                            }


                            const winner =
                                Math.max(
                                    scoreA,
                                    scoreB
                                )

                            const loser =
                                Math.min(
                                    scoreA,
                                    scoreB
                                )


                            const validGame =
                                (
                                    winner === 21 &&
                                    loser <= 19
                                ) ||
                                (
                                    winner >= 22 &&
                                    winner <= 29 &&
                                    winner - loser === 2
                                ) ||
                                (
                                    winner === 30 &&
                                    (
                                        loser === 28 ||
                                        loser === 29
                                    )
                                )


                            if (
                                !validGame
                            ) {

                                Swal.showValidationMessage(
                                    `Game ${gameNumber} is not a valid badminton game score`
                                )

                                return false

                            }


                            if (
                                scoreA >
                                scoreB
                            ) {
                                winsA++
                            } else {
                                winsB++
                            }


                            games.push({
                                scoreA,
                                scoreB
                            })


                            if (
                                winsA === 2 ||
                                winsB === 2
                            ) {

                                if (
                                    gameNumber < 3
                                ) {

                                    const nextA =
                                        document
                                            .getElementById(
                                                `tournament-game-${gameNumber + 1}-a`
                                            )
                                            ?.value
                                            ?.trim()

                                    const nextB =
                                        document
                                            .getElementById(
                                                `tournament-game-${gameNumber + 1}-b`
                                            )
                                            ?.value
                                            ?.trim()


                                    if (
                                        nextA ||
                                        nextB
                                    ) {

                                        Swal.showValidationMessage(
                                            'Do not enter another game after a side has already won 2 games'
                                        )

                                        return false

                                    }

                                }

                                break

                            }

                        }


                        if (
                            winsA !== 2 &&
                            winsB !== 2
                        ) {

                            Swal.showValidationMessage(
                                'The winner must win 2 games'
                            )

                            return false

                        }


                        return {
                            games
                        }

                    }

                })


            if (
                !result.isConfirmed
            ) {
                return
            }


            try {

                setSubmittingMatchId(
                    match._id
                )

                const token =
                    localStorage.getItem(
                        'token'
                    )

                const res =
                    await axios.put(

                        `http://localhost:5000/api/tournaments/${tournamentId}/matches/${match._id}/result`,

                        result.value,

                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }

                    )


                toast.success(
                    res.data.message
                )

                await fetchMatches()


                if (
                    onTournamentUpdated
                ) {

                    await onTournamentUpdated()

                }

            } catch (err) {

                toast.error(
                    err.response?.data?.message ||
                    'Failed to save match result'
                )

            } finally {

                setSubmittingMatchId(
                    null
                )

            }

        }


    if (loading) {

        return (

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-gray-500">
                Loading Round Robin matches...
            </div>

        )

    }


    return (

        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

            <div className="p-6 border-b border-[#E5E7EB]">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>

                        <h2 className="text-2xl font-bold text-gray-700">
                            Round Robin Matches
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {finishedCount} of {matches.length} matches completed
                        </p>

                    </div>


                    <div className="flex flex-wrap gap-2">

                        {[
                            'All',
                            'Ready',
                            'Finished'
                        ].map(
                            value => (

                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    setFilter(
                                        value
                                    )
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                    filter ===
                                    value
                                        ? 'bg-[#34C759] text-white'
                                        : 'bg-[#F8F8F8] text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {value}
                            </button>

                        ))}

                    </div>

                </div>

            </div>


            <div className="p-6">

                {visibleMatches.length >
                0 ? (

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

                        {visibleMatches.map(
                            match => {

                            const playerA =
                                getSideName(
                                    match.teamA
                                )

                            const playerB =
                                getSideName(
                                    match.teamB
                                )

                            const winnerA =
                                match.winnerTeam ===
                                'A'

                            const winnerB =
                                match.winnerTeam ===
                                'B'

                            const canSubmit =
                                isOwner &&
                                tournamentStatus ===
                                    'Ongoing' &&
                                match.status ===
                                    'Ready'


                            return (

                                <div
                                    key={
                                        match._id
                                    }
                                    className="border border-[#E5E7EB] rounded-xl overflow-hidden"
                                >

                                    <div className="px-4 py-3 bg-[#F8F8F8] border-b border-[#E5E7EB] flex items-center justify-between gap-3">

                                        <p className="text-xs font-semibold text-gray-500">
                                            MATCH {match.matchNumber}
                                        </p>

                                        <span
                                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                match.status ===
                                                'Finished'
                                                    ? 'bg-green-100 text-[#34C759]'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                        >
                                            {match.status}
                                        </span>

                                    </div>


                                    <div className="p-4">

                                        <div
                                            className={`rounded-xl p-3 border ${
                                                winnerA
                                                    ? 'border-[#34C759] bg-green-50'
                                                    : 'border-[#E5E7EB] bg-[#F8F8F8]'
                                            }`}
                                        >

                                            <div className="flex items-center justify-between gap-3">

                                                <p className="font-semibold text-gray-700 truncate">
                                                    {playerA}
                                                </p>

                                                {match.status ===
                                                    'Finished' && (

                                                    <span className="text-lg font-bold text-gray-700">
                                                        {match.scoreA}
                                                    </span>

                                                )}

                                            </div>

                                            {winnerA && (

                                                <p className="text-xs text-[#34C759] font-semibold mt-1">
                                                    Winner
                                                </p>

                                            )}

                                        </div>


                                        <div className="text-center text-xs text-gray-400 font-semibold my-2">
                                            VS
                                        </div>


                                        <div
                                            className={`rounded-xl p-3 border ${
                                                winnerB
                                                    ? 'border-[#34C759] bg-green-50'
                                                    : 'border-[#E5E7EB] bg-[#F8F8F8]'
                                            }`}
                                        >

                                            <div className="flex items-center justify-between gap-3">

                                                <p className="font-semibold text-gray-700 truncate">
                                                    {playerB}
                                                </p>

                                                {match.status ===
                                                    'Finished' && (

                                                    <span className="text-lg font-bold text-gray-700">
                                                        {match.scoreB}
                                                    </span>

                                                )}

                                            </div>

                                            {winnerB && (

                                                <p className="text-xs text-[#34C759] font-semibold mt-1">
                                                    Winner
                                                </p>

                                            )}

                                        </div>


                                        {match.status ===
                                            'Finished' &&
                                            match.games?.length >
                                                0 && (

                                            <div className="mt-4 rounded-xl bg-[#F8F8F8] border border-[#E5E7EB] px-3 py-2">

                                                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
                                                    Game Scores
                                                </p>

                                                <p className="text-xs font-semibold text-gray-600">
                                                    {match.games
                                                        .map(
                                                            (
                                                                game,
                                                                index
                                                            ) =>
                                                                `G${index + 1}: ${game.scoreA}-${game.scoreB}`
                                                        )
                                                        .join('  •  ')}
                                                </p>

                                            </div>

                                        )}


                                        {canSubmit && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSubmitResult(
                                                        match
                                                    )
                                                }
                                                disabled={
                                                    submittingMatchId ===
                                                    match._id
                                                }
                                                className="w-full mt-4 px-4 py-2.5 rounded-xl bg-[#34C759] hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
                                            >

                                                {submittingMatchId ===
                                                match._id
                                                    ? 'Saving...'
                                                    : 'Enter Result'}

                                            </button>

                                        )}

                                    </div>

                                </div>

                            )

                        })}

                    </div>

                ) : (

                    <div className="py-12 text-center text-gray-500">
                        No matches found.
                    </div>

                )}

            </div>

        </div>

    )

}

export default RoundRobinMatches
