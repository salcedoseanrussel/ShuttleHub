import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import TournamentBracket from '../components/tournamentBracket'
import RoundRobinMatches from '../components/roundRobinMatches'
import RoundRobinStandings from '../components/roundRobinStandings'
import TournamentTeams from '../components/tournamentTeams'

function TournamentDetails(){

    const { id } = useParams()
    const navigate = useNavigate()

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    const [tournament, setTournament] =
        useState(null)

    const [activeTab, setActiveTab] =
        useState('matches')

    const [selectedPlayer, setSelectedPlayer] =
        useState(null)

    const [playerSearch, setPlayerSearch] =
        useState('')

    const [playerSort, setPlayerSort] =
        useState('name-asc')


    // ==========================
    // LOAD TOURNAMENT
    // ==========================

    useEffect(() => {

        fetchTournament()

    }, [id])


    const fetchTournament = async () => {

        try {

            const res = await axios.get(
                `http://localhost:5000/api/tournaments/${id}`
            )

            setTournament(res.data)

        } catch (err) {

            console.error(
                'LOAD TOURNAMENT ERROR:',
                err
            )

            toast.error(
                err.response?.data?.message ||
                'Failed to load tournament'
            )

        }

    }


    // ==========================
    // DELETE TOURNAMENT
    // ==========================

    const handleDelete = async () => {

        const result = await Swal.fire({
            title: 'Delete Tournament?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
        })

        if (!result.isConfirmed) return


        try {

            const token =
                localStorage.getItem('token')

            await axios.delete(
                `http://localhost:5000/api/tournaments/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )

            toast.success(
                'Tournament deleted successfully.'
            )

            navigate('/tournaments')

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Delete failed'
            )

        }

    }


    // ==========================
    // JOIN TOURNAMENT
    // ==========================

    const handleJoinTournament = async () => {

        try {

            const token =
                localStorage.getItem('token')

            const res = await axios.post(
                `http://localhost:5000/api/tournaments/join/${id}`,
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

            await fetchTournament()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to join tournament'
            )

        }

    }


    // ==========================
    // LEAVE TOURNAMENT
    // ==========================

    const handleLeaveTournament = async () => {

        const result = await Swal.fire({
            title: 'Leave Tournament?',
            text: 'You will lose your registration for this tournament.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Leave Tournament',
            cancelButtonText: 'Stay'
        })

        if (!result.isConfirmed) return


        try {

            const token =
                localStorage.getItem('token')

            const res = await axios.post(
                `http://localhost:5000/api/tournaments/leave/${id}`,
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

            await fetchTournament()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to leave tournament'
            )

        }

    }


    // ==========================
    // REMOVE PLAYER
    // ==========================

    const handleRemovePlayer = async player => {

        const result = await Swal.fire({
            title: 'Remove Player?',
            text:
                `${player.firstName} ${player.lastName} will be removed from this tournament.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Remove Player',
            cancelButtonText: 'Cancel'
        })

        if (!result.isConfirmed) return


        try {

            const token =
                localStorage.getItem('token')

            const res = await axios.delete(
                `http://localhost:5000/api/tournaments/${id}/participants/${player._id}`,
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

            setSelectedPlayer(null)

            await fetchTournament()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to remove player'
            )

        }

    }


    // ==========================
    // START TOURNAMENT
    // ==========================

    const handleStartTournament = async () => {

        const requiredPlayers =
            tournament?.game === 'Singles'
                ? 2
                : 4

        const participantCount =
            tournament?.players?.length || 0


        if (
            participantCount <
            requiredPlayers
        ) {

            toast.error(
                `${requiredPlayers} players are required to start this ${tournament?.game} tournament`
            )

            return

        }


        const result = await Swal.fire({
            title: 'Start Tournament?',
            html: `
                <div style="text-align:left;">
                    <p>
                        <strong>${tournament.title}</strong>
                    </p>

                    <p style="margin-top:8px;">
                        Players: ${participantCount}
                    </p>

                    <p style="margin-top:4px;">
                        Format: ${tournament.format || 'Not specified'}
                    </p>

                    <p style="margin-top:12px;color:#6B7280;">
                        Registration changes will stop after the tournament starts.
                    </p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#34C759',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Start Tournament',
            cancelButtonText: 'Cancel'
        })

        if (!result.isConfirmed) return


        try {

            const token =
                localStorage.getItem('token')

            const res = await axios.put(
                `http://localhost:5000/api/tournaments/${id}/start`,
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

            setActiveTab('matches')

            await fetchTournament()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to start tournament'
            )

        }

    }


    // ==========================
    // FINISH TOURNAMENT
    // ==========================

    const handleFinishTournament = async () => {

        const result = await Swal.fire({
            title: 'Finish Tournament?',
            text:
                'The tournament will be marked as completed.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#34C759',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Finish Tournament',
            cancelButtonText: 'Cancel'
        })

        if (!result.isConfirmed) return


        try {

            const token =
                localStorage.getItem('token')

            const res = await axios.put(
                `http://localhost:5000/api/tournaments/${id}/finish`,
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

            await fetchTournament()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to finish tournament'
            )

        }

    }


    // ==========================
    // LOADING
    // ==========================

    if (!tournament) {

        return (
            <div className="p-8 text-gray-500">
                Loading tournament...
            </div>
        )

    }


    // ==========================
    // PAGE VALUES
    // ==========================

    const registrationClosed =
        tournament.registrationDeadline &&
        new Date() >
            new Date(
                tournament.registrationDeadline
            )


    const hasJoined =
        tournament.players?.some(
            player =>
                player?._id === user?.id
        ) || false


    const isOwner =
        user?.id ===
        tournament.organizer?._id


    const isFull =
        (tournament.players?.length || 0) >=
        tournament.maxPlayers


    let displayStatus =
        tournament.status


    if (
        tournament.status === 'Open' &&
        isFull
    ) {

        displayStatus = 'Full'

    }


    const canEdit =
        isOwner &&
        (
            displayStatus === 'Open' ||
            displayStatus === 'Closed' ||
            displayStatus === 'Full'
        )


    const canStart =
        isOwner &&
        (
            displayStatus === 'Open' ||
            displayStatus === 'Closed' ||
            displayStatus === 'Full'
        )


    const canRemovePlayers =
        isOwner &&
        tournament.status !== 'Ongoing' &&
        tournament.status !== 'Finished'


    const filteredPlayers =
        [...(tournament.players || [])]
            .filter(player => {

                if (!playerSearch.trim()) {
                    return true
                }

                const search =
                    playerSearch.toLowerCase()

                return (
                    player.firstName
                        ?.toLowerCase()
                        .includes(search) ||
                    player.lastName
                        ?.toLowerCase()
                        .includes(search) ||
                    player.username
                        ?.toLowerCase()
                        .includes(search)
                )

            })
            .sort((a, b) => {

                const nameA =
                    `${a.firstName || ''} ${a.lastName || ''}`.trim()

                const nameB =
                    `${b.firstName || ''} ${b.lastName || ''}`.trim()


                if (
                    playerSort ===
                    'name-asc'
                ) {

                    return nameA.localeCompare(
                        nameB
                    )

                }


                if (
                    playerSort ===
                    'name-desc'
                ) {

                    return nameB.localeCompare(
                        nameA
                    )

                }


                if (
                    playerSort ===
                    'username-asc'
                ) {

                    return (
                        a.username || ''
                    ).localeCompare(
                        b.username || ''
                    )

                }


                if (
                    playerSort ===
                    'username-desc'
                ) {

                    return (
                        b.username || ''
                    ).localeCompare(
                        a.username || ''
                    )

                }


                return 0

            })


    return (

        <div className="min-h-screen bg-[#F8F8F8] p-8">


            {/* ========================= */}
            {/* TOURNAMENT HEADER */}
            {/* ========================= */}

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">

                <div className="flex flex-col lg:flex-row lg:justify-between gap-6">


                    {/* TITLE */}

                    <div>

                        <h1 className="text-3xl font-bold text-gray-700">
                            {tournament.title}
                        </h1>

                        <p className="text-gray-500 mt-2 max-w-3xl">
                            {tournament.description}
                        </p>

                        <p className="text-sm text-gray-400 mt-3">
                            Organized by @{tournament.organizer?.username}
                        </p>

                    </div>


                    {/* STATUS + OWNER ACTIONS */}

                    <div className="flex flex-wrap items-start gap-3">

                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                displayStatus === 'Open'
                                    ? 'bg-green-100 text-[#34C759]'
                                    : displayStatus === 'Ongoing'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : displayStatus === 'Full'
                                            ? 'bg-red-100 text-red-600'
                                            : displayStatus === 'Finished'
                                                ? 'bg-gray-200 text-gray-600'
                                                : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {displayStatus}
                        </span>


                        {canEdit && (

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/edit-tournament/${id}`
                                    )
                                }
                                className="px-4 py-2 rounded-xl border border-[#34C759] text-[#34C759] hover:bg-green-50 font-semibold cursor-pointer"
                            >
                                Edit
                            </button>

                        )}


                        {canStart && (

                            <button
                                type="button"
                                onClick={
                                    handleStartTournament
                                }
                                className="px-4 py-2 rounded-xl bg-[#34C759] hover:opacity-90 text-white font-semibold cursor-pointer"
                            >
                                Start Tournament
                            </button>

                        )}


                        {isOwner &&
                            displayStatus ===
                                'Ongoing' && (

                            <button
                                type="button"
                                onClick={
                                    handleFinishTournament
                                }
                                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold cursor-pointer"
                            >
                                Finish Tournament
                            </button>

                        )}


                        {isOwner &&
                            displayStatus !==
                                'Finished' && (

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer"
                            >
                                Delete
                            </button>

                        )}

                    </div>

                </div>


                {/* QUICK SUMMARY */}

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

                    <div className="bg-[#F8F8F8] rounded-xl p-5">

                        <p className="text-sm text-gray-400">
                            Game
                        </p>

                        <p className="text-lg font-semibold text-gray-700 mt-1">
                            {tournament.game}
                        </p>

                    </div>


                    <div className="bg-[#F8F8F8] rounded-xl p-5">

                        <p className="text-sm text-gray-400">
                            Format
                        </p>

                        <p className="text-lg font-semibold text-gray-700 mt-1">
                            {tournament.format ||
                                'Not specified'}
                        </p>

                    </div>


                    <div className="bg-[#F8F8F8] rounded-xl p-5">

                        <p className="text-sm text-gray-400">
                            Players
                        </p>

                        <p className="text-lg font-semibold text-gray-700 mt-1">
                            {tournament.players?.length || 0}
                            {' / '}
                            {tournament.maxPlayers}
                        </p>

                    </div>


                    <div className="bg-[#F8F8F8] rounded-xl p-5">

                        <p className="text-sm text-gray-400">
                            Tournament Date
                        </p>

                        <p className="text-lg font-semibold text-gray-700 mt-1">
                            {new Date(
                                tournament.startDate
                            ).toLocaleDateString()}
                        </p>

                    </div>

                </div>


                {/* PLAYER ACTION */}

                {user?.role === 'Player' &&
                    !isOwner && (

                    <div className="mt-6">

                        {hasJoined &&
                        displayStatus ===
                            'Open' ? (

                            <button
                                type="button"
                                onClick={
                                    handleLeaveTournament
                                }
                                className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer"
                            >
                                Leave Tournament
                            </button>

                        ) : (
                            !hasJoined &&
                            !isFull &&
                            displayStatus ===
                                'Open' &&
                            !registrationClosed && (

                                <button
                                    type="button"
                                    onClick={
                                        handleJoinTournament
                                    }
                                    className="px-6 py-3 rounded-xl bg-[#34C759] hover:opacity-90 text-white font-semibold cursor-pointer"
                                >
                                    Join Tournament
                                </button>

                            )
                        )}

                    </div>

                )}


                {registrationClosed &&
                    tournament.status ===
                        'Open' && (

                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5">

                        <p className="font-semibold text-yellow-700">
                            Registration is closed
                        </p>

                        <p className="text-sm text-yellow-700/80 mt-1">
                            New players can no longer join this tournament.
                        </p>

                    </div>

                )}


                {tournament.status ===
                    'Finished' && (

                    <div className="mt-6 bg-gray-100 border border-gray-200 rounded-xl p-5">

                        <p className="font-semibold text-gray-700">
                            This tournament has ended
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            The tournament bracket and results remain available below.
                        </p>

                    </div>

                )}

            </div>


            {/* ========================= */}
            {/* TOURNAMENT TABS */}
            {/* ========================= */}

            <div className="mt-8">

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-2">

                    <div className="flex flex-wrap gap-2">


                        {/* MATCHES */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    'matches'
                                )
                            }
                            className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                activeTab ===
                                'matches'
                                    ? 'bg-[#34C759] text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-[#F8F8F8] hover:text-gray-700'
                            }`}
                        >
                            Matches
                        </button>


                        {/* PLAYERS */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    'players'
                                )
                            }
                            className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                activeTab ===
                                'players'
                                    ? 'bg-[#34C759] text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-[#F8F8F8] hover:text-gray-700'
                            }`}
                        >
                            Players

                            <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab ===
                                    'players'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                            >
                                {tournament.players?.length ||
                                    0}
                            </span>

                        </button>


                        {/* TEAMS */}

                        {(tournament.game ===
                            'Doubles' ||
                            tournament.game ===
                            'Mixed Doubles') && (

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab(
                                        'teams'
                                    )
                                }
                                className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                    activeTab ===
                                    'teams'
                                        ? 'bg-[#34C759] text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-[#F8F8F8] hover:text-gray-700'
                                }`}
                            >
                                Teams
                            </button>

                        )}


                        {/* STANDINGS */}

                        {tournament.format ===
                            'Round Robin' && (

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab(
                                        'standings'
                                    )
                                }
                                className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                    activeTab ===
                                    'standings'
                                        ? 'bg-[#34C759] text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-[#F8F8F8] hover:text-gray-700'
                                }`}
                            >
                                Standings
                            </button>

                        )}


                        {/* DETAILS */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    'details'
                                )
                            }
                            className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                activeTab ===
                                'details'
                                    ? 'bg-[#34C759] text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-[#F8F8F8] hover:text-gray-700'
                            }`}
                        >
                            Tournament Details
                        </button>

                    </div>

                </div>

            </div>


            {/* ========================= */}
            {/* MATCHES TAB */}
            {/* ========================= */}

            {activeTab === 'matches' && (

                <div className="mt-8">

                    {tournament.format ===
                    'Single Elimination' ? (

                        tournament.status ===
                            'Ongoing' ||
                        tournament.status ===
                            'Finished' ? (

                            <TournamentBracket
                                tournamentId={id}
                                isOwner={
                                    isOwner
                                }
                                tournamentStatus={
                                    tournament.status
                                }
                                onTournamentUpdated={
                                    fetchTournament
                                }
                            />

                        ) : (

                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                                <h2 className="text-2xl font-bold text-gray-700">
                                    Tournament Matches
                                </h2>

                                <p className="text-gray-500 mt-2">
                                    The bracket will be generated when the tournament starts.
                                </p>

                            </div>

                        )

                    ) : tournament.format ===
                        'Round Robin' ? (

                        tournament.status ===
                            'Ongoing' ||
                        tournament.status ===
                            'Finished' ? (

                            <RoundRobinMatches
                                tournamentId={id}
                                isOwner={isOwner}
                                tournamentStatus={
                                    tournament.status
                                }
                                onTournamentUpdated={
                                    fetchTournament
                                }
                            />

                        ) : (

                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                                <h2 className="text-2xl font-bold text-gray-700">
                                    Round Robin Matches
                                </h2>

                                <p className="text-gray-500 mt-2">
                                    All player-versus-player matches will be generated when the tournament starts.
                                </p>

                            </div>

                        )

                    ) : (

                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                            <h2 className="text-2xl font-bold text-gray-700">
                                Tournament Matches
                            </h2>

                            <p className="text-gray-500 mt-2">
                                This tournament format is not supported yet.
                            </p>

                        </div>

                    )}

                </div>

            )}


            {/* ========================= */}
            {/* PLAYERS TAB */}
            {/* ========================= */}

            {activeTab === 'players' && (

                <div className="mt-8 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

                    <div className="p-6 border-b border-[#E5E7EB]">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-700">
                                    Registered Players
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    {tournament.players?.length ||
                                        0}
                                    {' '}player(s) registered
                                </p>

                            </div>


                            <div className="flex flex-col sm:flex-row gap-3">

                                <input
                                    type="text"
                                    value={
                                        playerSearch
                                    }
                                    onChange={e =>
                                        setPlayerSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search players..."
                                    className="px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#34C759]"
                                />


                                <select
                                    value={
                                        playerSort
                                    }
                                    onChange={e =>
                                        setPlayerSort(
                                            e.target.value
                                        )
                                    }
                                    className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 focus:outline-none focus:border-[#34C759] cursor-pointer"
                                >

                                    <option value="name-asc">
                                        Name A-Z
                                    </option>

                                    <option value="name-desc">
                                        Name Z-A
                                    </option>

                                    <option value="username-asc">
                                        Username A-Z
                                    </option>

                                    <option value="username-desc">
                                        Username Z-A
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>


                    <div className="p-6">

                        {filteredPlayers.length >
                        0 ? (

                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

                                {filteredPlayers.map(
                                    player => (

                                    <div
                                        key={
                                            player._id
                                        }
                                        className="bg-[#F8F8F8] border border-[#E5E7EB] rounded-xl p-4"
                                    >

                                        <div className="flex items-center gap-4">

                                            <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center font-bold text-[#34C759] shrink-0">

                                                {player.firstName
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p className="font-semibold text-gray-700 truncate">
                                                    {player.firstName}
                                                    {' '}
                                                    {player.lastName}
                                                </p>

                                                <p className="text-sm text-gray-500 truncate">
                                                    @{player.username}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex gap-2 mt-4">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedPlayer(
                                                        player
                                                    )
                                                }
                                                className="flex-1 px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-gray-600 hover:border-[#34C759] hover:text-[#34C759] text-sm font-semibold transition cursor-pointer"
                                            >
                                                View
                                            </button>


                                            {canRemovePlayers && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemovePlayer(
                                                            player
                                                        )
                                                    }
                                                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition cursor-pointer"
                                                >
                                                    Remove
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                ))}

                            </div>

                        ) : (

                            <div className="py-12 text-center text-gray-500">
                                No players found.
                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* TEAMS TAB */}
            {/* ========================= */}

            {activeTab === 'teams' &&
                (
                    tournament.game ===
                        'Doubles' ||
                    tournament.game ===
                        'Mixed Doubles'
                ) && (

                <div className="mt-8">

                    <TournamentTeams
                        tournamentId={id}
                        players={
                            tournament.players ||
                            []
                        }
                        isOwner={
                            isOwner
                        }
                        tournamentStatus={
                            tournament.status
                        }
                        game={
                            tournament.game
                        }
                    />

                </div>

            )}


            {/* ========================= */}
            {/* STANDINGS TAB */}
            {/* ========================= */}

            {activeTab === 'standings' &&
                tournament.format ===
                    'Round Robin' && (

                <div className="mt-8">

                    {tournament.status ===
                        'Ongoing' ||
                    tournament.status ===
                        'Finished' ? (

                        <RoundRobinStandings
                            tournamentId={id}
                            tournamentStatus={
                                tournament.status
                            }
                        />

                    ) : (

                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                            <h2 className="text-2xl font-bold text-gray-700">
                                Standings
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Standings will be available after the Round Robin tournament starts.
                            </p>

                        </div>

                    )}

                </div>

            )}


            {/* ========================= */}
            {/* DETAILS TAB */}
            {/* ========================= */}

            {activeTab === 'details' && (

                <div className="mt-8 bg-white border border-[#E5E7EB] rounded-2xl p-8">

                    <h2 className="text-2xl font-bold text-gray-700">
                        Tournament Information
                    </h2>

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Organizer
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">
                                @{tournament.organizer?.username}
                            </p>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Location
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">
                                {tournament.location}
                            </p>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Game
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">
                                {tournament.game}
                            </p>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Tournament Format
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">
                                {tournament.format ||
                                    'Not specified'}
                            </p>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Tournament Date
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">
                                {new Date(
                                    tournament.startDate
                                ).toLocaleDateString()}
                            </p>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Registration Deadline
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">

                                {tournament.registrationDeadline
                                    ? new Date(
                                        tournament.registrationDeadline
                                    ).toLocaleDateString()
                                    : 'None'}

                            </p>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Maximum Participants
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">
                                {tournament.maxPlayers}
                            </p>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Started
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">

                                {tournament.startedAt
                                    ? new Date(
                                        tournament.startedAt
                                    ).toLocaleString()
                                    : 'Not started'}

                            </p>

                        </div>


                        <div className="bg-[#F8F8F8] rounded-xl p-5">

                            <p className="text-sm text-gray-400">
                                Finished
                            </p>

                            <p className="text-lg font-semibold text-gray-700 mt-1">

                                {tournament.finishedAt
                                    ? new Date(
                                        tournament.finishedAt
                                    ).toLocaleString()
                                    : 'Not finished'}

                            </p>

                        </div>

                    </div>


                    <div className="mt-6 bg-[#F8F8F8] rounded-xl p-5">

                        <p className="text-sm text-gray-400">
                            Description
                        </p>

                        <p className="text-gray-700 mt-2 whitespace-pre-line">
                            {tournament.description}
                        </p>

                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* PLAYER INFORMATION MODAL */}
            {/* ========================= */}

            {selectedPlayer && (

                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
                    onClick={() =>
                        setSelectedPlayer(
                            null
                        )
                    }
                >

                    <div
                        className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-md p-6"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        <div className="flex items-start justify-between gap-4">

                            <div className="flex items-center gap-4">

                                <div className="w-16 h-16 rounded-full bg-[#34C759]/10 flex items-center justify-center text-2xl font-bold text-[#34C759]">

                                    {selectedPlayer.firstName
                                        ?.charAt(0)
                                        .toUpperCase()}

                                </div>


                                <div>

                                    <h2 className="text-xl font-bold text-gray-700">
                                        {selectedPlayer.firstName}
                                        {' '}
                                        {selectedPlayer.lastName}
                                    </h2>

                                    <p className="text-gray-500">
                                        @{selectedPlayer.username}
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedPlayer(
                                        null
                                    )
                                }
                                className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
                            >
                                ×
                            </button>

                        </div>


                        <div className="space-y-3 mt-6">

                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-sm text-gray-400">
                                    User ID
                                </p>

                                <p className="font-semibold text-gray-700 mt-1">
                                    {selectedPlayer.userId ||
                                        'Not available'}
                                </p>

                            </div>


                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-sm text-gray-400">
                                    Full Name
                                </p>

                                <p className="font-semibold text-gray-700 mt-1">
                                    {selectedPlayer.firstName}
                                    {' '}
                                    {selectedPlayer.lastName}
                                </p>

                            </div>


                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                <p className="text-sm text-gray-400">
                                    Username
                                </p>

                                <p className="font-semibold text-gray-700 mt-1">
                                    @{selectedPlayer.username}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setSelectedPlayer(
                                    null
                                )
                            }
                            className="w-full mt-6 px-6 py-3 rounded-xl bg-[#34C759] hover:opacity-90 text-white font-semibold cursor-pointer"
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

        </div>

    )

}

export default TournamentDetails
