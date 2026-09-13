import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

function TournamentBracket({
    tournamentId,
    isOwner,
    tournamentStatus,
    onTournamentUpdated
}) {

    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [submittingMatchId, setSubmittingMatchId] =
        useState(null)


    // ==========================
    // BRACKET SIZE
    // ==========================

    const CARD_WIDTH = 190
    const CARD_HEIGHT = 78
    const COLUMN_GAP = 78
    const ROW_UNIT = 98
    const HEADER_HEIGHT = 48
    const SIDE_PADDING = 12


    useEffect(() => {

        fetchMatches()

    }, [tournamentId, tournamentStatus])


    const fetchMatches = async () => {

        try {

            setLoading(true)

            const res = await axios.get(
                `http://localhost:5000/api/tournaments/${tournamentId}/matches`
            )

            setMatches(
                res.data || []
            )

        } catch (err) {

            console.error(
                'FETCH TOURNAMENT MATCHES ERROR:',
                err
            )

        } finally {

            setLoading(false)

        }

    }


    // ==========================
    // GROUP MATCHES BY ROUND
    // ==========================

    const rounds = useMemo(() => {

        const grouped = {}

        for (const match of matches) {

            if (!grouped[match.roundNumber]) {

                grouped[match.roundNumber] = {
                    roundNumber:
                        match.roundNumber,

                    roundName:
                        match.roundName ||
                        `Round ${match.roundNumber}`,

                    matches: []
                }

            }

            grouped[
                match.roundNumber
            ].matches.push(match)

        }


        return Object.values(grouped)
            .sort(
                (a, b) =>
                    a.roundNumber -
                    b.roundNumber
            )
            .map(round => ({

                ...round,

                matches:
                    round.matches.sort(
                        (a, b) =>
                            a.matchNumber -
                            b.matchNumber
                    )

            }))

    }, [matches])


    // ==========================
    // HELPERS
    // ==========================

    const getPlayerName = player => {

        if (!player) {
            return 'TBD'
        }

        const fullName =
            `${player.firstName || ''} ${player.lastName || ''}`
                .trim()

        return (
            fullName ||
            player.username ||
            'Player'
        )

    }


    const getSideName = team => {

        if (
            !team ||
            team.length === 0
        ) {

            return 'TBD'

        }

        return team
            .map(getPlayerName)
            .join(' / ')

    }


    const getNextMatchId = match => {

        if (!match?.nextMatch) {
            return null
        }

        if (
            typeof match.nextMatch ===
            'string'
        ) {

            return match.nextMatch

        }

        return (
            match.nextMatch._id ||
            null
        )

    }


    // ==========================
    // BRACKET POSITION
    // ==========================

    const matchPositions =
        useMemo(() => {

            const positions = {}

            rounds.forEach(
                (
                    round,
                    roundIndex
                ) => {

                    const roundMultiplier =
                        Math.pow(
                            2,
                            roundIndex
                        )

                    round.matches.forEach(
                        (
                            match,
                            matchIndex
                        ) => {

                            const top =
                                HEADER_HEIGHT +
                                (
                                    matchIndex *
                                    roundMultiplier
                                ) *
                                ROW_UNIT +
                                (
                                    (
                                        roundMultiplier -
                                        1
                                    ) /
                                    2
                                ) *
                                ROW_UNIT

                            const left =
                                SIDE_PADDING +
                                roundIndex *
                                (
                                    CARD_WIDTH +
                                    COLUMN_GAP
                                )

                            positions[
                                match._id
                            ] = {

                                top,
                                left,
                                centerY:
                                    top +
                                    CARD_HEIGHT /
                                    2,

                                rightX:
                                    left +
                                    CARD_WIDTH,

                                leftX:
                                    left

                            }

                        }
                    )

                }
            )

            return positions

        }, [rounds])


    const bracketWidth =
        Math.max(
            1,
            rounds.length
        ) *
        CARD_WIDTH +
        Math.max(
            0,
            rounds.length - 1
        ) *
        COLUMN_GAP +
        SIDE_PADDING * 2


    const firstRoundMatchCount =
        rounds[0]?.matches?.length ||
        1


    const bracketHeight =
        Math.max(
            320,
            HEADER_HEIGHT +
            firstRoundMatchCount *
            ROW_UNIT +
            20
        )


    // ==========================
    // SAVE MATCH RESULT
    // ==========================

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
                Loading tournament bracket...
            </div>

        )

    }


    if (
        matches.length === 0
    ) {

        return (

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">

                <h2 className="text-xl font-bold text-gray-700">
                    Tournament Bracket
                </h2>

                <p className="text-gray-500 mt-2">
                    The bracket will appear after the tournament starts.
                </p>

            </div>

        )

    }


    return (

        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">


            {/* HEADER */}

            <div className="px-5 py-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>

                    <h2 className="text-xl font-bold text-gray-700">
                        Tournament Bracket
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                        Single Elimination
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        fetchMatches
                    }
                    className="self-start px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-gray-500 hover:border-[#34C759] hover:text-[#34C759] text-xs font-semibold transition cursor-pointer"
                >
                    Refresh
                </button>

            </div>


            {/* BRACKET FRAME */}

            <div className="overflow-x-auto overflow-y-hidden">

                <div
                    className="relative mx-auto"
                    style={{
                        width:
                            `${bracketWidth}px`,

                        height:
                            `${bracketHeight}px`,

                        minWidth:
                            `${bracketWidth}px`
                    }}
                >


                    {/* ========================= */}
                    {/* CONNECTOR LINES */}
                    {/* ========================= */}

                    <svg
                        className="absolute inset-0 pointer-events-none z-0"
                        width={
                            bracketWidth
                        }
                        height={
                            bracketHeight
                        }
                        viewBox={
                            `0 0 ${bracketWidth} ${bracketHeight}`
                        }
                    >

                        {matches.map(
                            match => {

                                const nextMatchId =
                                    getNextMatchId(
                                        match
                                    )


                                if (
                                    !nextMatchId
                                ) {

                                    return null

                                }


                                const start =
                                    matchPositions[
                                        match._id
                                    ]


                                const end =
                                    matchPositions[
                                        nextMatchId
                                    ]


                                if (
                                    !start ||
                                    !end
                                ) {

                                    return null

                                }


                                const middleX =
                                    start.rightX +
                                    COLUMN_GAP /
                                    2


                                const path =
                                    `M ${start.rightX} ${start.centerY}
                                     H ${middleX}
                                     V ${end.centerY}
                                     H ${end.leftX}`


                                return (

                                    <path
                                        key={
                                            `${match._id}-${nextMatchId}`
                                        }
                                        d={
                                            path
                                        }
                                        fill="none"
                                        stroke="#9CA3AF"
                                        strokeWidth="1.5"
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                    />

                                )

                            }
                        )}

                    </svg>


                    {/* ========================= */}
                    {/* ROUND HEADERS */}
                    {/* ========================= */}

                    {rounds.map(
                        (
                            round,
                            roundIndex
                        ) => {

                            const left =
                                SIDE_PADDING +
                                roundIndex *
                                (
                                    CARD_WIDTH +
                                    COLUMN_GAP
                                )


                            return (

                                <div
                                    key={
                                        `header-${round.roundNumber}`
                                    }
                                    className="absolute top-0 text-center"
                                    style={{
                                        left:
                                            `${left}px`,

                                        width:
                                            `${CARD_WIDTH}px`
                                    }}
                                >

                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#34C759]">
                                        Round {round.roundNumber}
                                    </p>

                                    <p className="text-sm font-bold text-gray-700 truncate">
                                        {round.roundName}
                                    </p>

                                </div>

                            )

                        }
                    )}


                    {/* ========================= */}
                    {/* MATCH CARDS */}
                    {/* ========================= */}

                    {matches.map(
                        match => {

                            const position =
                                matchPositions[
                                    match._id
                                ]


                            if (
                                !position
                            ) {

                                return null

                            }


                            const canSubmit =
                                isOwner &&
                                tournamentStatus ===
                                    'Ongoing' &&
                                match.status ===
                                    'Ready'


                            const winnerA =
                                match.winnerTeam ===
                                'A'


                            const winnerB =
                                match.winnerTeam ===
                                'B'


                            return (

                                <div
                                    key={
                                        match._id
                                    }
                                    className="absolute z-10 bg-white border border-[#D1D5DB] rounded-lg shadow-sm overflow-hidden"
                                    style={{
                                        width:
                                            `${CARD_WIDTH}px`,

                                        height:
                                            `${CARD_HEIGHT}px`,

                                        left:
                                            `${position.left}px`,

                                        top:
                                            `${position.top}px`
                                    }}
                                >


                                    {/* MATCH NUMBER */}

                                    <div className="h-5 px-2 flex items-center justify-between border-b border-[#E5E7EB] bg-[#F8F8F8]">

                                        <span className="text-[9px] font-semibold text-gray-400">
                                            MATCH {match.matchNumber}
                                        </span>

                                        <span
                                            className={`text-[9px] font-semibold ${
                                                match.status ===
                                                'Finished'
                                                    ? 'text-[#34C759]'
                                                    : match.status ===
                                                        'Bye'
                                                        ? 'text-blue-500'
                                                        : match.status ===
                                                            'Ready'
                                                            ? 'text-yellow-600'
                                                            : 'text-gray-400'
                                            }`}
                                        >
                                            {match.status}
                                        </span>

                                    </div>


                                    {/* PLAYER A */}

                                    <div
                                        className={`h-[26px] px-2 flex items-center justify-between gap-2 border-b border-[#E5E7EB] ${
                                            winnerA
                                                ? 'bg-green-50 border-l-[4px] border-l-[#34C759]'
                                                : 'border-l-[4px] border-l-gray-700'
                                        }`}
                                    >

                                        <span className="text-[11px] font-semibold text-gray-700 truncate">
                                            {getSideName(
                                                match.teamA
                                            )}
                                        </span>

                                        {match.status ===
                                            'Finished' && (

                                            <span className="text-[11px] font-bold text-gray-700">
                                                {match.scoreA}
                                            </span>

                                        )}

                                    </div>


                                    {/* PLAYER B */}

                                    <div
                                        className={`h-[26px] px-2 flex items-center justify-between gap-2 ${
                                            winnerB
                                                ? 'bg-green-50 border-l-[4px] border-l-[#34C759]'
                                                : 'border-l-[4px] border-l-gray-700'
                                        }`}
                                    >

                                        <span className="text-[11px] font-semibold text-gray-700 truncate">
                                            {getSideName(
                                                match.teamB
                                            )}
                                        </span>

                                        {match.status ===
                                            'Finished' && (

                                            <span className="text-[11px] font-bold text-gray-700">
                                                {match.scoreB}
                                            </span>

                                        )}

                                    </div>


                                    {/* RESULT BUTTON */}

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
                                            className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/5 flex items-center justify-center cursor-pointer transition"
                                            title="Enter match result"
                                        >

                                            <span className="px-3 py-1.5 rounded-lg bg-[#34C759] text-white text-[10px] font-semibold shadow-sm">
                                                {submittingMatchId ===
                                                match._id
                                                    ? 'Saving...'
                                                    : 'Enter Result'}
                                            </span>

                                        </button>

                                    )}

                                </div>

                            )

                        }
                    )}

                </div>

            </div>


            {/* FOOTER NOTE */}

            {isOwner &&
                tournamentStatus ===
                    'Ongoing' && (

                <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F8F8F8]">

                    <p className="text-xs text-gray-500">
                        Hover over a ready match to enter its result.
                    </p>

                </div>

            )}

        </div>

    )

}

export default TournamentBracket
