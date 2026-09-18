import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

function QueueDetails() {

    const { id } = useParams()

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    const token = localStorage.getItem('token')

    const [session, setSession] = useState(null)
    const [matches, setMatches] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    const [draggedPlayerId, setDraggedPlayerId] =
        useState(null)

    const [dragOverPlayerId, setDragOverPlayerId] =
        useState(null)


    const [courtAssignments, setCourtAssignments] =
        useState({})

    const [activeTab, setActiveTab] =
        useState('courts')


    useEffect(() => {

        fetchSession()
        fetchStats()

    }, [id])

    // ==========================
    // LOAD STATS
    // ==========================

    const fetchStats = async () => {

        try {

            const res = await axios.get(
                `http://localhost:5000/api/queue/${id}/stats`
            )

            setStats(res.data)

        } catch (err) {

            console.error(
                'LOAD QUEUE STATS ERROR:',
                err
            )

        }

    }


    // ==========================
    // UPDATE SESSION STATUS
    // ==========================

    const handleStatusChange = async (newStatus) => {

        let title = ''
        let text = ''
        let confirmButtonText = ''
        let confirmButtonColor = '#34C759'


        if (newStatus === 'Closed') {

            title = 'Close Quick Play?'

            text =
                'New players will no longer be able to join, but current participants can continue playing.'

            confirmButtonText =
                'Close Session'

            confirmButtonColor =
                '#F59E0B'

        }


        if (newStatus === 'Open') {

            title = 'Reopen Quick Play?'

            text =
                'Players will be able to join this session again.'

            confirmButtonText =
                'Reopen Session'

        }


        if (newStatus === 'Finished') {

            title = 'Finish Quick Play?'

            text =
                'This will permanently end the session. This action cannot be undone.'

            confirmButtonText =
                'Finish Session'

            confirmButtonColor =
                '#EF4444'

        }


        const result = await Swal.fire({

            title,

            text,

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor,

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText,

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) return


        try {

            const res = await axios.put(

                `http://localhost:5000/api/queue/${id}/status`,

                {
                    status:
                        newStatus
                },

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


            await fetchSession()
            await fetchStats()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to update session'
            )

        }

    }


    // ==========================
    // LOAD SESSION
    // ==========================

    const fetchSession = async () => {

        try {

            const res = await axios.get(
                `http://localhost:5000/api/queue/${id}`
            )

            setSession(res.data.session)
            setMatches(res.data.matches || [])

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to load queue session'
            )

        } finally {

            setLoading(false)

        }

    }


    // ==========================
    // JOIN QUEUE
    // ==========================

    const handleJoin = async () => {

        try {

            const res = await axios.post(
                `http://localhost:5000/api/queue/join/${id}`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )

            toast.success(res.data.message)

            await fetchSession()
            await fetchStats()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to join queue'
            )

        }

    }


    // ==========================
    // LEAVE QUEUE
    // ==========================

    const handleLeave = async () => {

        const result = await Swal.fire({
            title: 'Leave Quick Play?',
            text: 'You will leave this session and lose your current queue position.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Leave Quick Play',
            cancelButtonText: 'Stay'
        })

        if (!result.isConfirmed) return


        try {

            const res = await axios.post(
                `http://localhost:5000/api/queue/leave/${id}`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )

            toast.success(res.data.message)

            await fetchSession()
            await fetchStats()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to leave queue'
            )

        }

    }

    // ==========================
    // ADD COURT
    // ==========================

    const handleAddCourt = async () => {

        const result = await Swal.fire({

            title: 'Add Another Court?',

            text:
                `Court ${session.numberOfCourts + 1} will be added to this Quick Play session.`,

            icon: 'question',

            showCancelButton: true,

            confirmButtonColor:
                '#34C759',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                'Add Court',

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const res = await axios.put(

                `http://localhost:5000/api/queue/${id}/add-court`,

                {},

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


            await fetchSession()
            await fetchStats()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to add court'
            )

        }

    }


    // ==========================
    // REMOVE COURT
    // ==========================

    const handleRemoveCourt = async () => {

        if (session.numberOfCourts <= 1) {

            toast.error(
                'Quick Play must have at least one court'
            )

            return

        }


        const courtToRemove =
            session.numberOfCourts


        const result = await Swal.fire({

            title: 'Remove Court?',

            text:
                `Court ${courtToRemove} will be removed from this Quick Play session.`,

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor:
                '#EF4444',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                'Remove Court',

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const res = await axios.put(

                `http://localhost:5000/api/queue/${id}/remove-court`,

                {},

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


            setCourtAssignments(
                previous => {

                    const next = {
                        ...previous
                    }

                    delete next[
                        courtToRemove
                    ]

                    return next

                }
            )


            await fetchSession()
            await fetchStats()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to remove court'
            )

        }

    }


    // ==========================
    // COURT ASSIGNMENT HELPERS
    // ==========================

    const getAssignedCourtForPlayer = (
        playerId
    ) => {

        for (
            const [
                courtNumber,
                assignment
            ] of Object.entries(
                courtAssignments
            )
        ) {

            const assignedPlayers = [
                ...(assignment?.teamA || []),
                ...(assignment?.teamB || [])
            ]


            if (
                assignedPlayers.some(
                    player =>
                        player._id === playerId
                )
            ) {

                return Number(
                    courtNumber
                )

            }

        }


        return null

    }


    const handleAssignPlayersFromQueue = (
        courtNumber
    ) => {

        const playersPerTeam =
            session.gameType === 'Doubles'
                ? 2
                : 1


        const playersNeeded =
            playersPerTeam * 2


        const playersAlreadyAssignedElsewhere =
            new Set(
                Object.entries(
                    courtAssignments
                )
                    .filter(
                        ([otherCourt]) =>
                            Number(otherCourt) !==
                            courtNumber
                    )
                    .flatMap(
                        ([, assignment]) => [
                            ...(assignment?.teamA || []),
                            ...(assignment?.teamB || [])
                        ]
                    )
                    .map(
                        player =>
                            player._id
                    )
            )


        const availablePlayers =
            (
                session.waitingPlayers ||
                []
            ).filter(
                player =>
                    !playersAlreadyAssignedElsewhere
                        .has(
                            player._id
                        )
            )


        if (
            availablePlayers.length <
            playersNeeded
        ) {

            toast.error(
                session.gameType === 'Doubles'
                    ? 'At least 4 unassigned waiting players are required'
                    : 'At least 2 unassigned waiting players are required'
            )

            return

        }


        const selectedPlayers =
            availablePlayers.slice(
                0,
                playersNeeded
            )


        setCourtAssignments(
            previous => ({

                ...previous,

                [courtNumber]: {

                    teamA:
                        selectedPlayers.slice(
                            0,
                            playersPerTeam
                        ),

                    teamB:
                        selectedPlayers.slice(
                            playersPerTeam,
                            playersNeeded
                        )

                }

            })
        )


        toast.success(
            `Players assigned to Court ${courtNumber}`
        )

    }


    const handleCourtTeamDrop = (
        event,
        courtNumber,
        team
    ) => {

        event.preventDefault()
        event.stopPropagation()

        if (
            !isOwner ||
            session.status !== 'Open' ||
            !draggedPlayerId
        ) {
            return
        }

        const player =
            session.waitingPlayers.find(
                waitingPlayer =>
                    waitingPlayer._id ===
                    draggedPlayerId
            )

        if (!player) {
            return
        }

        const playersPerTeam =
            session.gameType === 'Doubles'
                ? 2
                : 1

        setCourtAssignments(
            previous => {

                const currentCourt =
                    previous[courtNumber] || {
                        teamA: [],
                        teamB: []
                    }

                const alreadyAssignedHere = [
                    ...currentCourt.teamA,
                    ...currentCourt.teamB
                ].some(
                    assigned =>
                        assigned._id ===
                        player._id
                )

                if (alreadyAssignedHere) {
                    return previous
                }

                const usedOnAnotherCourt =
                    Object.entries(previous)
                        .some(
                            ([
                                otherCourtNumber,
                                assignment
                            ]) => {

                                if (
                                    Number(otherCourtNumber) ===
                                    courtNumber
                                ) {
                                    return false
                                }

                                return [
                                    ...(assignment.teamA || []),
                                    ...(assignment.teamB || [])
                                ].some(
                                    assigned =>
                                        assigned._id ===
                                        player._id
                                )

                            }
                        )

                if (usedOnAnotherCourt) {

                    toast.error(
                        'This player is already assigned to another court'
                    )

                    return previous
                }

                if (
                    currentCourt[team].length >=
                    playersPerTeam
                ) {

                    toast.error(
                        team === 'teamA'
                            ? 'Team 1 is already full'
                            : 'Team 2 is already full'
                    )

                    return previous
                }

                return {
                    ...previous,

                    [courtNumber]: {
                        ...currentCourt,

                        [team]: [
                            ...currentCourt[team],
                            player
                        ]
                    }
                }

            }
        )

        setDraggedPlayerId(null)
        setDragOverPlayerId(null)

    }


    const handleRemoveCourtAssignment = (
        courtNumber,
        team,
        playerId
    ) => {

        setCourtAssignments(
            previous => {

                const currentCourt =
                    previous[courtNumber] || {
                        teamA: [],
                        teamB: []
                    }

                return {
                    ...previous,

                    [courtNumber]: {
                        ...currentCourt,

                        [team]:
                            currentCourt[team].filter(
                                player =>
                                    player._id !==
                                    playerId
                            )
                    }
                }

            }
        )

    }


    // ==========================
    // START MATCH MANUALLY
    // ==========================

    const handleStartMatch = async (
        courtNumber
    ) => {

        const playersPerTeam =
            session.gameType === 'Doubles'
                ? 2
                : 1


        const assignment =
            courtAssignments[
                courtNumber
            ] || {
                teamA: [],
                teamB: []
            }


        if (
            assignment.teamA.length !==
                playersPerTeam ||
            assignment.teamB.length !==
                playersPerTeam
        ) {

            toast.error(
                session.gameType === 'Doubles'
                    ? 'Assign exactly 2 players to each team before starting the match'
                    : 'Assign exactly 1 player to each side before starting the match'
            )

            return

        }


        const result = await Swal.fire({

            title:
                `Start Match on Court ${courtNumber}?`,

            text:
                'The assigned players will be removed from the waiting queue and the match will begin.',

            icon:
                'question',

            showCancelButton:
                true,

            confirmButtonColor:
                '#34C759',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                'Start Match',

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const res = await axios.put(

                `http://localhost:5000/api/queue/${id}/courts/${courtNumber}/start`,

                {

                    teamAPlayerIds:
                        assignment.teamA.map(
                            player =>
                                player._id
                        ),

                    teamBPlayerIds:
                        assignment.teamB.map(
                            player =>
                                player._id
                        )

                },

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


            setCourtAssignments(
                previous => ({

                    ...previous,

                    [courtNumber]: {
                        teamA: [],
                        teamB: []
                    }

                })
            )


            await fetchSession()
            await fetchStats()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to start match'
            )

            await fetchSession()

        }

    }


    // ==========================
    // SKIP PLAYER ONCE
    // ==========================

    const handleSkipPlayer = async (
        player
    ) => {

        const result = await Swal.fire({

            title: 'Skip Player?',

            text:
                `${player.firstName} ${player.lastName} will be moved to the end of the waiting queue.`,

            icon: 'question',

            showCancelButton: true,

            confirmButtonColor:
                '#F59E0B',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                'Skip Player',

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const res = await axios.put(

                `http://localhost:5000/api/queue/${id}/players/${player._id}/skip`,

                {},

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


            await fetchSession()
            await fetchStats()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to skip player'
            )

        }

    }

    // ==========================
    // REMOVE PLAYER
    // ==========================

    const handleRemovePlayer = async (player) => {

        const result = await Swal.fire({

            title: 'Remove Player?',

            html: `
                <div style="text-align:center;">
                    Remove
                    <strong>
                        ${player.firstName} ${player.lastName}
                    </strong>
                    from this Quick Play session?
                </div>
            `,

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor:
                '#EF4444',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                'Remove Player',

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const res = await axios.delete(

                `http://localhost:5000/api/queue/${id}/players/${player._id}`,

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


            await fetchSession()
            await fetchStats()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to remove player'
            )

        }

    }


    // ==========================
    // DRAG QUEUE PLAYER
    // ==========================

    const handleDragStart = (
        event,
        player
    ) => {

        setDraggedPlayerId(
            player._id
        )

        event.dataTransfer.effectAllowed =
            'move'

    }


    // ==========================
    // DRAG OVER PLAYER
    // ==========================

    const handleDragOver = (
        event,
        player
    ) => {

        event.preventDefault()

        event.dataTransfer.dropEffect =
            'move'

        setDragOverPlayerId(
            player._id
        )

    }


    // ==========================
    // DROP PLAYER
    // ==========================

    const handleDrop = async (
        event,
        targetPlayer
    ) => {

        event.preventDefault()


        if (
            !draggedPlayerId ||
            draggedPlayerId ===
                targetPlayer._id
        ) {

            setDraggedPlayerId(null)
            setDragOverPlayerId(null)

            return

        }


        const currentPlayers = [
            ...session.waitingPlayers
        ]


        const draggedIndex =
            currentPlayers.findIndex(
                player =>
                    player._id ===
                    draggedPlayerId
            )


        const targetIndex =
            currentPlayers.findIndex(
                player =>
                    player._id ===
                    targetPlayer._id
            )


        if (
            draggedIndex === -1 ||
            targetIndex === -1
        ) {

            setDraggedPlayerId(null)
            setDragOverPlayerId(null)

            return

        }


        const reorderedPlayers = [
            ...currentPlayers
        ]


        const [draggedPlayer] =
            reorderedPlayers.splice(
                draggedIndex,
                1
            )


        reorderedPlayers.splice(
            targetIndex,
            0,
            draggedPlayer
        )


        // ==========================
        // UPDATE UI IMMEDIATELY
        // ==========================

        setSession(
            previous => ({
                ...previous,
                waitingPlayers:
                    reorderedPlayers
            })
        )


        setDraggedPlayerId(null)
        setDragOverPlayerId(null)


        try {

            await axios.put(

                `http://localhost:5000/api/queue/${id}/reorder`,

                {
                    playerIds:
                        reorderedPlayers.map(
                            player =>
                                player._id
                        )
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            )


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to update queue order'
            )

            await fetchSession()

        }

    }


    // ==========================
    // END DRAG
    // ==========================

    const handleDragEnd = () => {

        setDraggedPlayerId(null)
        setDragOverPlayerId(null)

    }


    /// ==========================
    // FINISH MATCH + RECORD SCORE
    // ==========================

    const handleFinishMatch = async (match) => {

        // ==========================
        // GET TEAMS
        // FALLBACK FOR OLD MATCHES
        // ==========================

        const playersPerTeam =
            session.gameType === 'Doubles'
                ? 2
                : 1


        const teamA =
            match.teamA?.length > 0
                ? match.teamA
                : match.players?.slice(
                    0,
                    playersPerTeam
                ) || []


        const teamB =
            match.teamB?.length > 0
                ? match.teamB
                : match.players?.slice(
                    playersPerTeam,
                    playersPerTeam * 2
                ) || []


        const teamAName =
            teamA
                .map(
                    player =>
                        `${player.firstName} ${player.lastName}`
                )
                .join(' / ')


        const teamBName =
            teamB
                .map(
                    player =>
                        `${player.firstName} ${player.lastName}`
                )
                .join(' / ')


        // ==========================
        // SCORE POPUP
        // ==========================

        const result = await Swal.fire({

            title:
                `Finish Court ${match.courtNumber}`,

            html: `

                <div style="
                    text-align:left;
                    margin-top:10px;
                ">

                    <div style="
                        background:#F8F8F8;
                        border-radius:12px;
                        padding:12px;
                        margin-bottom:16px;
                        text-align:center;
                    ">

                        <div style="
                            font-size:12px;
                            color:#9CA3AF;
                            font-weight:600;
                            margin-bottom:4px;
                        ">
                            TEAM 1
                        </div>

                        <div
                            id="swal-team-a"
                            style="
                                font-weight:600;
                                color:#374151;
                            "
                        ></div>


                        <div style="
                            margin:10px 0;
                            font-size:12px;
                            font-weight:700;
                            color:#9CA3AF;
                        ">
                            VS
                        </div>


                        <div style="
                            font-size:12px;
                            color:#9CA3AF;
                            font-weight:600;
                            margin-bottom:4px;
                        ">
                            TEAM 2
                        </div>

                        <div
                            id="swal-team-b"
                            style="
                                font-weight:600;
                                color:#374151;
                            "
                        ></div>

                    </div>


                    <div style="
                        display:grid;
                        grid-template-columns:1fr 90px 90px;
                        gap:10px;
                        align-items:center;
                        margin-bottom:8px;
                    ">

                        <strong style="
                            font-size:13px;
                            color:#6B7280;
                        ">
                            Game
                        </strong>

                        <strong style="
                            text-align:center;
                            font-size:12px;
                            color:#6B7280;
                        ">
                            Team 1
                        </strong>

                        <strong style="
                            text-align:center;
                            font-size:12px;
                            color:#6B7280;
                        ">
                            Team 2
                        </strong>

                    </div>


                    <!-- GAME 1 -->

                    <div style="
                        display:grid;
                        grid-template-columns:1fr 90px 90px;
                        gap:10px;
                        align-items:center;
                        margin-bottom:10px;
                    ">

                        <span style="
                            font-size:14px;
                            color:#4B5563;
                        ">
                            Game 1
                        </span>

                        <input
                            id="score-a-1"
                            type="number"
                            min="0"
                            max="30"
                            step="1"
                            class="swal2-input"
                            style="
                                width:90px;
                                margin:0;
                                text-align:center;
                            "
                            placeholder="0"
                        />

                        <input
                            id="score-b-1"
                            type="number"
                            min="0"
                            max="30"
                            step="1"
                            class="swal2-input"
                            style="
                                width:90px;
                                margin:0;
                                text-align:center;
                            "
                            placeholder="0"
                        />

                    </div>


                    <!-- GAME 2 -->

                    <div style="
                        display:grid;
                        grid-template-columns:1fr 90px 90px;
                        gap:10px;
                        align-items:center;
                        margin-bottom:10px;
                    ">

                        <span style="
                            font-size:14px;
                            color:#4B5563;
                        ">
                            Game 2
                            <small style="
                                color:#9CA3AF;
                            ">
                                optional
                            </small>
                        </span>

                        <input
                            id="score-a-2"
                            type="number"
                            min="0"
                            max="30"
                            step="1"
                            class="swal2-input"
                            style="
                                width:90px;
                                margin:0;
                                text-align:center;
                            "
                            placeholder="0"
                        />

                        <input
                            id="score-b-2"
                            type="number"
                            min="0"
                            max="30"
                            step="1"
                            class="swal2-input"
                            style="
                                width:90px;
                                margin:0;
                                text-align:center;
                            "
                            placeholder="0"
                        />

                    </div>


                    <!-- GAME 3 -->

                    <div style="
                        display:grid;
                        grid-template-columns:1fr 90px 90px;
                        gap:10px;
                        align-items:center;
                    ">

                        <span style="
                            font-size:14px;
                            color:#4B5563;
                        ">
                            Game 3
                            <small style="
                                color:#9CA3AF;
                            ">
                                optional
                            </small>
                        </span>

                        <input
                            id="score-a-3"
                            type="number"
                            min="0"
                            max="30"
                            step="1"
                            class="swal2-input"
                            style="
                                width:90px;
                                margin:0;
                                text-align:center;
                            "
                            placeholder="0"
                        />

                        <input
                            id="score-b-3"
                            type="number"
                            min="0"
                            max="30"
                            step="1"
                            class="swal2-input"
                            style="
                                width:90px;
                                margin:0;
                                text-align:center;
                            "
                            placeholder="0"
                        />

                    </div>

                </div>
            `,

            didOpen: () => {

                const teamAElement =
                    document.getElementById(
                        'swal-team-a'
                    )


                const teamBElement =
                    document.getElementById(
                        'swal-team-b'
                    )


                if (teamAElement) {
                    teamAElement.textContent =
                        teamAName
                }


                if (teamBElement) {
                    teamBElement.textContent =
                        teamBName
                }

            },

            showCancelButton: true,

            confirmButtonColor:
                '#34C759',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                'Save Result & Finish',

            cancelButtonText:
                'Cancel',

            focusConfirm: false,


            // ==========================
            // VALIDATE SCORES
            // ==========================

            preConfirm: () => {

                const games = [
                    {
                        a:
                            document
                                .getElementById(
                                    'score-a-1'
                                )
                                ?.value,

                        b:
                            document
                                .getElementById(
                                    'score-b-1'
                                )
                                ?.value
                    },

                    {
                        a:
                            document
                                .getElementById(
                                    'score-a-2'
                                )
                                ?.value,

                        b:
                            document
                                .getElementById(
                                    'score-b-2'
                                )
                                ?.value
                    },

                    {
                        a:
                            document
                                .getElementById(
                                    'score-a-3'
                                )
                                ?.value,

                        b:
                            document
                                .getElementById(
                                    'score-b-3'
                                )
                                ?.value
                    }
                ]


                const scores = []


                for (
                    let index = 0;
                    index < games.length;
                    index++
                ) {

                    const game =
                        games[index]


                    const hasA =
                        game.a !== '' &&
                        game.a !== undefined


                    const hasB =
                        game.b !== '' &&
                        game.b !== undefined


                    // ==========================
                    // BOTH MUST BE ENTERED
                    // ==========================

                    if (hasA !== hasB) {

                        Swal.showValidationMessage(
                            `Enter both scores for Game ${index + 1}`
                        )

                        return false

                    }


                    // ==========================
                    // EMPTY OPTIONAL GAME
                    // ==========================

                    if (!hasA && !hasB) {
                        continue
                    }


                    const teamAScore =
                        Number(game.a)


                    const teamBScore =
                        Number(game.b)


                    // ==========================
                    // INTEGER + RANGE
                    // ==========================

                    if (
                        !Number.isInteger(teamAScore) ||
                        !Number.isInteger(teamBScore) ||
                        teamAScore < 0 ||
                        teamBScore < 0 ||
                        teamAScore > 30 ||
                        teamBScore > 30
                    ) {

                        Swal.showValidationMessage(
                            `Invalid score for Game ${index + 1}`
                        )

                        return false

                    }


                    // ==========================
                    // NO TIE
                    // ==========================

                    if (
                        teamAScore ===
                        teamBScore
                    ) {

                        Swal.showValidationMessage(
                            `Game ${index + 1} cannot end in a tie`
                        )

                        return false

                    }


                    scores.push({

                        teamA:
                            teamAScore,

                        teamB:
                            teamBScore

                    })

                }


                // ==========================
                // GAME ORDER VALIDATION
                // ==========================

                const game1Entered =
                    games[0].a !== '' &&
                    games[0].a !== undefined &&
                    games[0].b !== '' &&
                    games[0].b !== undefined


                const game2Entered =
                    games[1].a !== '' &&
                    games[1].a !== undefined &&
                    games[1].b !== '' &&
                    games[1].b !== undefined


                const game3Entered =
                    games[2].a !== '' &&
                    games[2].a !== undefined &&
                    games[2].b !== '' &&
                    games[2].b !== undefined


                // GAME 1 MUST EXIST

                if (!game1Entered) {

                    Swal.showValidationMessage(
                        'Game 1 is required'
                    )

                    return false

                }


                // GAME 3 CANNOT EXIST WITHOUT GAME 2

                if (
                    game3Entered &&
                    !game2Entered
                ) {

                    Swal.showValidationMessage(
                        'Enter Game 2 before Game 3'
                    )

                    return false

                }


                // ==========================
                // BEST OF 3 VALIDATION
                // ==========================

                if (scores.length < 2) {

                    Swal.showValidationMessage(
                        'A match requires at least 2 games'
                    )

                    return false

                }


                let teamAWins = 0
                let teamBWins = 0


                scores.forEach(score => {

                    if (
                        score.teamA >
                        score.teamB
                    ) {

                        teamAWins++

                    } else {

                        teamBWins++

                    }

                })


                // ==========================
                // CHECK FIRST 2 GAMES
                // ==========================

                const game1Winner =
                    scores[0].teamA >
                    scores[0].teamB
                        ? 'A'
                        : 'B'


                const game2Winner =
                    scores[1].teamA >
                    scores[1].teamB
                        ? 'A'
                        : 'B'


                // ==========================
                // SAME TEAM WON GAME 1 + 2
                // MATCH IS ALREADY OVER
                // ==========================

                if (
                    game1Winner ===
                    game2Winner
                ) {

                    if (scores.length === 3) {

                        Swal.showValidationMessage(
                            'Game 3 is not needed because the match was already won 2-0'
                        )

                        return false

                    }


                    return scores

                }


                // ==========================
                // FIRST 2 GAMES ARE 1-1
                // GAME 3 IS REQUIRED
                // ==========================

                if (scores.length < 3) {

                    Swal.showValidationMessage(
                        'Game 3 is required because the match is tied 1-1'
                    )

                    return false

                }


                // ==========================
                // FINAL WINNER MUST HAVE 2 WINS
                // ==========================

                if (
                    teamAWins !== 2 &&
                    teamBWins !== 2
                ) {

                    Swal.showValidationMessage(
                        'Invalid best-of-3 match result'
                    )

                    return false

                }


                return scores

            }

        })


        if (!result.isConfirmed) {
            return
        }


        // ==========================
        // SEND RESULT
        // ==========================

        try {

            const res = await axios.put(

                `http://localhost:5000/api/queue/${id}/matches/${match._id}/finish`,

                {
                    scores:
                        result.value
                },

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


            await fetchSession()
            await fetchStats()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to finish match'
            )

        }

    }

    // ==========================
    // FORMAT MATCH DURATION
    // ==========================

    const formatMatchDuration = (
        startedAt,
        finishedAt
    ) => {

        if (!startedAt || !finishedAt) {
            return null
        }


        const start =
            new Date(startedAt)

        const finish =
            new Date(finishedAt)


        const difference =
            finish - start


        if (difference < 0) {
            return null
        }


        const totalMinutes =
            Math.floor(
                difference / 60000
            )


        const hours =
            Math.floor(
                totalMinutes / 60
            )


        const minutes =
            totalMinutes % 60


        if (hours > 0) {

            return `${hours}h ${minutes}m`

        }


        if (totalMinutes < 1) {

            return 'Less than 1 min'

        }


        return `${minutes} min`

    }


    if (loading) {

        return (
            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-7 py-6 shadow-sm text-center">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>
                    <p className="text-sm font-medium text-slate-600">Loading queue...</p>
                </div>
            </div>
        )

    }


    if (!session) {

        return (
            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 shadow-sm text-center">
                    <p className="text-sm font-medium text-slate-600">Queue session not found.</p>
                </div>
            </div>
        )

    }


    // ==========================
    // PAGE VALUES
    // ==========================

    const waitingIndex =
        session.waitingPlayers?.findIndex(
            player => player._id === user?.id
        ) ?? -1


    const isWaiting =
        waitingIndex !== -1

    const isParticipant =
        session.activePlayers?.some(
            player =>
                player._id === user?.id
        ) || false


    const playingMatch =
        matches.find(
            match =>
                match.status === 'Playing' &&
                match.players?.some(
                    player =>
                        player._id === user?.id
                )
        )


    const courtNumbers =
        Array.from(
            {
                length:
                    Number(
                        session.numberOfCourts
                    ) || 0
            },
            (_, index) =>
                index + 1
        )

    // ==========================
    // MATCH HISTORY
    // ==========================

    const finishedMatches =
        matches
            .filter(
                match =>
                    match.status === 'Finished'
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.finishedAt ||
                        b.createdAt
                    ) -
                    new Date(
                        a.finishedAt ||
                        a.createdAt
                    )
            )


    const isOwner =
        session.organizer?._id === user?.id


    // ==========================
    // VISIBLE WAITING PLAYERS
    // HIDE PLAYERS ALREADY ASSIGNED TO A COURT
    // ==========================

    const assignedPlayerIds =
        new Set(
            Object.values(
                courtAssignments
            )
                .flatMap(
                    assignment => [
                        ...(assignment?.teamA || []),
                        ...(assignment?.teamB || [])
                    ]
                )
                .map(
                    player =>
                        player._id
                )
        )


    const visibleWaitingPlayers =
        (
            session.waitingPlayers ||
            []
        ).filter(
            player =>
                !assignedPlayerIds.has(
                    player._id
                )
        )


    return (

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">

            {/* HEADER */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="flex flex-col lg:flex-row lg:justify-between gap-5 px-5 sm:px-6 py-5 border-b border-slate-100">

                    <div>

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                            <span className="w-6 h-px bg-[#34C759]"/>
                            Quick Play Session
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                            {session.name}
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 mt-2">
                            {session.location}
                        </p>

                        <p className="text-xs text-slate-400 mt-2">
                            Organized by @{session.organizer?.username}
                        </p>

                    </div>


                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

                        <span
                            className={`
                                px-4 py-2 rounded-full
                                text-sm font-semibold

                                ${
                                    session.status === 'Open'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : session.status === 'Closed'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }
                            `}
                        >
                            {session.status}
                        </span>


                        {isOwner && session.status === 'Open' && (

                            <button
                                onClick={() =>
                                    handleStatusChange('Closed')
                                }
                                className="px-4 py-2 rounded-xl border border-yellow-400 text-yellow-700 hover:bg-yellow-50 text-sm font-semibold cursor-pointer transition"
                            >
                                Close Session
                            </button>

                        )}


                        {isOwner && session.status === 'Closed' && (

                            <button
                                onClick={() =>
                                    handleStatusChange('Open')
                                }
                                className="px-4 py-2 rounded-xl border border-[#34C759] text-[#34C759] hover:bg-green-50 text-sm font-semibold cursor-pointer transition"
                            >
                                Reopen
                            </button>

                        )}


                        {isOwner && session.status !== 'Finished' && (

                            <button
                                onClick={() =>
                                    handleStatusChange('Finished')
                                }
                                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 shadow-sm text-white text-sm font-semibold cursor-pointer transition"
                            >
                                Finish Session
                            </button>

                        )}

                    </div>

                </div>


                {/* SESSION INFORMATION */}

                <div className="grid md:grid-cols-3 gap-3 px-5 sm:px-6 py-5">

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Game Type
                        </p>

                        <p className="text-lg font-semibold text-slate-900 mt-1">
                            {session.gameType}
                        </p>

                    </div>


                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Courts
                        </p>

                        <p className="text-lg font-semibold text-slate-900 mt-1">
                            {session.numberOfCourts}
                        </p>

                    </div>


                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Waiting Players
                        </p>

                        <p className="text-lg font-semibold text-slate-900 mt-1">
                            {session.waitingPlayers?.length || 0}
                        </p>

                    </div>

                </div>

                {session.status === 'Closed' && (

                    <div className="mx-5 sm:mx-6 mb-5 bg-amber-50 border border-yellow-200 rounded-xl p-5">

                        <p className="font-semibold text-yellow-700">
                            This session is closed
                        </p>

                        <p className="text-sm text-yellow-700/80 mt-1">
                            New players cannot join and no new matches
                            will be started. Current matches can still
                            be completed.
                        </p>

                    </div>

                )}

                {session.status === 'Finished' && (

                    <div className="mx-5 sm:mx-6 mb-5 bg-slate-100 border border-gray-200 rounded-xl p-5">

                        <p className="font-semibold text-slate-800">
                            This Quick Play session has ended
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            Queueing and match rotation are no longer active.
                        </p>

                    </div>

                )}


                {/* PLAYER STATUS */}

                {user?.role === 'Player' && (

                    <div className="px-5 sm:px-6 pb-5">

                        {playingMatch ? (

                            <div className="bg-green-50 border border-green-200 rounded-xl p-5">

                                <p className="text-sm text-green-600 font-semibold">
                                    NOW PLAYING
                                </p>

                                <p className="text-lg font-semibold text-slate-950 mt-1">
                                    Court {playingMatch.courtNumber}
                                </p>

                                <p className="text-sm text-slate-500 mt-2">
                                    Finish your current match before leaving the session.
                                </p>

                            </div>

                        ) : isWaiting ? (

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">

                                <p className="text-sm text-yellow-700 font-semibold">
                                    YOUR QUEUE POSITION
                                </p>

                                <p className="text-3xl font-bold text-slate-800 mt-1">
                                    #{waitingIndex + 1}
                                </p>

                            </div>

                        ) : !isParticipant ? (

                            !isOwner &&
                            session.status === 'Open' && (

                                <button
                                    onClick={handleJoin}
                                    className="px-6 py-3 rounded-xl bg-[#34C759] hover:bg-[#2FB350] shadow-sm text-white text-sm font-semibold cursor-pointer transition"
                                >
                                    Join Quick Play
                                </button>

                            )

                        ) : null}


                        {isParticipant && !playingMatch && (

                            <button
                                onClick={handleLeave}
                                className="mt-4 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 shadow-sm text-white text-sm font-semibold cursor-pointer transition"
                            >
                                Leave Quick Play
                            </button>

                        )}

                    </div>

                )}

            </div>


            {/* ========================= */}
            {/* QUICK PLAY TABS */}
            {/* ========================= */}

            <div className="mt-5">

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5 shadow-sm">

                    <div className="flex flex-wrap gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab('courts')
                            }
                            className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                activeTab === 'courts'
                                    ? 'bg-[#34C759] text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            Matches
                            <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab === 'courts'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {session.numberOfCourts || 0}
                            </span>
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab('players')
                            }
                            className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                activeTab === 'players'
                                    ? 'bg-[#34C759] text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            Players
                            <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab === 'players'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {stats?.totalParticipants ||
                                    session.participants?.length ||
                                    0}
                            </span>
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab('history')
                            }
                            className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                activeTab === 'history'
                                    ? 'bg-[#34C759] text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            Match History
                            <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab === 'history'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {finishedMatches.length}
                            </span>
                        </button>

                    </div>

                </div>

            </div>


            {activeTab === 'courts' && (

                <>

            {/* ACTIVE COURTS */}

            <div className="mt-8">

                <div className="flex justify-between items-center gap-4 mb-5">

                    <h2 className="text-xl font-semibold text-slate-950">
                        Courts
                    </h2>


                    {isOwner &&
                        session.status === 'Open' && (

                        <div className="flex items-center gap-2">

                            {session.numberOfCourts > 1 && (

                                <button
                                    onClick={handleRemoveCourt}
                                    className="px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm text-sm font-semibold cursor-pointer transition transition"
                                >
                                    − Remove Court
                                </button>

                            )}


                            <button
                                onClick={handleAddCourt}
                                className="px-4 py-2 rounded-xl border border-[#34C759] text-[#34C759] hover:bg-green-50 text-sm text-sm font-semibold cursor-pointer transition transition"
                            >
                                + Add Court
                            </button>

                        </div>

                    )}

                </div>


                <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">

                    {courtNumbers.map(courtNumber => {

                        const match =
                            matches.find(
                                item =>
                                    item.status === 'Playing' &&
                                    item.courtNumber === courtNumber
                            )


                        if (!match) {

                            const playersNeeded =
                                session.gameType === 'Doubles'
                                    ? 4
                                    : 2


                            const assignment =
                                courtAssignments[courtNumber] || {
                                    teamA: [],
                                    teamB: []
                                }

                            const playersPerTeam =
                                session.gameType === 'Doubles'
                                    ? 2
                                    : 1

                            const totalAssigned =
                                assignment.teamA.length +
                                assignment.teamB.length

                            const requiredPlayers =
                                playersPerTeam * 2

                            const teamsComplete =
                                assignment.teamA.length ===
                                    playersPerTeam &&
                                assignment.teamB.length ===
                                    playersPerTeam


                            const teamA =
                                assignment.teamA


                            const teamB =
                                assignment.teamB


                            const assignedElsewhere =
                                new Set(
                                    Object.entries(
                                        courtAssignments
                                    )
                                        .filter(
                                            ([otherCourt]) =>
                                                Number(otherCourt) !==
                                                courtNumber
                                        )
                                        .flatMap(
                                            ([, assignment]) => [
                                                ...(assignment?.teamA || []),
                                                ...(assignment?.teamB || [])
                                            ]
                                        )
                                        .map(
                                            player =>
                                                player._id
                                        )
                                )


                            const availableWaitingCount =
                                (
                                    session.waitingPlayers ||
                                    []
                                ).filter(
                                    player =>
                                        !assignedElsewhere.has(
                                            player._id
                                        )
                                ).length


                            const canAutoAssign =
                                availableWaitingCount >=
                                playersNeeded


                            const readyToStart =
                                teamsComplete


                            const renderAssignedPlayer = (
                                player,
                                team
                            ) => (

                                <div
                                    key={player._id}
                                    className="h-10 flex items-center justify-between gap-3"
                                >

                                    <div className="flex items-center gap-3 min-w-0">

                                        <div className="w-9 h-9 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] font-bold shrink-0">

                                            {player.firstName
                                                ?.charAt(0)
                                                .toUpperCase()}

                                        </div>


                                        <div className="min-w-0">

                                            <p className="font-semibold text-slate-800 truncate">
                                                {player.firstName}{' '}
                                                {player.lastName}
                                            </p>

                                            <p className="text-xs text-slate-400 truncate">
                                                @{player.username}
                                            </p>

                                        </div>

                                    </div>


                                    {isOwner && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveCourtAssignment(
                                                    courtNumber,
                                                    team,
                                                    player._id
                                                )
                                            }
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer shrink-0"
                                            title="Remove assignment"
                                        >
                                            ×
                                        </button>

                                    )}

                                </div>

                            )


                            const renderEmptySlot = (
                                slotKey
                            ) => (

                                <div
                                    key={slotKey}
                                    className="h-10 border border-dashed border-gray-300 rounded-lg px-2 flex items-center justify-center text-center text-[11px] text-slate-400"
                                >
                                    Drag player here
                                </div>

                            )


                            return (

                                <div
                                    key={courtNumber}
                                    
                                    className={`
                                        bg-white border rounded-xl p-4 transition

                                        ${
                                            draggedPlayerId &&
                                            isOwner &&
                                            session.status === 'Open'
                                                ? 'border-[#34C759] bg-green-50/20'
                                                : 'border-slate-200'
                                        }
                                    `}
                                >

                                    <div className="flex justify-between items-start gap-3">

                                        <div>

                                            <h3 className="text-lg font-semibold text-slate-950">
                                                Court {courtNumber}
                                            </h3>

                                            <p className="text-xs text-slate-400 mt-2">
                                                Waiting for players
                                            </p>

                                        </div>


                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                                            Available
                                        </span>

                                    </div>


                                    <div className="mt-5 space-y-3">

                                        {/* TEAM A */}

                                        <div
                                            onDragOver={
                                                event => {

                                                    if (
                                                        isOwner &&
                                                        session.status === 'Open'
                                                    ) {

                                                        event.preventDefault()

                                                        event.dataTransfer.dropEffect =
                                                            'move'

                                                    }

                                                }
                                            }
                                            onDrop={
                                                event =>
                                                    handleCourtTeamDrop(
                                                        event,
                                                        courtNumber,
                                                        'teamA'
                                                    )
                                            }
                                            className={`
                                                bg-slate-50
                                                rounded-lg
                                                p-2.5
                                                space-y-2
                                                border-2
                                                transition

                                                ${
                                                    draggedPlayerId
                                                        ? 'border-dashed border-[#34C759]'
                                                        : 'border-transparent'
                                                }
                                            `}
                                        >

                                            <p className="text-xs font-semibold text-slate-400 uppercase">

                                                {session.gameType === 'Doubles'
                                                    ? 'Team 1'
                                                    : 'Player 1'
                                                }

                                            </p>


                                            {teamA.map(
                                                player =>
                                                    renderAssignedPlayer(
                                                        player,
                                                        'teamA'
                                                    )
                                            )}


                                            {Array.from(
                                                {
                                                    length:
                                                        playersPerTeam -
                                                        teamA.length
                                                }
                                            ).map(
                                                (_, index) =>
                                                    renderEmptySlot(
                                                        `a-${index}`
                                                    )
                                            )}

                                        </div>


                                        {/* VS */}

                                        <div className="flex items-center gap-3">

                                            <div className="h-px bg-[#E5E7EB] flex-1" />

                                            <span className="text-xs font-bold text-slate-400">
                                                VS
                                            </span>

                                            <div className="h-px bg-[#E5E7EB] flex-1" />

                                        </div>


                                        {/* TEAM B */}

                                        <div
                                            onDragOver={
                                                event => {

                                                    if (
                                                        isOwner &&
                                                        session.status === 'Open'
                                                    ) {

                                                        event.preventDefault()

                                                        event.dataTransfer.dropEffect =
                                                            'move'

                                                    }

                                                }
                                            }
                                            onDrop={
                                                event =>
                                                    handleCourtTeamDrop(
                                                        event,
                                                        courtNumber,
                                                        'teamB'
                                                    )
                                            }
                                            className={`
                                                bg-slate-50
                                                rounded-lg
                                                p-2.5
                                                space-y-2
                                                border-2
                                                transition

                                                ${
                                                    draggedPlayerId
                                                        ? 'border-dashed border-[#34C759]'
                                                        : 'border-transparent'
                                                }
                                            `}
                                        >

                                            <p className="text-xs font-semibold text-slate-400 uppercase">

                                                {session.gameType === 'Doubles'
                                                    ? 'Team 2'
                                                    : 'Player 2'
                                                }

                                            </p>


                                            {teamB.map(
                                                player =>
                                                    renderAssignedPlayer(
                                                        player,
                                                        'teamB'
                                                    )
                                            )}


                                            {Array.from(
                                                {
                                                    length:
                                                        playersPerTeam -
                                                        teamB.length
                                                }
                                            ).map(
                                                (_, index) =>
                                                    renderEmptySlot(
                                                        `b-${index}`
                                                    )
                                            )}

                                        </div>

                                    </div>


                                    {isOwner &&
                                        session.status === 'Open' && (

                                        <div className="mt-5">

                                            {totalAssigned === 0 ? (

                                                <button
                                                    onClick={() =>
                                                        handleAssignPlayersFromQueue(
                                                            courtNumber
                                                        )
                                                    }
                                                    disabled={!canAutoAssign}
                                                    className="w-full px-5 py-3 rounded-xl bg-[#34C759] hover:bg-[#2FB350] shadow-sm text-white text-sm font-semibold cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed transition"
                                                >
                                                    Assign Players from Queue
                                                </button>

                                            ) : (

                                                <button
                                                    onClick={() =>
                                                        handleStartMatch(
                                                            courtNumber
                                                        )
                                                    }
                                                    disabled={!teamsComplete}
                                                    className="w-full px-5 py-3 rounded-xl bg-[#34C759] hover:bg-[#2FB350] shadow-sm text-white text-sm font-semibold cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed transition"
                                                >

                                                    {teamsComplete
                                                        ? 'Start Match'
                                                        : `Assign ${requiredPlayers - totalAssigned} More Player${requiredPlayers - totalAssigned === 1 ? '' : 's'}`
                                                    }

                                                </button>

                                            )}


                                            {!canAutoAssign &&
                                                totalAssigned === 0 && (

                                                <p className="text-xs text-slate-400 mt-2 text-center">

                                                    {session.gameType === 'Doubles'
                                                        ? '4 unassigned waiting players are required.'
                                                        : '2 unassigned waiting players are required.'
                                                    }

                                                </p>

                                            )}


                                            <p className="text-xs text-slate-400 mt-2 text-center">
                                                You can also drag players from the Waiting Queue onto this court.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            )

                        }


                        return (

                            <div
                                key={match._id}
                                className="bg-white border border-slate-200 rounded-xl p-4"
                            >

                                <div className="flex justify-between items-start gap-3">

                                    <div>

                                        <h3 className="text-lg font-semibold text-slate-950">
                                            Court {courtNumber}
                                        </h3>

                                        {match.startedAt && (

                                            <p className="text-xs text-slate-400 mt-2">
                                                Started{' '}
                                                {new Date(
                                                    match.startedAt
                                                ).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }
                                                )}
                                            </p>

                                        )}

                                    </div>


                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                                        Playing
                                    </span>

                                </div>


                                <div className="mt-5 space-y-3">

                                    <div className="bg-slate-50 rounded-xl p-3 space-y-3">

                                        <p className="text-xs font-semibold text-slate-400 uppercase">
                                            {session.gameType === 'Doubles'
                                                ? 'Team 1'
                                                : 'Player 1'
                                            }
                                        </p>


                                        {(
                                            match.teamA?.length > 0
                                                ? match.teamA
                                                : match.players?.slice(
                                                    0,
                                                    session.gameType === 'Doubles'
                                                        ? 2
                                                        : 1
                                                )
                                        )?.map(player => (

                                            <div
                                                key={player._id}
                                                className="flex items-center gap-3"
                                            >

                                                <div className="w-9 h-9 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] font-bold shrink-0">
                                                    {player.firstName
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {player.firstName}{' '}
                                                        {player.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        @{player.username}
                                                    </p>
                                                </div>

                                            </div>

                                        ))}

                                    </div>


                                    <div className="flex items-center gap-3">
                                        <div className="h-px bg-[#E5E7EB] flex-1" />
                                        <span className="text-xs font-bold text-slate-400">
                                            VS
                                        </span>
                                        <div className="h-px bg-[#E5E7EB] flex-1" />
                                    </div>


                                    <div className="bg-slate-50 rounded-xl p-3 space-y-3">

                                        <p className="text-xs font-semibold text-slate-400 uppercase">
                                            {session.gameType === 'Doubles'
                                                ? 'Team 2'
                                                : 'Player 2'
                                            }
                                        </p>


                                        {(
                                            match.teamB?.length > 0
                                                ? match.teamB
                                                : match.players?.slice(
                                                    session.gameType === 'Doubles'
                                                        ? 2
                                                        : 1,
                                                    session.gameType === 'Doubles'
                                                        ? 4
                                                        : 2
                                                )
                                        )?.map(player => (

                                            <div
                                                key={player._id}
                                                className="flex items-center gap-3"
                                            >

                                                <div className="w-9 h-9 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] font-bold shrink-0">
                                                    {player.firstName
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {player.firstName}{' '}
                                                        {player.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        @{player.username}
                                                    </p>
                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                </div>


                                {isOwner && (

                                    <button
                                        onClick={() =>
                                            handleFinishMatch(match)
                                        }
                                        className="w-full mt-5 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 shadow-sm text-white text-sm font-semibold cursor-pointer transition"
                                    >
                                        Finish Match
                                    </button>

                                )}

                            </div>

                        )

                    })}

                </div>

            </div>



            {/* WAITING QUEUE */}

            <div className="mt-5">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">

                    <div>

                        <h2 className="text-lg font-semibold text-slate-950">
                            Players
                        </h2>

                        <p className="text-xs text-slate-400 mt-1">
                            Drag a waiting player directly to Team 1 or Team 2.
                        </p>

                    </div>


                    <span className="text-xs text-slate-400">
                        {visibleWaitingPlayers.length} waiting
                    </span>

                </div>


                {visibleWaitingPlayers.length > 0 ? (

                    <div className="flex gap-3 overflow-x-auto pb-3">

                        {visibleWaitingPlayers.map(
                            (player, index) => {

                                return (

                                    <div
                                        key={player._id}

                                        draggable={
                                            isOwner &&
                                            session.status === 'Open'
                                        }

                                        onDragStart={
                                            event =>
                                                handleDragStart(
                                                    event,
                                                    player
                                                )
                                        }

                                        onDragOver={
                                            event =>
                                                handleDragOver(
                                                    event,
                                                    player
                                                )
                                        }

                                        onDrop={
                                            event =>
                                                handleDrop(
                                                    event,
                                                    player
                                                )
                                        }

                                        onDragEnd={
                                            handleDragEnd
                                        }

                                        className={`
                                            min-w-[185px]
                                            max-w-[185px]
                                            shrink-0
                                            bg-white
                                            border
                                            rounded-xl
                                            p-3
                                            transition

                                            ${
                                                isOwner &&
                                                session.status === 'Open'
                                                    ? 'cursor-grab active:cursor-grabbing'
                                                    : ''
                                            }

                                            ${
                                                draggedPlayerId ===
                                                player._id
                                                    ? 'opacity-40'
                                                    : ''
                                            }

                                            ${
                                                dragOverPlayerId === player._id &&
                                                draggedPlayerId !== player._id
                                                    ? 'border-[#34C759] bg-green-50'
                                                    : 'border-slate-200'
                                            }
                                        `}
                                    >

                                        <div className="flex items-start justify-between gap-2">

                                            <div className="flex items-center gap-2 min-w-0">

                                                <div className="w-8 h-8 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] text-xs font-bold shrink-0">

                                                    {player.firstName
                                                        ?.charAt(0)
                                                        .toUpperCase()}

                                                </div>


                                                <div className="min-w-0">

                                                    <p className="text-sm font-semibold text-slate-800 truncate">

                                                        {player.firstName}{' '}
                                                        {player.lastName}

                                                    </p>

                                                    <p className="text-[11px] text-slate-400 truncate">
                                                        @{player.username}
                                                    </p>

                                                </div>

                                            </div>


                                            <span className="text-xs font-bold text-[#34C759] shrink-0">
                                                #{index + 1}
                                            </span>

                                        </div>


                                        {isOwner && (

                                            <div className="flex gap-2 mt-3">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSkipPlayer(
                                                            player
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        visibleWaitingPlayers.length - 1
                                                    }
                                                    className="flex-1 px-2 py-1.5 rounded-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] text-sm font-semibold cursor-pointer transition transition"
                                                >
                                                    Skip
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemovePlayer(
                                                            player
                                                        )
                                                    }
                                                    className="flex-1 px-2 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-[11px] text-sm font-semibold cursor-pointer transition transition"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        )}

                                    </div>

                                )

                            }
                        )}

                    </div>

                ) : (

                    <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-sm text-slate-500">
                        No players are waiting.
                    </div>

                )}

            </div>


                </>

            )}

            {activeTab === 'history' && (

                <>

            {/* MATCH HISTORY */}

            <div className="mt-8">

                <h2 className="text-xl font-semibold text-slate-950 mb-5">
                    Match History
                </h2>


                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    {finishedMatches.length > 0 ? (

                        <>

                            {finishedMatches.map(
                                (match, index) => (

                                    <div
                                        key={match._id}
                                        className="p-5 border-b last:border-b-0 border-slate-200"
                                    >

                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                                            <div>

                                                <p className="font-semibold text-slate-800">
                                                    Match {finishedMatches.length - index}
                                                </p>

                                                <p className="text-sm text-slate-500 mt-1">
                                                    Court {match.courtNumber}
                                                </p>

                                            </div>


                                            <span className="w-fit px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                                                Finished
                                            </span>

                                        </div>

                                        {/* ========================= */}
                                        {/* MATCH RESULT */}
                                        {/* ========================= */}

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">


                                            {/* ========================= */}
                                            {/* TEAM A */}
                                            {/* ========================= */}

                                            <div
                                                className={`
                                                    rounded-xl p-4 border

                                                    ${
                                                        match.winnerTeam === 'A'
                                                            ? 'bg-green-50 border-[#34C759]'
                                                            : 'bg-slate-50 border-transparent'
                                                    }
                                                `}
                                            >

                                                <div className="flex items-center justify-between gap-3 mb-3">

                                                    <p className="text-xs font-semibold text-slate-400 uppercase">

                                                        {session.gameType === 'Doubles'
                                                            ? 'Team 1'
                                                            : 'Player 1'
                                                        }

                                                    </p>


                                                    {match.winnerTeam === 'A' && (

                                                        <span className="px-2.5 py-1 rounded-full bg-[#34C759] text-white text-xs font-semibold">
                                                            Winner
                                                        </span>

                                                    )}

                                                </div>


                                                <div className="space-y-3">

                                                    {(
                                                        match.teamA?.length > 0

                                                            ? match.teamA

                                                            : match.players?.slice(
                                                                0,
                                                                session.gameType === 'Doubles'
                                                                    ? 2
                                                                    : 1
                                                            )

                                                    )?.map(player => (

                                                        <div
                                                            key={player._id}
                                                            className="flex items-center gap-3"
                                                        >

                                                            <div className="w-9 h-9 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] font-bold shrink-0">

                                                                {player.firstName
                                                                    ?.charAt(0)
                                                                    .toUpperCase()}

                                                            </div>


                                                            <div className="min-w-0">

                                                                <p className="text-sm font-semibold text-slate-800">

                                                                    {player.firstName}{' '}
                                                                    {player.lastName}

                                                                </p>

                                                                <p className="text-xs text-slate-400">
                                                                    @{player.username}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    ))}

                                                </div>

                                            </div>



                                            {/* ========================= */}
                                            {/* SCORES */}
                                            {/* ========================= */}

                                            <div className="flex flex-col items-center justify-center min-w-[110px]">

                                                <span className="text-xs font-bold text-slate-400 mb-3">
                                                    VS
                                                </span>


                                                {match.scores?.length > 0 ? (

                                                    <div className="space-y-2 w-full">

                                                        {match.scores.map(
                                                            (score, scoreIndex) => (

                                                                <div
                                                                    key={scoreIndex}
                                                                    className="text-center"
                                                                >

                                                                    <p className="text-[11px] text-slate-400">
                                                                        Game {scoreIndex + 1}
                                                                    </p>


                                                                    <p className="text-lg font-bold text-slate-800">

                                                                        <span
                                                                            className={
                                                                                score.teamA >
                                                                                score.teamB
                                                                                    ? 'text-[#34C759]'
                                                                                    : ''
                                                                            }
                                                                        >
                                                                            {score.teamA}
                                                                        </span>

                                                                        <span className="mx-2 text-gray-300">
                                                                            -
                                                                        </span>

                                                                        <span
                                                                            className={
                                                                                score.teamB >
                                                                                score.teamA
                                                                                    ? 'text-[#34C759]'
                                                                                    : ''
                                                                            }
                                                                        >
                                                                            {score.teamB}
                                                                        </span>

                                                                    </p>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                ) : (

                                                    <p className="text-xs text-slate-400 text-center">
                                                        No score recorded
                                                    </p>

                                                )}

                                            </div>



                                            {/* ========================= */}
                                            {/* TEAM B */}
                                            {/* ========================= */}

                                            <div
                                                className={`
                                                    rounded-xl p-4 border

                                                    ${
                                                        match.winnerTeam === 'B'
                                                            ? 'bg-green-50 border-[#34C759]'
                                                            : 'bg-slate-50 border-transparent'
                                                    }
                                                `}
                                            >

                                                <div className="flex items-center justify-between gap-3 mb-3">

                                                    <p className="text-xs font-semibold text-slate-400 uppercase">

                                                        {session.gameType === 'Doubles'
                                                            ? 'Team 2'
                                                            : 'Player 2'
                                                        }

                                                    </p>


                                                    {match.winnerTeam === 'B' && (

                                                        <span className="px-2.5 py-1 rounded-full bg-[#34C759] text-white text-xs font-semibold">
                                                            Winner
                                                        </span>

                                                    )}

                                                </div>


                                                <div className="space-y-3">

                                                    {(
                                                        match.teamB?.length > 0

                                                            ? match.teamB

                                                            : match.players?.slice(

                                                                session.gameType === 'Doubles'
                                                                    ? 2
                                                                    : 1,

                                                                session.gameType === 'Doubles'
                                                                    ? 4
                                                                    : 2
                                                            )

                                                    )?.map(player => (

                                                        <div
                                                            key={player._id}
                                                            className="flex items-center gap-3"
                                                        >

                                                            <div className="w-9 h-9 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] font-bold shrink-0">

                                                                {player.firstName
                                                                    ?.charAt(0)
                                                                    .toUpperCase()}

                                                            </div>


                                                            <div className="min-w-0">

                                                                <p className="text-sm font-semibold text-slate-800">

                                                                    {player.firstName}{' '}
                                                                    {player.lastName}

                                                                </p>

                                                                <p className="text-xs text-slate-400">
                                                                    @{player.username}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    ))}

                                                </div>

                                            </div>

                                        </div>


                                        {match.finishedAt && (

                                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">

                                                {/* STARTED */}

                                                {match.startedAt && (

                                                    <span>

                                                        Started{' '}

                                                        {new Date(
                                                            match.startedAt
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }
                                                        )}

                                                    </span>

                                                )}


                                                {/* FINISHED */}

                                                <span>

                                                    Finished{' '}

                                                    {new Date(
                                                        match.finishedAt
                                                    ).toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }
                                                    )}

                                                </span>


                                                {/* DURATION */}

                                                {formatMatchDuration(
                                                    match.startedAt,
                                                    match.finishedAt
                                                ) && (

                                                    <span className="font-semibold text-slate-500">

                                                        Duration:{' '}

                                                        {formatMatchDuration(
                                                            match.startedAt,
                                                            match.finishedAt
                                                        )}

                                                    </span>

                                                )}

                                            </div>

                                        )}

                                    </div>

                                )
                                    )}


                                </>

                            ) : (

                                <div className="p-8 text-center text-slate-500">
                                    No completed matches yet.
                                </div>

                            )}

                </div>
                        
            </div>

                </>

            )}

            {activeTab === 'players' && (

                <>

            {/* PLAYER STATISTICS */}

            <div className="mt-8">

                <h2 className="text-xl font-semibold text-slate-950 mb-5">
                    Player Statistics
                </h2>


                {stats && (

                    <>
                        <div className="grid md:grid-cols-3 gap-4 mb-5">

                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Participants
                                </p>

                                <p className="text-xl font-semibold text-slate-950 mt-1">
                                    {stats.totalParticipants}
                                </p>

                            </div>


                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Total Matches
                                </p>

                                <p className="text-xl font-semibold text-slate-950 mt-1">
                                    {stats.totalMatches}
                                </p>

                            </div>


                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Finished Matches
                                </p>

                                <p className="text-xl font-semibold text-slate-950 mt-1">
                                    {stats.finishedMatches}
                                </p>

                            </div>

                        </div>


                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                            {stats.playerStats?.length > 0 ? (

                                stats.playerStats.map(
                                    (player, index) => (

                                        <div
                                            key={player._id}
                                            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 p-5 border-b last:border-b-0 border-slate-200"
                                        >

                                            <div className="flex items-center gap-4">

                                                <div className="w-8 font-bold text-slate-400">
                                                    #{index + 1}
                                                </div>


                                                <div className="w-11 h-11 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] font-bold">

                                                    {player.firstName
                                                        ?.charAt(0)
                                                        .toUpperCase()}

                                                </div>


                                                <div>

                                                    <p className="font-semibold text-slate-800">
                                                        {player.firstName}{' '}
                                                        {player.lastName}
                                                    </p>

                                                    <p className="text-sm text-slate-500">
                                                        @{player.username}
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="grid grid-cols-4 w-[320px] text-center shrink-0">

                                                {/* MATCHES */}

                                                <div className="w-20">

                                                    <p className="text-lg font-semibold text-slate-950">
                                                        {player.matchesPlayed}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Matches
                                                    </p>

                                                </div>


                                                {/* WINS */}

                                                <div className="w-20">

                                                    <p className="text-xl font-bold text-[#34C759]">
                                                        {player.wins}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Wins
                                                    </p>

                                                </div>


                                                {/* LOSSES */}

                                                <div className="w-20">

                                                    <p className="text-xl font-bold text-red-500">
                                                        {player.losses}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Losses
                                                    </p>

                                                </div>


                                                {/* WIN RATE */}

                                                <div className="w-20">

                                                    <p className="text-lg font-semibold text-slate-950">
                                                        {player.winRate}%
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Win Rate
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )

                            ) : (

                                <div className="p-8 text-center text-slate-500">
                                    No player statistics yet.
                                </div>

                            )}

                        </div>

                    </>

                )}

            </div>

                </>

            )}

            </div>

        </div>

    )

}

export default QueueDetails