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

    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const user =
        JSON.parse(
            localStorage.getItem('user')
        )

    const currentUserId =
        (user?._id || user?.id || '')
            .toString()

    const token =
        localStorage.getItem('token')

    useEffect(() => {
        fetchTeams()
    }, [tournamentId])

    const fetchTeams = async () => {

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

    const getPlayerId =
        player =>
            (player?._id || player?.id || '')
                .toString()

    const confirmedTeams =
        useMemo(
            () =>
                teams.filter(
                    team =>
                        team.status !== 'Pending'
                ),
            [teams]
        )

    const pendingTeams =
        useMemo(
            () =>
                teams.filter(
                    team =>
                        team.status === 'Pending'
                ),
            [teams]
        )

    const occupiedPlayerIds =
        useMemo(
            () => {

                const ids =
                    new Set()

                teams.forEach(team => {

                    ;(team.players || [])
                        .forEach(player => {
                            ids.add(
                                getPlayerId(player)
                            )
                        })

                    if (
                        team.status === 'Pending' &&
                        team.invitedPlayer
                    ) {
                        ids.add(
                            getPlayerId(
                                team.invitedPlayer
                            )
                        )
                    }

                })

                return ids

            },
            [teams]
        )

    const currentPlayer =
        players.find(
            player =>
                getPlayerId(player) ===
                currentUserId
        )

    const isRegisteredPlayer =
        user?.role === 'Player' &&
        Boolean(currentPlayer)

    const canChangeTeams =
        tournamentStatus !== 'Ongoing' &&
        tournamentStatus !== 'Finished'

    const canManage =
        isOwner &&
        canChangeTeams

    const myConfirmedTeam =
        confirmedTeams.find(
            team =>
                (team.players || [])
                    .some(
                        player =>
                            getPlayerId(player) ===
                            currentUserId
                    )
        )

    const mySentInvitation =
        pendingTeams.find(
            team =>
                getPlayerId(
                    team.createdBy
                ) === currentUserId
        )

    const myReceivedInvitation =
        pendingTeams.find(
            team =>
                getPlayerId(
                    team.invitedPlayer
                ) === currentUserId
        )

    const availablePartners =
        useMemo(
            () =>
                players.filter(
                    player => {

                        const id =
                            getPlayerId(player)

                        return (
                            id !== currentUserId &&
                            !occupiedPlayerIds.has(id)
                        )

                    }
                ),
            [
                players,
                currentUserId,
                occupiedPlayerIds
            ]
        )

    const sendInvitation =
        async () => {

            if (
                !isRegisteredPlayer ||
                !canChangeTeams ||
                myConfirmedTeam ||
                mySentInvitation ||
                myReceivedInvitation
            ) {
                return
            }

            if (
                availablePartners.length === 0
            ) {
                toast.error(
                    'No available registered players to invite'
                )
                return
            }

            const escapeHtml =
                value =>
                    String(value ?? '')
                        .replaceAll('&', '&amp;')
                        .replaceAll('<', '&lt;')
                        .replaceAll('>', '&gt;')
                        .replaceAll('"', '&quot;')
                        .replaceAll("'", '&#039;')

            const playerRows =
                availablePartners
                    .map(player => {

                        const id =
                            getPlayerId(player)

                        const name =
                            getPlayerName(player)

                        const username =
                            player.username || ''

                        const userId =
                            player.userId || ''

                        const searchText =
                            `${name} ${username} ${userId}`
                                .toLowerCase()

                        return `
                            <button
                                type="button"
                                class="partner-result"
                                data-player-id="${escapeHtml(id)}"
                                data-search="${escapeHtml(searchText)}"
                                style="
                                    width:100%;
                                    border:0;
                                    border-bottom:1px solid #F1F5F9;
                                    background:#FFFFFF;
                                    padding:12px 14px;
                                    text-align:left;
                                    cursor:pointer;
                                "
                            >
                                <div style="
                                    font-size:14px;
                                    font-weight:600;
                                    color:#0F172A;
                                ">
                                    ${escapeHtml(name)}
                                </div>

                                <div style="
                                    margin-top:3px;
                                    font-size:12px;
                                    color:#64748B;
                                ">
                                    ${username ? `@${escapeHtml(username)}` : ''}
                                    ${username && userId ? '&nbsp;•&nbsp;' : ''}
                                    ${userId ? escapeHtml(userId) : ''}
                                </div>
                            </button>
                        `

                    })
                    .join('')

            let selectedPartnerId = ''

            const result =
                await Swal.fire({

                    title:
                        'Invite a Partner',

                    width:
                        500,

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
                            />

                            <label style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                color:#4B5563;
                                margin-bottom:6px;
                            ">
                                Partner
                            </label>

                            <input
                                id="partner-search"
                                class="swal2-input"
                                style="
                                    width:100%;
                                    margin:0 0 10px 0;
                                "
                                placeholder="Search name, username, or User ID..."
                                autocomplete="off"
                            />

                            <div
                                id="partner-results"
                                style="
                                    max-height:300px;
                                    overflow-y:auto;
                                    border:1px solid #E2E8F0;
                                    border-radius:12px;
                                    background:#FFFFFF;
                                "
                            >
                                ${playerRows}
                            </div>

                            <p
                                id="partner-no-results"
                                style="
                                    display:none;
                                    padding:18px 8px;
                                    margin:0;
                                    text-align:center;
                                    font-size:13px;
                                    color:#64748B;
                                "
                            >
                                No available players found.
                            </p>

                        </div>
                    `,

                    didOpen: () => {

                        const popup =
                            Swal.getPopup()

                        const searchInput =
                            popup?.querySelector(
                                '#partner-search'
                            )

                        const rows =
                            Array.from(
                                popup?.querySelectorAll(
                                    '.partner-result'
                                ) || []
                            )

                        const noResults =
                            popup?.querySelector(
                                '#partner-no-results'
                            )

                        const selectRow =
                            selectedRow => {

                                selectedPartnerId =
                                    selectedRow.dataset.playerId || ''

                                rows.forEach(row => {

                                    const selected =
                                        row === selectedRow

                                    row.style.background =
                                        selected
                                            ? '#F0FDF4'
                                            : '#FFFFFF'

                                })

                            }

                        rows.forEach(row => {

                            row.addEventListener(
                                'click',
                                () =>
                                    selectRow(row)
                            )

                        })

                        searchInput?.addEventListener(
                            'input',
                            event => {

                                const query =
                                    event.target.value
                                        .trim()
                                        .toLowerCase()

                                let visibleCount = 0

                                rows.forEach(row => {

                                    const matches =
                                        !query ||
                                        (
                                            row.dataset.search ||
                                            ''
                                        ).includes(query)

                                    row.style.display =
                                        matches
                                            ? 'flex'
                                            : 'none'

                                    if (matches) {
                                        visibleCount += 1
                                    }

                                })

                                if (noResults) {

                                    noResults.style.display =
                                        visibleCount === 0
                                            ? 'block'
                                            : 'none'

                                }

                            }
                        )

                    },

                    showCancelButton:
                        true,

                    confirmButtonText:
                        'Send Invitation',

                    confirmButtonColor:
                        '#34C759',

                    preConfirm: () => {

                        const name =
                            document
                                .getElementById(
                                    'team-name'
                                )
                                ?.value
                                ?.trim()

                        if (!selectedPartnerId) {

                            Swal.showValidationMessage(
                                'Select a partner'
                            )

                            return false
                        }

                        return {
                            partnerId:
                                selectedPartnerId,
                            name
                        }

                    }

                })

            if (!result.isConfirmed) {
                return
            }

            try {

                setSaving(true)

                const res =
                    await axios.post(
                        `http://localhost:5000/api/tournaments/${tournamentId}/teams/invite`,
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

                await fetchTeams()

            } catch (err) {

                toast.error(
                    err.response?.data?.message ||
                    'Failed to send invitation'
                )

            } finally {

                setSaving(false)

            }

        }

    const respondToInvitation =
        async (
            team,
            action
        ) => {

            try {

                setSaving(true)

                const res =
                    await axios.post(
                        `http://localhost:5000/api/tournaments/${tournamentId}/teams/${team._id}/${action}`,
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

                await fetchTeams()

            } catch (err) {

                toast.error(
                    err.response?.data?.message ||
                    `Failed to ${action} invitation`
                )

            } finally {

                setSaving(false)

            }

        }

    const removeMyTeam =
        async team => {

            const pending =
                team.status === 'Pending'

            const result =
                await Swal.fire({
                    title:
                        pending
                            ? 'Cancel Invitation?'
                            : 'Disband Team?',
                    text:
                        pending
                            ? 'The pending partner invitation will be cancelled.'
                            : 'Both players will become available for another team.',
                    icon:
                        'warning',
                    showCancelButton:
                        true,
                    confirmButtonText:
                        pending
                            ? 'Cancel Invitation'
                            : 'Disband Team',
                    confirmButtonColor:
                        '#EF4444'
                })

            if (!result.isConfirmed) {
                return
            }

            try {

                setSaving(true)

                const res =
                    await axios.delete(
                        `http://localhost:5000/api/tournaments/${tournamentId}/teams/${team._id}/player`,
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

                await fetchTeams()

            } catch (err) {

                toast.error(
                    err.response?.data?.message ||
                    'Failed to remove team'
                )

            } finally {

                setSaving(false)

            }

        }

    const openTeamForm =
        async team => {

            const editing =
                Boolean(team)

            const currentPlayerIds =
                editing
                    ? (
                        team.players || []
                    ).map(
                        player =>
                            getPlayerId(player)
                    )
                    : []

            const selectablePlayers =
                players.filter(
                    player =>
                        currentPlayerIds.includes(
                            getPlayerId(player)
                        ) ||
                        !occupiedPlayerIds.has(
                            getPlayerId(player)
                        )
                )

            if (
                selectablePlayers.length <
                2
            ) {

                toast.error(
                    'At least 2 available players are required'
                )

                return
            }

            const options =
                selectablePlayers
                    .map(
                        player => `
                            <option value="${getPlayerId(player)}">
                                ${getPlayerName(player)}
                                ${player.username ? ` (@${player.username})` : ''}
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
                                    margin:0 0 14px 0;
                                "
                            >
                                <option value="">
                                    Select Player 1
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
                                    Select Player 2
                                </option>
                                ${options}
                            </select>

                        </div>
                    `,

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

                    showCancelButton:
                        true,

                    confirmButtonText:
                        editing
                            ? 'Save Changes'
                            : 'Create Team',

                    confirmButtonColor:
                        '#34C759',

                    preConfirm: () => {

                        const name =
                            document
                                .getElementById(
                                    'team-name'
                                )
                                ?.value
                                ?.trim()

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
                                'Select both players'
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

            if (!result.isConfirmed) {
                return
            }

            try {

                setSaving(true)

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

                setSaving(false)

            }

        }

    const deleteTeam =
        async team => {

            const result =
                await Swal.fire({
                    title:
                        'Remove Team?',
                    text:
                        `${team.name || 'This team'} will be removed.`,
                    icon:
                        'warning',
                    showCancelButton:
                        true,
                    confirmButtonText:
                        'Remove',
                    confirmButtonColor:
                        '#EF4444'
                })

            if (!result.isConfirmed) {
                return
            }

            try {

                setSaving(true)

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

            } finally {

                setSaving(false)

            }

        }

    if (
        game !== 'Doubles' &&
        game !== 'Mixed Doubles'
    ) {
        return null
    }

    if (loading) {

        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
                Loading teams...
            </div>
        )

    }

    return (

        <div className="space-y-6">

            {isRegisteredPlayer && (

                <div className="bg-white border border-slate-200 rounded-2xl p-6">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                            <h2 className="text-xl font-bold text-slate-800">
                                Your Team
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Choose a registered player as your Doubles partner.
                            </p>

                        </div>

                        {!myConfirmedTeam &&
                            !mySentInvitation &&
                            !myReceivedInvitation &&
                            canChangeTeams && (

                            <button
                                type="button"
                                onClick={sendInvitation}
                                disabled={saving}
                                className="px-5 py-2.5 rounded-xl bg-[#34C759] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                            >
                                Invite a Partner
                            </button>

                        )}

                    </div>

                    {myConfirmedTeam && (

                        <div className="mt-5 p-4 rounded-xl bg-green-50 border border-green-200">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                <div>

                                    <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                                        Confirmed Team
                                    </p>

                                    <p className="font-bold text-slate-800 mt-1">
                                        {myConfirmedTeam.name}
                                    </p>

                                    <p className="text-sm text-slate-600 mt-1">
                                        {(myConfirmedTeam.players || [])
                                            .map(getPlayerName)
                                            .join(' & ')}
                                    </p>

                                </div>

                                {canChangeTeams && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeMyTeam(
                                                myConfirmedTeam
                                            )
                                        }
                                        className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 cursor-pointer"
                                    >
                                        Leave / Disband
                                    </button>

                                )}

                            </div>

                        </div>

                    )}

                    {mySentInvitation && (

                        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">

                            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                Invitation Pending
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">
                                Waiting for {getPlayerName(mySentInvitation.invitedPlayer)}
                            </p>

                            {canChangeTeams && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeMyTeam(
                                            mySentInvitation
                                        )
                                    }
                                    className="mt-3 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 cursor-pointer"
                                >
                                    Cancel Invitation
                                </button>

                            )}

                        </div>

                    )}

                    {myReceivedInvitation && (

                        <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200">

                            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                                Partner Invitation
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">
                                {getPlayerName(myReceivedInvitation.createdBy)} invited you to join {myReceivedInvitation.name}.
                            </p>

                            {canChangeTeams && (

                                <div className="flex gap-2 mt-4">

                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() =>
                                            respondToInvitation(
                                                myReceivedInvitation,
                                                'accept'
                                            )
                                        }
                                        className="px-4 py-2 rounded-lg bg-[#34C759] text-white text-sm font-semibold disabled:opacity-50 cursor-pointer"
                                    >
                                        Accept
                                    </button>

                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() =>
                                            respondToInvitation(
                                                myReceivedInvitation,
                                                'decline'
                                            )
                                        }
                                        className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold disabled:opacity-50 cursor-pointer"
                                    >
                                        Decline
                                    </button>

                                </div>

                            )}

                        </div>

                    )}

                </div>

            )}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>

                        <h2 className="text-xl font-bold text-slate-800">
                            Teams
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            {confirmedTeams.length} confirmed team{confirmedTeams.length === 1 ? '' : 's'}
                            {pendingTeams.length > 0
                                ? ` • ${pendingTeams.length} pending`
                                : ''}
                        </p>

                    </div>

                    {canManage && (

                        <button
                            type="button"
                            onClick={() =>
                                openTeamForm(null)
                            }
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-[#34C759] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                            Assign Team
                        </button>

                    )}

                </div>

                {confirmedTeams.length === 0 ? (

                    <div className="p-10 text-center text-slate-500">
                        No confirmed teams yet.
                    </div>

                ) : (

                    <div className="divide-y divide-slate-100">

                        {confirmedTeams.map(
                            team => (

                                <div
                                    key={team._id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                >

                                    <div>

                                        <p className="font-bold text-slate-800">
                                            {team.name || 'Team'}
                                        </p>

                                        <p className="text-sm text-slate-500 mt-1">
                                            {(team.players || [])
                                                .map(getPlayerName)
                                                .join(' & ')}
                                        </p>

                                    </div>

                                    {canManage && (

                                        <div className="flex gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openTeamForm(team)
                                                }
                                                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteTeam(team)
                                                }
                                                className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 cursor-pointer"
                                            >
                                                Remove
                                            </button>

                                        </div>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

            {isOwner &&
                pendingTeams.length > 0 && (

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                    <div className="p-6 border-b border-slate-200">

                        <h2 className="text-xl font-bold text-slate-800">
                            Pending Partner Invitations
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Players waiting for their selected partner to respond.
                        </p>

                    </div>

                    <div className="divide-y divide-slate-100">

                        {pendingTeams.map(
                            team => (

                                <div
                                    key={team._id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                >

                                    <div>

                                        <p className="font-semibold text-slate-800">
                                            {getPlayerName(team.createdBy)}
                                            {' → '}
                                            {getPlayerName(team.invitedPlayer)}
                                        </p>

                                        <p className="text-sm text-amber-600 mt-1">
                                            Waiting for response
                                        </p>

                                    </div>

                                    {canManage && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteTeam(team)
                                            }
                                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 cursor-pointer"
                                        >
                                            Remove
                                        </button>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}

        </div>

    )

}

export default TournamentTeams
