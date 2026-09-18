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

    const [myRegistration, setMyRegistration] =
        useState(null)

    const [paymentReference, setPaymentReference] =
        useState('')

    const [paymentReceipt, setPaymentReceipt] =
        useState(null)

    const [paymentSubmitting, setPaymentSubmitting] =
        useState(false)

    const [paymentRegistrations, setPaymentRegistrations] =
        useState([])

    const [loadingPayments, setLoadingPayments] =
        useState(false)

    const [receiptModal, setReceiptModal] =
        useState(null)

    const [paymentFilter, setPaymentFilter] =
        useState('All')


    // ==========================
    // LOAD TOURNAMENT
    // ==========================

    useEffect(() => {

        fetchTournament()

    }, [id])

    useEffect(() => {

        if (user?.role === 'Player') {
            fetchMyRegistration()
        }

    }, [id, user?.role])


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
    // PAYMENT REGISTRATION
    // ==========================

    const fetchMyRegistration = async () => {

        try {

            const token = localStorage.getItem('token')

            if (!token || user?.role !== 'Player') {
                setMyRegistration(null)
                return
            }

            const res = await axios.get(
                `http://localhost:5000/api/tournaments/${id}/registration`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setMyRegistration(
                res.data.registration || null
            )

        } catch (err) {

            console.error(
                'LOAD REGISTRATION ERROR:',
                err
            )

        }

    }

    const handleSubmitPayment = async () => {

        if (!paymentReference.trim()) {
            toast.error('Enter your payment reference number')
            return
        }

        if (!paymentReceipt) {
            toast.error('Upload your payment receipt')
            return
        }

        try {

            setPaymentSubmitting(true)

            const token = localStorage.getItem('token')
            const formData = new FormData()

            formData.append(
                'paymentReference',
                paymentReference.trim()
            )
            formData.append(
                'receipt',
                paymentReceipt
            )

            const res = await axios.post(
                `http://localhost:5000/api/tournaments/${id}/payment`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            toast.success(res.data.message)

            setPaymentReference('')
            setPaymentReceipt(null)

            const input = document.getElementById(
                'tournament-payment-receipt'
            )

            if (input) input.value = ''

            await fetchMyRegistration()
            await fetchTournament()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to submit payment'
            )

        } finally {

            setPaymentSubmitting(false)

        }

    }

    const fetchPaymentRegistrations = async () => {

        try {

            setLoadingPayments(true)

            const token = localStorage.getItem('token')

            const res = await axios.get(
                `http://localhost:5000/api/tournaments/${id}/registrations`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setPaymentRegistrations(res.data || [])

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to load payment registrations'
            )

        } finally {

            setLoadingPayments(false)

        }

    }

    const handleApprovePayment = async registration => {

        const result = await Swal.fire({
            title: 'Approve Payment?',
            text: 'The player will become a confirmed tournament participant.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#34C759',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Approve',
            cancelButtonText: 'Cancel'
        })

        if (!result.isConfirmed) return

        try {

            const token = localStorage.getItem('token')

            const res = await axios.put(
                `http://localhost:5000/api/tournaments/${id}/registrations/${registration._id}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            toast.success(res.data.message)

            await fetchPaymentRegistrations()
            await fetchTournament()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to approve payment'
            )

        }

    }

    const handleRejectPayment = async registration => {

        const result = await Swal.fire({
            title: 'Reject Payment?',
            input: 'textarea',
            inputLabel: 'Reason for rejection',
            inputPlaceholder: 'Example: Receipt is unclear or reference number does not match.',
            inputAttributes: {
                'aria-label': 'Rejection reason'
            },
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Reject Payment',
            cancelButtonText: 'Cancel',
            inputValidator: value => {
                if (!value?.trim()) {
                    return 'Please enter a rejection reason'
                }
                return undefined
            }
        })

        if (!result.isConfirmed) return

        try {

            const token = localStorage.getItem('token')

            const res = await axios.put(
                `http://localhost:5000/api/tournaments/${id}/registrations/${registration._id}/reject`,
                {
                    rejectionReason: result.value.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            toast.success(res.data.message)

            await fetchPaymentRegistrations()
            await fetchTournament()

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to reject payment'
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
            await fetchMyRegistration()

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
            text:
                tournament?.registrationType === 'Paid'
                    ? 'Your registration will be cancelled. Any refund must be handled manually by the organizer.'
                    : 'You will lose your registration for this tournament.',
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
            await fetchMyRegistration()

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
            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">
                <div className="bg-white border border-slate-200 rounded-2xl px-7 py-6 shadow-sm text-center">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>
                    <p className="text-sm font-medium text-slate-600">
                        Loading tournament...
                    </p>
                </div>
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


    const reservedCount =
        tournament.registrationSummary?.reservedCount ??
        (tournament.players?.length || 0)

    const isFull =
        reservedCount >=
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

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


            {/* ========================= */}
            {/* TOURNAMENT HEADER */}
            {/* ========================= */}

            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">

                <div className="flex flex-col lg:flex-row lg:justify-between gap-6">


                    {/* TITLE */}

                    <div>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                            {tournament.title}
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-3xl leading-relaxed">
                            {tournament.description}
                        </p>

                        <p className="text-sm text-slate-400 mt-3">
                            Organized by @{tournament.organizer?.username}
                        </p>

                    </div>


                    {/* STATUS + OWNER ACTIONS */}

                    <div className="flex flex-wrap items-start gap-3">

                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                displayStatus === 'Open'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : displayStatus === 'Ongoing'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : displayStatus === 'Full'
                                            ? 'bg-red-50 text-red-600 border border-red-100'
                                            : displayStatus === 'Finished'
                                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
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
                                className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-semibold cursor-pointer transition"
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
                                className="px-4 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm cursor-pointer transition"
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
                                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer transition"
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
                                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold cursor-pointer transition"
                            >
                                Delete
                            </button>

                        )}

                    </div>

                </div>


                {/* QUICK SUMMARY */}

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7">

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Game
                        </p>

                        <p className="text-base font-semibold text-slate-900 mt-1">
                            {tournament.game}
                        </p>

                    </div>


                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Format
                        </p>

                        <p className="text-base font-semibold text-slate-900 mt-1">
                            {tournament.format ||
                                'Not specified'}
                        </p>

                    </div>


                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Players
                        </p>

                        <p className="text-base font-semibold text-slate-900 mt-1">
                            {tournament.players?.length || 0}
                            {' / '}
                            {tournament.maxPlayers}
                        </p>

                    </div>


                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Tournament Date
                        </p>

                        <p className="text-base font-semibold text-slate-900 mt-1">
                            {new Date(
                                tournament.startDate
                            ).toLocaleDateString()}
                        </p>

                    </div>

                </div>


                {/* PLAYER ACTION */}

                {user?.role === 'Player' &&
                    !isOwner && (

                    <div className="mt-6 space-y-4">

                        {tournament.registrationType === 'Paid' && (

                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6">

                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Registration Fee
                                        </p>
                                        <p className="text-2xl font-bold text-slate-700 mt-1">
                                            ₱{Number(tournament.registrationFee || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="text-sm text-slate-600 md:text-right">
                                        <p className="font-semibold text-slate-700">
                                            {tournament.paymentInstructions?.method || 'Payment'}
                                        </p>
                                        <p>
                                            {tournament.paymentInstructions?.accountName}
                                        </p>
                                        <p>
                                            {tournament.paymentInstructions?.accountNumber}
                                        </p>
                                    </div>

                                </div>

                                {myRegistration &&
                                    myRegistration.registrationStatus !== 'Cancelled' && (
                                    <div className="mt-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                            myRegistration.paymentStatus === 'Paid'
                                                ? 'bg-green-100 text-emerald-700'
                                                : myRegistration.paymentStatus === 'Rejected'
                                                    ? 'bg-red-100 text-red-700'
                                                    : myRegistration.paymentStatus === 'For Verification'
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {myRegistration.paymentStatus}
                                        </span>
                                    </div>
                                )}

                                {myRegistration?.registrationStatus !== 'Cancelled' &&
                                    myRegistration?.paymentStatus === 'Rejected' && (
                                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="font-semibold text-red-700">
                                            Payment rejected
                                        </p>
                                        <p className="text-sm text-red-600 mt-1">
                                            {myRegistration.rejectionReason || 'Please submit a new payment receipt.'}
                                        </p>
                                    </div>
                                )}

                                {myRegistration?.registrationStatus !== 'Cancelled' &&
                                    myRegistration?.paymentStatus === 'For Verification' && (
                                    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
                                        <p className="font-semibold text-amber-700">
                                            Payment verification pending
                                        </p>
                                        <p className="text-sm text-amber-700/80 mt-1">
                                            The organizer will review your payment before your registration is confirmed.
                                        </p>
                                    </div>
                                )}

                                {myRegistration?.paymentStatus === 'Paid' &&
                                    myRegistration?.registrationStatus === 'Confirmed' && (
                                    <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                        <p className="font-semibold text-emerald-700">
                                            Registration confirmed
                                        </p>
                                        <p className="text-sm text-emerald-700/80 mt-1">
                                            Your payment has been approved and you are a confirmed participant.
                                        </p>
                                    </div>
                                )}

                                {myRegistration &&
                                    myRegistration.registrationStatus !== 'Cancelled' &&
                                    ['Pending Payment', 'Rejected'].includes(
                                        myRegistration.paymentStatus
                                    ) &&
                                    displayStatus === 'Open' &&
                                    !registrationClosed && (

                                    <div className="grid md:grid-cols-2 gap-4 mt-5">

                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">
                                                Payment Reference Number
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentReference}
                                                onChange={e => setPaymentReference(e.target.value)}
                                                placeholder="Enter transaction/reference number"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">
                                                Payment Receipt
                                            </label>
                                            <input
                                                id="tournament-payment-receipt"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={e => setPaymentReceipt(e.target.files?.[0] || null)}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <button
                                                type="button"
                                                onClick={handleSubmitPayment}
                                                disabled={paymentSubmitting}
                                                className="px-5 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm cursor-pointer transition disabled:opacity-50"
                                            >
                                                {paymentSubmitting
                                                    ? 'Submitting...'
                                                    : myRegistration.paymentStatus === 'Rejected'
                                                        ? 'Resubmit Payment'
                                                        : 'Submit Payment'}
                                            </button>
                                        </div>

                                    </div>

                                )}

                            </div>

                        )}

                        {!hasJoined &&
                            myRegistration?.registrationStatus === 'Pending' &&
                            displayStatus === 'Open' && (

                            <button
                                type="button"
                                onClick={handleLeaveTournament}
                                className="px-5 py-2.5 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 text-sm font-semibold cursor-pointer transition"
                            >
                                Cancel Registration
                            </button>

                        )}

                        {hasJoined &&
                        displayStatus === 'Open' ? (

                            <button
                                type="button"
                                onClick={handleLeaveTournament}
                                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold cursor-pointer transition"
                            >
                                Leave Tournament
                            </button>

                        ) : (
                            !hasJoined &&
                            (!myRegistration ||
                                myRegistration.registrationStatus === 'Cancelled') &&
                            !isFull &&
                            displayStatus === 'Open' &&
                            !registrationClosed && (

                                <button
                                    type="button"
                                    onClick={handleJoinTournament}
                                    className="px-5 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm cursor-pointer transition"
                                >
                                    {tournament.registrationType === 'Paid'
                                        ? `Register • ₱${Number(tournament.registrationFee || 0).toLocaleString()}`
                                        : 'Join Tournament'}
                                </button>

                            )
                        )}

                    </div>

                )}


                {registrationClosed &&
                    tournament.status ===
                        'Open' && (

                    <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">

                        <p className="font-semibold text-amber-700">
                            Registration is closed
                        </p>

                        <p className="text-sm text-amber-700/80 mt-1">
                            New players can no longer join this tournament.
                        </p>

                    </div>

                )}


                {tournament.status ===
                    'Finished' && (

                    <div className="mt-6 bg-slate-100 border border-slate-200 rounded-xl p-5">

                        <p className="font-semibold text-slate-700">
                            This tournament has ended
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            The tournament bracket and results remain available below.
                        </p>

                    </div>

                )}

            </div>


            {/* ========================= */}
            {/* TOURNAMENT TABS */}
            {/* ========================= */}

            <div className="mt-8">

                <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">

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
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            Players

                            <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab ===
                                    'players'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-500'
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
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                            >
                                Standings
                            </button>

                        )}


                        {/* PAYMENTS */}

                        {isOwner &&
                            tournament.registrationType === 'Paid' && (

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('payments')
                                    fetchPaymentRegistrations()
                                }}
                                className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                    activeTab === 'payments'
                                        ? 'bg-[#34C759] text-white shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                            >
                                Payments
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
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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

                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

                                <h2 className="text-2xl font-bold text-slate-700">
                                    Tournament Matches
                                </h2>

                                <p className="text-slate-500 mt-2">
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

                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

                                <h2 className="text-2xl font-bold text-slate-700">
                                    Round Robin Matches
                                </h2>

                                <p className="text-slate-500 mt-2">
                                    All player-versus-player matches will be generated when the tournament starts.
                                </p>

                            </div>

                        )

                    ) : (

                        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

                            <h2 className="text-2xl font-bold text-slate-700">
                                Tournament Matches
                            </h2>

                            <p className="text-slate-500 mt-2">
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

                <div className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden">

                    <div className="p-6 border-b border-slate-200">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            <div>

                                <h2 className="text-2xl font-bold text-slate-700">
                                    Registered Players
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
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
                                    className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#34C759]"
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
                                    className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#34C759] cursor-pointer"
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
                                        className="bg-slate-50 border border-slate-200 rounded-xl p-4"
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

                                                <p className="font-semibold text-slate-700 truncate">
                                                    {player.firstName}
                                                    {' '}
                                                    {player.lastName}
                                                </p>

                                                <p className="text-sm text-slate-500 truncate">
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
                                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#34C759] hover:text-[#34C759] text-sm font-semibold transition cursor-pointer"
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

                            <div className="py-12 text-center text-slate-500">
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

                        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

                            <h2 className="text-2xl font-bold text-slate-700">
                                Standings
                            </h2>

                            <p className="text-slate-500 mt-2">
                                Standings will be available after the Round Robin tournament starts.
                            </p>

                        </div>

                    )}

                </div>

            )}


            {/* ========================= */}
            {/* PAYMENTS TAB */}
            {/* ========================= */}

            {activeTab === 'payments' &&
                isOwner &&
                tournament.registrationType === 'Paid' && (() => {

                const activeRegistrations =
                    paymentRegistrations.filter(
                        registration =>
                            registration.registrationStatus !== 'Cancelled'
                    )

                const counts = {
                    All: activeRegistrations.length,
                    'Pending Payment': activeRegistrations.filter(
                        registration =>
                            registration.registrationStatus === 'Pending' &&
                            registration.paymentStatus === 'Pending Payment'
                    ).length,
                    'For Verification': activeRegistrations.filter(
                        registration =>
                            registration.registrationStatus === 'Pending' &&
                            registration.paymentStatus === 'For Verification'
                    ).length,
                    Confirmed: activeRegistrations.filter(
                        registration =>
                            registration.registrationStatus === 'Confirmed'
                    ).length,
                    Rejected: activeRegistrations.filter(
                        registration =>
                            registration.registrationStatus === 'Rejected' ||
                            registration.paymentStatus === 'Rejected'
                    ).length
                }

                const filteredRegistrations =
                    activeRegistrations.filter(registration => {

                        if (paymentFilter === 'All') {
                            return true
                        }

                        if (paymentFilter === 'Confirmed') {
                            return registration.registrationStatus === 'Confirmed'
                        }

                        if (paymentFilter === 'Rejected') {
                            return (
                                registration.registrationStatus === 'Rejected' ||
                                registration.paymentStatus === 'Rejected'
                            )
                        }

                        return (
                            registration.registrationStatus === 'Pending' &&
                            registration.paymentStatus === paymentFilter
                        )
                    })

                const getStatusStyle = registration => {

                    if (registration.registrationStatus === 'Confirmed') {
                        return {
                            border: 'border-l-[#34C759]',
                            card: 'bg-green-50/40',
                            badge: 'bg-green-100 text-emerald-700',
                            label: 'Confirmed',
                            description: 'Registration approved'
                        }
                    }

                    if (
                        registration.registrationStatus === 'Rejected' ||
                        registration.paymentStatus === 'Rejected'
                    ) {
                        return {
                            border: 'border-l-red-500',
                            card: 'bg-red-50/30',
                            badge: 'bg-red-100 text-red-700',
                            label: 'Rejected',
                            description: 'Registration rejected'
                        }
                    }

                    if (registration.paymentStatus === 'For Verification') {
                        return {
                            border: 'border-l-amber-500',
                            card: 'bg-amber-50/40',
                            badge: 'bg-amber-100 text-amber-700',
                            label: 'For Verification',
                            description: 'Receipt submitted — review needed'
                        }
                    }

                    return {
                        border: 'border-l-blue-500',
                        card: 'bg-blue-50/30',
                        badge: 'bg-blue-100 text-blue-700',
                        label: 'Pending Payment',
                        description: 'Waiting for payment or cash confirmation'
                    }
                }

                const filters = [
                    'All',
                    'Pending Payment',
                    'For Verification',
                    'Confirmed',
                    'Rejected'
                ]

                return (

                <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">

                        <div>
                            <h2 className="text-2xl font-bold text-slate-700">
                                Registration Payments
                            </h2>
                            <p className="text-slate-500 mt-1">
                                Review registrations, verify uploaded receipts, or approve players who paid directly in cash.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchPaymentRegistrations}
                            className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-semibold cursor-pointer transition"
                        >
                            Refresh
                        </button>

                    </div>

                    {/* STATUS SUMMARY */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                Pending Payment
                            </p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">
                                {counts['Pending Payment']}
                            </p>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                                For Verification
                            </p>
                            <p className="text-2xl font-bold text-amber-700 mt-1">
                                {counts['For Verification']}
                            </p>
                        </div>

                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                Confirmed
                            </p>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">
                                {counts.Confirmed}
                            </p>
                        </div>

                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                                Rejected
                            </p>
                            <p className="text-2xl font-bold text-red-700 mt-1">
                                {counts.Rejected}
                            </p>
                        </div>

                    </div>

                    {/* FILTERS */}
                    <div className="flex flex-wrap gap-2 mb-6">

                        {filters.map(filter => (

                            <button
                                key={filter}
                                type="button"
                                onClick={() => setPaymentFilter(filter)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                                    paymentFilter === filter
                                        ? 'bg-[#34C759] text-white border-[#34C759]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {filter}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    paymentFilter === filter
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {counts[filter]}
                                </span>
                            </button>

                        ))}

                    </div>

                    {loadingPayments ? (

                        <p className="text-slate-500">
                            Loading payments...
                        </p>

                    ) : activeRegistrations.length === 0 ? (

                        <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500">
                            No active registrations yet.
                        </div>

                    ) : filteredRegistrations.length === 0 ? (

                        <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500">
                            No registrations under this status.
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {filteredRegistrations.map(registration => {

                                const statusStyle = getStatusStyle(registration)

                                return (

                                <div
                                    key={registration._id}
                                    className={`border border-slate-200 border-l-4 ${statusStyle.border} ${statusStyle.card} rounded-2xl p-5`}
                                >

                                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                                        <div className="min-w-0">

                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.badge}`}>
                                                    {statusStyle.label}
                                                </span>

                                                <span className="text-xs text-slate-500">
                                                    {statusStyle.description}
                                                </span>
                                            </div>

                                            <p className="font-bold text-lg text-slate-700">
                                                {registration.player?.firstName} {registration.player?.lastName}
                                            </p>

                                            <p className="text-sm text-slate-500 mt-1">
                                                @{registration.player?.username}
                                                {registration.player?.userId
                                                    ? ` • ${registration.player.userId}`
                                                    : ''}
                                            </p>

                                            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm">
                                                <p className="text-slate-600">
                                                    <span className="text-slate-400">Amount:</span>{' '}
                                                    <span className="font-semibold text-slate-700">
                                                        ₱{Number(registration.amount || 0).toLocaleString()}
                                                    </span>
                                                </p>

                                                <p className="text-slate-600">
                                                    <span className="text-slate-400">Method:</span>{' '}
                                                    <span className="font-semibold text-slate-700">
                                                        {registration.paymentMethod || 'Not specified'}
                                                    </span>
                                                </p>

                                                <p className="text-slate-600">
                                                    <span className="text-slate-400">Reference:</span>{' '}
                                                    <span className="font-semibold text-slate-700">
                                                        {registration.paymentReference || 'Not submitted'}
                                                    </span>
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 xl:justify-end">

                                            {registration.paymentReceipt && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setReceiptModal(
                                                            `http://localhost:5000${registration.paymentReceipt}`
                                                        )
                                                    }
                                                    className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                                                >
                                                    View Receipt
                                                </button>
                                            )}

                                            {registration.registrationStatus === 'Pending' &&
                                                ['Pending Payment', 'For Verification'].includes(
                                                    registration.paymentStatus
                                                ) && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApprovePayment(registration)}
                                                        className="px-4 py-2 rounded-xl bg-[#34C759] hover:bg-[#2fb44f] text-white font-semibold cursor-pointer"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectPayment(registration)}
                                                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold cursor-pointer transition"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                        </div>

                                    </div>

                                    {registration.rejectionReason && (
                                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-red-700">
                                                Rejection reason
                                            </p>
                                            <p className="text-sm text-red-600 mt-1">
                                                {registration.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                </div>

                                )

                            })}

                        </div>

                    )}

                </div>

                )

            })()}


            {/* ========================= */}
            {/* DETAILS TAB */}
            {/* ========================= */}

            {activeTab === 'details' && (

                <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-8">

                    <h2 className="text-2xl font-bold text-slate-700">
                        Tournament Information
                    </h2>

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Organizer
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                @{tournament.organizer?.username}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Location
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {tournament.location}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Game
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {tournament.game}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Tournament Format
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {tournament.format ||
                                    'Not specified'}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Tournament Date
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {new Date(
                                    tournament.startDate
                                ).toLocaleDateString()}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Registration Deadline
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">

                                {tournament.registrationDeadline
                                    ? new Date(
                                        tournament.registrationDeadline
                                    ).toLocaleDateString()
                                    : 'None'}

                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Maximum Participants
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {tournament.maxPlayers}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Registration
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {tournament.registrationType || 'Free'}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Registration Fee
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {tournament.registrationType === 'Paid'
                                    ? `₱${Number(tournament.registrationFee || 0).toLocaleString()}`
                                    : 'Free'}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Reserved Slots
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {reservedCount} / {tournament.maxPlayers}
                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Started
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">

                                {tournament.startedAt
                                    ? new Date(
                                        tournament.startedAt
                                    ).toLocaleString()
                                    : 'Not started'}

                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Finished
                            </p>

                            <p className="text-base font-semibold text-slate-900 mt-1">

                                {tournament.finishedAt
                                    ? new Date(
                                        tournament.finishedAt
                                    ).toLocaleString()
                                    : 'Not finished'}

                            </p>

                        </div>

                    </div>


                    <div className="mt-6 bg-slate-50 rounded-xl p-5">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Description
                        </p>

                        <p className="text-slate-700 mt-2 whitespace-pre-line">
                            {tournament.description}
                        </p>

                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* PLAYER INFORMATION MODAL */}
            {/* ========================= */}

            {receiptModal && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setReceiptModal(null)}
                >

                    <div
                        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-700">
                                    Payment Receipt
                                </h2>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Review the uploaded payment proof.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setReceiptModal(null)}
                                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold cursor-pointer"
                            >
                                ✕
                            </button>

                        </div>

                        <div className="p-6 bg-slate-50 flex justify-center">
                            <img
                                src={receiptModal}
                                alt="Payment Receipt"
                                className="max-w-full max-h-[70vh] object-contain rounded-xl"
                            />
                        </div>

                    </div>

                </div>

            )}


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
                        className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6"
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

                                    <h2 className="text-xl font-bold text-slate-700">
                                        {selectedPlayer.firstName}
                                        {' '}
                                        {selectedPlayer.lastName}
                                    </h2>

                                    <p className="text-slate-500">
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
                                className="text-slate-400 hover:text-slate-600 text-2xl cursor-pointer"
                            >
                                ×
                            </button>

                        </div>


                        <div className="space-y-3 mt-6">

                            <div className="bg-slate-50 rounded-xl p-4">

                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    User ID
                                </p>

                                <p className="font-semibold text-slate-700 mt-1">
                                    {selectedPlayer.userId ||
                                        'Not available'}
                                </p>

                            </div>


                            <div className="bg-slate-50 rounded-xl p-4">

                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Full Name
                                </p>

                                <p className="font-semibold text-slate-700 mt-1">
                                    {selectedPlayer.firstName}
                                    {' '}
                                    {selectedPlayer.lastName}
                                </p>

                            </div>


                            <div className="bg-slate-50 rounded-xl p-4">

                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Username
                                </p>

                                <p className="font-semibold text-slate-700 mt-1">
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

        </div>

    )

}

export default TournamentDetails
