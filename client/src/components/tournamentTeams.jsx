import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

function TournamentTeams({
    tournamentId,
    players = [],
    isOwner,
    tournamentStatus,
    game
}) {

    const [teams, setTeams] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [saving, setSaving] =
        useState(false)


    useEffect(() => {

        fetchTeams()

    }, [
        tournamentId
    ])


    const fetchTeams =
        async () => {

        try {

            setLoading(true)

            const res =
                await axios.get(
                    `http://localhost:5000/api/tournaments/${tournamentId}/teams`
                )

            setTeams(
                res.data || []
            )

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to load teams'
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


    const assignedPlayerIds =
        useMemo(
            () =>
                new Set(
                    teams.flatMap(
                        team =>
                            (team.players || [])
                                .map(
                                    player =>
                                        player._id
                                )
                    )
                ),
            [teams]
        )


    const unassignedPlayers =
        useMemo(
            () =>
                players.filter(
                    player =>
                        !assignedPlayerIds.has(
                            player._id
                        )
                ),
            [
                players,
                assignedPlayerIds
            ]
        )


    const canManage =
        isOwner &&
        tournamentStatus !==
            'Ongoing' &&
        tournamentStatus !==
            'Finished'


    const openTeamForm =
        async team => {

            const editing =
                Boolean(
                    team
                )

            const currentPlayerIds =
                editing
                    ? (
                        team.players || []
                    ).map(
                        player =>
                            player._id
                    )
                    : []

            const selectablePlayers =
                players.filter(
                    player =>
                        currentPlayerIds.includes(
                            player._id
                        ) ||
                        !assignedPlayerIds.has(
                            player._id
                        )
                )

            if (
                selectablePlayers.length <
                2
            ) {

                toast.error(
                    'At least 2 unassigned players are required'
                )

                return

            }

            const options =
                selectablePlayers
                    .map(
                        player => `
                            <option value="${player._id}">
                                ${getPlayerName(player)}
                            </option>
                        `
                    )
                    .join('')

            const result =
                await Swal.fire({

                    title:
                        editing
                            ? 'Edit Team'
                            : 'Create Team',

                    html: `
                        <div style="text-align:left;">

                            <label style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                color:#4B5563;
                                margin-bottom:6px;
                            ">
                                Team Name
                            </label>

                            <input
                                id="team-name"
                                class="swal2-input"
                                style="
                                    width:100%;
                                    margin:0 0 16px 0;
                                "
                                placeholder="Optional"
                                value="${editing ? (team.name || '') : ''}"
                            />

                            <label style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                color:#4B5563;
                                margin-bottom:6px;
                            ">
                                Player 1
                            </label>

                            <select
                                id="team-player-1"
                                class="swal2-select"
                                style="
                                    width:100%;
                                    margin:0 0 16px 0;
                                "
                            >
                                <option value="">
                                    Select player
                                </option>
                                ${options}
                            </select>

                            <label style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                color:#4B5563;
                                margin-bottom:6px;
                            ">
                                Player 2
                            </label>

                            <select
                                id="team-player-2"
                                class="swal2-select"
                                style="
                                    width:100%;
                                    margin:0;
                                "
                            >
                                <option value="">
                                    Select player
                                </option>
                                ${options}
                            </select>

                            ${
                                game ===
                                'Mixed Doubles'
                                    ? `
                                        <p style="
                                            color:#6B7280;
                                            font-size:12px;
                                            margin-top:14px;
                                        ">
                                            Mixed Doubles uses manual pairing. Gender validation is not applied because the current user data does not provide a verified gender field.
                                        </p>
                                    `
                                    : ''
                            }

                        </div>
                    `,

                    showCancelButton:
                        true,

                    confirmButtonText:
                        editing
                            ? 'Save Changes'
                            : 'Create Team',

                    cancelButtonText:
                        'Cancel',

                    confirmButtonColor:
                        '#34C759',

                    cancelButtonColor:
                        '#9CA3AF',

                    didOpen: () => {

                        if (
                            editing &&
                            currentPlayerIds.length ===
                                2
                        ) {

                            document
                                .getElementById(
                                    'team-player-1'
                                )
                                .value =
                                    currentPlayerIds[0]

                            document
                                .getElementById(
                                    'team-player-2'
                                )
                                .value =
                                    currentPlayerIds[1]

                        }

                    },

                    preConfirm: () => {

                        const name =
                            document
                                .getElementById(
                                    'team-name'
                                )
                                ?.value
                                ?.trim() ||
                            ''

                        const player1 =
                            document
                                .getElementById(
                                    'team-player-1'
                                )
                                ?.value

                        const player2 =
                            document
                                .getElementById(
                                    'team-player-2'
                                )
                                ?.value

                        if (
                            !player1 ||
                            !player2
                        ) {

                            Swal.showValidationMessage(
                                'Select 2 players'
                            )

                            return false

                        }

                        if (
                            player1 ===
                            player2
                        ) {

                            Swal.showValidationMessage(
                                'Select 2 different players'
                            )

                            return false

                        }

                        return {
                            name,
                            playerIds: [
                                player1,
                                player2
                            ]
                        }

                    }

                })

            if (
                !result.isConfirmed
            ) {
                return
            }

            try {

                setSaving(
                    true
                )

                const token =
                    localStorage.getItem(
                        'token'
                    )

                if (editing) {

                    await axios.put(
                        `http://localhost:5000/api/tournaments/${tournamentId}/teams/${team._id}`,
                        result.value,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )

                    toast.success(
                        'Team updated successfully'
                    )

                } else {

                    await axios.post(
                        `http://localhost:5000/api/tournaments/${tournamentId}/teams`,
                        result.value,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )

                    toast.success(
                        'Team created successfully'
                    )

                }

                await fetchTeams()

            } catch (err) {

                toast.error(
                    err.response?.data?.message ||
                    'Failed to save team'
                )

            } finally {

                setSaving(
                    false
                )

            }

        }


    const removeTeam =
        async team => {

            const result =
                await Swal.fire({

                    title:
                        'Remove Team?',

                    text:
                        `${team.name || 'This team'} will be removed. The players will become unassigned.`,

                    icon:
                        'warning',

                    showCancelButton:
                        true,

                    confirmButtonText:
                        'Remove',

                    cancelButtonText:
                        'Cancel',

                    confirmButtonColor:
                        '#EF4444',

                    cancelButtonColor:
                        '#9CA3AF'

                })

            if (
                !result.isConfirmed
            ) {
                return
            }

            try {

                const token =
                    localStorage.getItem(
                        'token'
                    )

                await axios.delete(
                    `http://localhost:5000/api/tournaments/${tournamentId}/teams/${team._id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )

                toast.success(
                    'Team removed successfully'
                )

                await fetchTeams()

            } catch (err) {

                toast.error(
                    err.response?.data?.message ||
                    'Failed to remove team'
                )

            }

        }


    if (loading) {

        return (

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-gray-500">
                Loading teams...
            </div>

        )

    }


    return (

        <div className="space-y-6">

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                        <h2 className="text-2xl font-bold text-gray-700">
                            Teams
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {teams.length} team{teams.length === 1 ? '' : 's'} · {unassignedPlayers.length} unassigned player{unassignedPlayers.length === 1 ? '' : 's'}
                        </p>

                    </div>


                    {canManage && (

                        <button
                            type="button"
                            onClick={() =>
                                openTeamForm(
                                    null
                                )
                            }
                            disabled={
                                saving ||
                                unassignedPlayers.length <
                                    2
                            }
                            className="px-5 py-2.5 rounded-xl bg-[#34C759] hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
                        >
                            + Create Team
                        </button>

                    )}

                </div>


                {game ===
                    'Mixed Doubles' && (

                    <div className="mt-4 rounded-xl bg-[#F8F8F8] border border-[#E5E7EB] px-4 py-3 text-sm text-gray-500">
                        Mixed Doubles currently uses manual team pairing. The system does not automatically check gender because the current player records do not provide a verified gender field.
                    </div>

                )}

            </div>


            {teams.length >
            0 ? (

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

                    {teams.map(
                        (
                            team,
                            index
                        ) => (

                        <div
                            key={
                                team._id
                            }
                            className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden"
                        >

                            <div className="px-5 py-4 bg-[#F8F8F8] border-b border-[#E5E7EB] flex items-center justify-between gap-3">

                                <div>

                                    <p className="text-xs font-semibold text-gray-400">
                                        TEAM {index + 1}
                                    </p>

                                    <h3 className="font-bold text-gray-700 mt-1">
                                        {team.name ||
                                        `Team ${index + 1}`}
                                    </h3>

                                </div>


                                {canManage && (

                                    <div className="flex gap-2">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openTeamForm(
                                                    team
                                                )
                                            }
                                            className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-gray-500 hover:border-[#34C759] hover:text-[#34C759] cursor-pointer"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeTeam(
                                                    team
                                                )
                                            }
                                            className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 cursor-pointer"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                )}

                            </div>


                            <div className="p-5 space-y-3">

                                {(team.players || [])
                                    .map(
                                        player => (

                                    <div
                                        key={
                                            player._id
                                        }
                                        className="rounded-xl border border-[#E5E7EB] bg-[#F8F8F8] px-4 py-3"
                                    >

                                        <p className="font-semibold text-gray-700">
                                            {getPlayerName(
                                                player
                                            )}
                                        </p>

                                        {player.username && (

                                            <p className="text-xs text-gray-400 mt-1">
                                                @{player.username}
                                            </p>

                                        )}

                                    </div>

                                ))}

                            </div>

                        </div>

                    ))}

                </div>

            ) : (

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                    <h3 className="text-xl font-bold text-gray-700">
                        No Teams Yet
                    </h3>

                    <p className="text-gray-500 mt-2">
                        Pair the registered players before starting this tournament.
                    </p>

                </div>

            )}


            {unassignedPlayers.length >
            0 && (

                <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

                    <div className="px-5 py-4 border-b border-[#E5E7EB]">

                        <h3 className="font-bold text-gray-700">
                            Unassigned Players
                        </h3>

                    </div>

                    <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

                        {unassignedPlayers.map(
                            player => (

                            <div
                                key={
                                    player._id
                                }
                                className="rounded-xl border border-[#E5E7EB] bg-[#F8F8F8] px-4 py-3"
                            >

                                <p className="font-semibold text-gray-700">
                                    {getPlayerName(
                                        player
                                    )}
                                </p>

                                {player.username && (

                                    <p className="text-xs text-gray-400 mt-1">
                                        @{player.username}
                                    </p>

                                )}

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </div>

    )

}

export default TournamentTeams
