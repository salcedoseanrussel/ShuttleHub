import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
    FaTrashAlt,
    FaChevronRight,
    FaTimes,
    FaUserTimes
} from 'react-icons/fa'


function UserManagement() {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const [deletionRequests, setDeletionRequests] = useState([])
    const [loadingDeletionRequests, setLoadingDeletionRequests] = useState(true)
    const [showDeletionRequests, setShowDeletionRequests] = useState(false)

    const [organizerRequests, setOrganizerRequests] = useState([])
    const [loadingOrganizerRequests, setLoadingOrganizerRequests] = useState(true)
    const [showOrganizerRequests, setShowOrganizerRequests] = useState(false)
    const [selectedOrganizerRequest, setSelectedOrganizerRequest] = useState(null)

    const [searchParams] = useSearchParams()

    const [filter, setFilter] = useState(
        searchParams.get('filter') || 'All'
    )

    const token = localStorage.getItem('token')


    useEffect(() => {

        fetchUsers()
        fetchDeletionRequests()
        fetchOrganizerRequests()

    }, [])

    useEffect(() => {

        if (
            searchParams.get(
                'deletionRequests'
            ) === 'open'
        ) {

            setShowDeletionRequests(true)

        }


        if (
            searchParams.get(
                'organizerRequests'
            ) === 'open'
        ) {

            setShowOrganizerRequests(true)

        }

    }, [searchParams])


    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('date-desc')

    const [page, setPage] = useState(1)
    const itemsPerPage = 6
    


    useEffect(() => {

        setFilter(
            searchParams.get('filter') || 'All'
        )

    }, [searchParams])


    useEffect(() => {

        setPage(1)

    }, [search, filter, sort])


    // =========================
    // FETCH USERS
    // =========================

    const fetchUsers = async () => {

        try {

            setLoading(true)

            const res = await axios.get(
                'http://localhost:5000/api/admin/users',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setUsers(res.data)

        } catch (err) {

            console.log(
                'FETCH USERS ERROR:',
                err.response?.data || err.message
            )

        } finally {

            setLoading(false)

        }

    }


    // =========================
    // FETCH DELETION REQUESTS
    // =========================

    const fetchDeletionRequests = async () => {

        try {

            setLoadingDeletionRequests(true)

            const res = await axios.get(
                'http://localhost:5000/api/users/admin/deletion-requests',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setDeletionRequests(res.data)

        } catch (err) {

            console.log(
                'FETCH DELETION REQUESTS ERROR:',
                err.response?.data || err.message
            )

        } finally {

            setLoadingDeletionRequests(false)

        }

    }

    // =========================
    // FETCH ORGANIZER REQUESTS
    // =========================

    const fetchOrganizerRequests = async () => {

        try {

            setLoadingOrganizerRequests(true)

            const res = await axios.get(
                'http://localhost:5000/api/admin/organizer-requests',
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )

            setOrganizerRequests(
                res.data
            )

        } catch (err) {

            console.log(
                'FETCH ORGANIZER REQUESTS ERROR:',
                err.response?.data ||
                err.message
            )

        } finally {

            setLoadingOrganizerRequests(false)

        }

    }


    // =========================
    // RESTRICT USER
    // =========================

    const restrictUser = async (user) => {

        try {

            const result = await Swal.fire({

                title: user.isRestricted
                    ? 'Remove Restriction?'
                    : 'Restrict User?',

                text: user.isRestricted
                    ? 'This user will regain access to restricted features.'
                    : 'This user can still access their account, but some actions will be unavailable.',

                icon: 'warning',

                showCancelButton: true,

                confirmButtonColor:
                    user.isRestricted
                        ? '#34C759'
                        : '#EF4444',

                cancelButtonColor: '#9CA3AF',

                confirmButtonText:
                    user.isRestricted
                        ? 'Remove Restriction'
                        : 'Restrict',

                cancelButtonText: 'Cancel'

            })


            if (!result.isConfirmed) {
                return
            }


            const res = await axios.put(

                `http://localhost:5000/api/admin/restrict/${user._id}`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            )


            await Swal.fire({

                title: user.isRestricted
                    ? 'Restriction Removed'
                    : 'User Restricted',

                text: res.data.message,

                icon: 'success',

                confirmButtonColor: '#34C759'

            })


            fetchUsers()

        } catch (err) {

            Swal.fire({

                title: 'Action Failed',

                text:
                    err.response?.data?.message ||
                    'Something went wrong.',

                icon: 'error',

                confirmButtonColor: '#EF4444'

            })

        }

    }


    // =========================
    // CHANGE ROLE
    // =========================

    const changeRole = async (id, role) => {

        const result = await Swal.fire({

            title: `Change Role to ${role}?`,

            text:
                `This user's role will be changed to ${role}.`,

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor: '#34C759',

            cancelButtonColor: '#9CA3AF',

            confirmButtonText: `Make ${role}`,

            cancelButtonText: 'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            await axios.put(
                `http://localhost:5000/api/admin/role/${id}`,
                {
                    role
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            fetchUsers()


        } catch (err) {

            alert(
                err.response?.data?.message
            )

        }

    }


    // =========================
    // DELETE USER
    // =========================

    const deleteUser = async (id) => {

        const result = await Swal.fire({

            title: 'Delete User?',

            text:
                'This action cannot be undone.',

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor: '#EF4444',

            cancelButtonColor: '#9CA3AF',

            confirmButtonText: 'Delete',

            cancelButtonText: 'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            await axios.delete(
                `http://localhost:5000/api/admin/users/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            fetchUsers()


        } catch (err) {

            alert(
                err.response?.data?.message
            )

        }

    }


    // =========================
    // REJECT DELETION REQUEST
    // =========================

    const rejectDeletion = async (request) => {

        const result = await Swal.fire({

            title: 'Reject Deletion Request?',

            html: `
                <div style="text-align:left">

                    <p style="
                        color:#6B7280;
                        margin-bottom:15px;
                    ">
                        The user's account will remain active.
                    </p>

                    <label style="
                        display:block;
                        font-size:14px;
                        font-weight:600;
                        color:#4B5563;
                        margin-bottom:7px;
                    ">
                        Reason (optional)
                    </label>

                    <textarea
                        id="admin-note"
                        class="swal2-textarea"
                        placeholder="Reason for rejecting the request..."
                        style="
                            width:100%;
                            margin:0;
                            box-sizing:border-box;
                        "
                    ></textarea>

                </div>
            `,

            icon: 'question',

            showCancelButton: true,

            confirmButtonColor: '#EF4444',

            cancelButtonColor: '#9CA3AF',

            confirmButtonText:
                'Reject Request',

            cancelButtonText:
                'Cancel',

            focusConfirm: false,

            preConfirm: () => {

                return document
                    .getElementById(
                        'admin-note'
                    )
                    ?.value
                    ?.trim() || ''

            }

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const res = await axios.put(

                `http://localhost:5000/api/users/admin/deletion-requests/${request.user._id}/reject`,

                {
                    adminNote:
                        result.value
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            )


            await Swal.fire({

                title: 'Request Rejected',

                text:
                    res.data.message,

                icon: 'success',

                confirmButtonColor:
                    '#34C759'

            })


            fetchDeletionRequests()


        } catch (err) {

            Swal.fire({

                title:
                    'Action Failed',

                text:
                    err.response?.data?.message ||
                    'Failed to reject deletion request.',

                icon: 'error',

                confirmButtonColor:
                    '#EF4444'

            })

        }

    }


    // =========================
    // APPROVE DELETION REQUEST
    // =========================

    const approveDeletion = async (request) => {

        if (
            request.impact
                ?.hasActiveResponsibilities
        ) {

            await Swal.fire({

                title:
                    'Cannot Approve Yet',

                text:
                    'This organizer still has active tournaments or Quick Play sessions. Resolve them before approving account deletion.',

                icon: 'warning',

                confirmButtonColor:
                    '#34C759'

            })


            return

        }


        const result = await Swal.fire({

            title:
                'Approve Account Deletion?',

            text:
                'This user will no longer be able to access their ShuttleHub account.',

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor:
                '#EF4444',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                'Approve Deletion',

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const res = await axios.put(

                `http://localhost:5000/api/users/admin/deletion-requests/${request.user._id}/approve`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            )


            await Swal.fire({

                title:
                    'Deletion Approved',

                text:
                    res.data.message,

                icon: 'success',

                confirmButtonColor:
                    '#34C759'

            })


            fetchDeletionRequests()
            fetchUsers()


        } catch (err) {

            Swal.fire({

                title:
                    'Action Failed',

                text:
                    err.response?.data?.message ||
                    'Failed to approve deletion request.',

                icon: 'error',

                confirmButtonColor:
                    '#EF4444'

            })

        }

    }


    // =========================
    // FILTER + SEARCH + SORT
    // =========================

    const processed = useMemo(() => {

        let data = [...users]


        // SEARCH

        if (search.trim()) {

            const query =
                search.toLowerCase()


            data = data.filter(user =>
                user.firstName
                    ?.toLowerCase()
                    .includes(query) ||

                user.lastName
                    ?.toLowerCase()
                    .includes(query) ||

                user.username
                    ?.toLowerCase()
                    .includes(query) ||

                user.email
                    ?.toLowerCase()
                    .includes(query)
            )

        }


        // FILTER

        data = data.filter(user => {

            if (filter === 'All') {
                return true
            }

            if (filter === 'Restricted') {
                return user.isRestricted === true
            }

            return user.role === filter

        })


        // SORT

        if (sort === 'date-desc') {

            data.sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )

        }


        if (sort === 'date-asc') {

            data.sort(
                (a, b) =>
                    new Date(a.createdAt) -
                    new Date(b.createdAt)
            )

        }


        if (sort === 'name-asc') {

            data.sort((a, b) => {

                const nameA =
                    `${a.firstName || ''} ${a.lastName || ''}`

                const nameB =
                    `${b.firstName || ''} ${b.lastName || ''}`

                return nameA.localeCompare(
                    nameB
                )

            })

        }


        if (sort === 'username-asc') {

            data.sort((a, b) =>
                a.username.localeCompare(
                    b.username
                )
            )

        }


        if (sort === 'role-asc') {

            data.sort((a, b) =>
                a.role.localeCompare(
                    b.role
                )
            )

        }


        return data

    }, [users, search, filter, sort])


    // =========================
    // APPROVE ORGANIZER REQUEST
    // =========================

    const approveOrganizerRequest =
        async (request) => {

            const result = await Swal.fire({

                title:
                    'Approve Organizer Registration?',

                text:
                    `${request.firstName} ${request.lastName} will receive Organizer access.`,

                icon:
                    'question',

                showCancelButton:
                    true,

                confirmButtonColor:
                    '#34C759',

                cancelButtonColor:
                    '#9CA3AF',

                confirmButtonText:
                    'Approve',

                cancelButtonText:
                    'Cancel'

            })


            if (!result.isConfirmed) {
                return
            }


            try {

                const res =
                    await axios.put(

                        `http://localhost:5000/api/admin/organizer-requests/${request._id}/approve`,

                        {},

                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }

                    )


                await Swal.fire({

                    title:
                        'Organizer Approved',

                    text:
                        res.data.message,

                    icon:
                        'success',

                    confirmButtonColor:
                        '#34C759'

                })


                setSelectedOrganizerRequest(null)
                fetchOrganizerRequests()
                fetchUsers()


            } catch (err) {

                Swal.fire({

                    title:
                        'Approval Failed',

                    text:
                        err.response?.data?.message ||
                        'Failed to approve Organizer registration.',

                    icon:
                        'error',

                    confirmButtonColor:
                        '#EF4444'

                })

            }

        }

        // =========================
        // REJECT ORGANIZER REQUEST
        // =========================

        const rejectOrganizerRequest =
            async (request) => {

                const result = await Swal.fire({

                    title:
                        'Reject Organizer Registration?',

                    html: `
                        <div style="text-align:left">

                            <p style="
                                color:#6B7280;
                                margin-bottom:18px;
                            ">
                                Select the reason for rejecting this Organizer registration.
                                The reason will be included in the email sent to the applicant.
                            </p>

                            <label style="
                                display:block;
                                font-size:14px;
                                font-weight:600;
                                color:#4B5563;
                                margin-bottom:7px;
                            ">
                                Reason for Rejection
                                <span style="color:#EF4444">*</span>
                            </label>

                            <select
                                id="organizer-rejection-reason"
                                class="swal2-select"
                                style="
                                    width:100%;
                                    margin:0 0 18px 0;
                                    box-sizing:border-box;
                                    padding:10px 12px;
                                    border:1px solid #D1D5DB;
                                    border-radius:8px;
                                    color:#374151;
                                    background:white;
                                "
                            >
                                <option value="">
                                    Select a reason
                                </option>

                                <option value="Incomplete or invalid information">
                                    Incomplete or invalid information
                                </option>

                                <option value="Duplicate account">
                                    Duplicate account
                                </option>

                                <option value="Unable to verify account information">
                                    Unable to verify account information
                                </option>

                                <option value="Organizer access requirements not met">
                                    Organizer access requirements not met
                                </option>

                                <option value="Suspicious or inappropriate registration">
                                    Suspicious or inappropriate registration
                                </option>

                                <option value="Other">
                                    Other
                                </option>
                            </select>


                            <label style="
                                display:block;
                                font-size:14px;
                                font-weight:600;
                                color:#4B5563;
                                margin-bottom:7px;
                            ">
                                Additional Details
                                <span
                                    id="organizer-details-required"
                                    style="
                                        color:#EF4444;
                                        display:none;
                                    "
                                >
                                    *
                                </span>
                            </label>

                            <textarea
                                id="organizer-admin-note"
                                class="swal2-textarea"
                                placeholder="Add more information about the rejection..."
                                style="
                                    width:100%;
                                    margin:0;
                                    box-sizing:border-box;
                                "
                            ></textarea>

                            <p
                                id="organizer-details-help"
                                style="
                                    font-size:12px;
                                    color:#9CA3AF;
                                    margin-top:6px;
                                "
                            >
                                Optional
                            </p>

                        </div>
                    `,

                    icon:
                        'warning',

                    showCancelButton:
                        true,

                    confirmButtonColor:
                        '#EF4444',

                    cancelButtonColor:
                        '#9CA3AF',

                    confirmButtonText:
                        'Reject Registration',

                    cancelButtonText:
                        'Cancel',

                    focusConfirm:
                        false,


                    didOpen: () => {

                        const reasonSelect =
                            document.getElementById(
                                'organizer-rejection-reason'
                            )

                        const requiredIndicator =
                            document.getElementById(
                                'organizer-details-required'
                            )

                        const helpText =
                            document.getElementById(
                                'organizer-details-help'
                            )


                        reasonSelect?.addEventListener(
                            'change',
                            () => {

                                const isOther =
                                    reasonSelect.value ===
                                    'Other'


                                if (requiredIndicator) {

                                    requiredIndicator.style.display =
                                        isOther
                                            ? 'inline'
                                            : 'none'

                                }


                                if (helpText) {

                                    helpText.textContent =
                                        isOther
                                            ? 'Required when Other is selected'
                                            : 'Optional'

                                    helpText.style.color =
                                        isOther
                                            ? '#EF4444'
                                            : '#9CA3AF'

                                }

                            }
                        )

                    },


                    preConfirm: () => {

                        const rejectionReason =
                            document
                                .getElementById(
                                    'organizer-rejection-reason'
                                )
                                ?.value


                        const adminNote =
                            document
                                .getElementById(
                                    'organizer-admin-note'
                                )
                                ?.value
                                ?.trim() || ''


                        if (!rejectionReason) {

                            Swal.showValidationMessage(
                                'Please select a reason for rejection.'
                            )

                            return false

                        }


                        if (
                            rejectionReason === 'Other' &&
                            !adminNote
                        ) {

                            Swal.showValidationMessage(
                                'Please provide additional details when selecting Other.'
                            )

                            return false

                        }


                        return {

                            rejectionReason,

                            adminNote

                        }

                    }

                })


                if (!result.isConfirmed) {
                    return
                }


                try {

                    const res =
                        await axios.put(

                            `http://localhost:5000/api/admin/organizer-requests/${request._id}/reject`,

                            {

                                rejectionReason:
                                    result.value.rejectionReason,

                                adminNote:
                                    result.value.adminNote

                            },

                            {

                                headers: {

                                    Authorization:
                                        `Bearer ${token}`

                                }

                            }

                        )


                    await Swal.fire({

                        title:
                            'Registration Rejected',

                        text:
                            res.data.message,

                        icon:
                            'success',

                        confirmButtonColor:
                            '#34C759'

                    })


                    setSelectedOrganizerRequest(null)
                    fetchOrganizerRequests()

                    fetchUsers()


                } catch (err) {

                    Swal.fire({

                        title:
                            'Action Failed',

                        text:
                            err.response?.data?.message ||
                            'Failed to reject Organizer registration.',

                        icon:
                            'error',

                        confirmButtonColor:
                            '#EF4444'

                    })

                }

            }


    // =========================
    // PAGINATION
    // =========================

    const totalPages =
        Math.ceil(
            processed.length /
            itemsPerPage
        )


    const paginated =
        processed.slice(
            (page - 1) * itemsPerPage,
            page * itemsPerPage
        )


    return (

        <div className="min-h-screen bg-[#f8f8f8] p-8">


            {/* HEADER */}

            <h1 className="text-3xl font-semibold text-[#34C759] mb-6">
                User Management
            </h1>

            {/* =========================
                ORGANIZER REQUEST CARD
            ========================= */}

            <div
                onClick={() =>
                    setShowOrganizerRequests(true)
                }
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-4 cursor-pointer hover:border-blue-200 hover:shadow-sm transition"
            >

                <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">

                            <span className="font-bold text-lg">
                                O
                            </span>

                        </div>


                        <div>

                            <h2 className="font-semibold text-gray-800">
                                Organizer Registration Requests
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Review users waiting for Organizer approval.
                            </p>

                        </div>

                    </div>


                    <div className="flex items-center gap-3">

                        {!loadingOrganizerRequests && (

                            <span
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    organizerRequests.length > 0
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                            >

                                {organizerRequests.length}

                            </span>

                        )}


                        <FaChevronRight className="text-gray-400 text-sm" />

                    </div>

                </div>

            </div>

            {/* =========================
                DELETION REQUEST CARD
            ========================= */}

            <div
                onClick={() =>
                    setShowDeletionRequests(true)
                }
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-8 cursor-pointer hover:border-red-200 hover:shadow-sm transition"
            >

                <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">

                            <FaUserTimes />

                        </div>


                        <div>

                            <h2 className="font-semibold text-gray-800">
                                Account Deletion Requests
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Review pending account deletion requests.
                            </p>

                        </div>

                    </div>


                    <div className="flex items-center gap-3">

                        {!loadingDeletionRequests && (

                            <span
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    deletionRequests.length > 0
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                            >

                                {deletionRequests.length}

                            </span>

                        )}


                        <FaChevronRight className="text-gray-400 text-sm" />

                    </div>

                </div>

            </div>



            {/* =========================
                SEARCH + SORT
            ========================= */}

            <div className="flex flex-col lg:flex-row gap-4 mb-8">


                {/* SEARCH */}

                <input
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="Search users..."
                    className="flex-1 px-5 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 focus:outline-none focus:border-[#34C759]"
                />


                {/* SORT */}

                <select
                    value={sort}
                    onChange={(e) =>
                        setSort(
                            e.target.value
                        )
                    }
                    className="cursor-pointer px-5 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 focus:outline-none focus:border-[#34C759]"
                >

                    <option value="date-desc">
                        Newest
                    </option>

                    <option value="date-asc">
                        Oldest
                    </option>

                    <option value="name-asc">
                        Name A-Z
                    </option>

                    <option value="username-asc">
                        Username A-Z
                    </option>

                    <option value="role-asc">
                        Role A-Z
                    </option>

                </select>

            </div>



            {/* =========================
                FILTERS
            ========================= */}

            <div className="flex gap-2 mb-8 flex-wrap">

                {[
                    'All',
                    'Player',
                    'Organizer',
                    'Admin',
                    'Restricted'
                ].map(f => (

                    <button
                        key={f}
                        onClick={() =>
                            setFilter(f)
                        }
                        className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                            filter === f
                                ? 'bg-[#34C759] text-white border-[#34C759]'
                                : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-[#34C759]'
                        }`}
                    >

                        {f}

                    </button>

                ))}

            </div>



            {/* =========================
                USERS
            ========================= */}

            {loading ? (

                <p className="text-gray-500">
                    Loading users...
                </p>

            ) : paginated.length === 0 ? (

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">

                    <p className="text-gray-500">
                        No users found.
                    </p>

                </div>

            ) : (

                <div className="grid gap-4">

                    {paginated.map(user => (

                        <div
                            key={user._id}
                            className="w-full bg-white border border-[#E5E7EB] rounded-2xl p-6"
                        >

                            <div className="flex flex-col xl:flex-row xl:items-center gap-6">


                                {/* USER INFORMATION */}

                                <div className="flex items-center gap-4 xl:w-[300px] flex-shrink-0">


                                    {/* AVATAR */}

                                    <div
                                        className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            user.role === 'Admin'
                                                ? 'bg-red-100 text-red-600'
                                                : user.role === 'Organizer'
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'bg-green-100 text-green-600'
                                        }`}
                                    >

                                        <span className="text-xl font-bold">

                                            {user.firstName
                                                ?.charAt(0)
                                                .toUpperCase()}

                                        </span>

                                    </div>


                                    {/* BASIC INFO */}

                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-center gap-2 flex-wrap">

                                            <h2 className="text-lg font-semibold text-gray-700 truncate">

                                                {user.firstName}{' '}
                                                {user.lastName}

                                            </h2>


                                            {user.isRestricted && (

                                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 font-semibold flex-shrink-0">

                                                    RESTRICTED

                                                </span>

                                            )}

                                        </div>


                                        <p className="text-sm text-gray-500 mt-1 truncate">

                                            @{user.username}

                                        </p>


                                        <p className="text-sm text-gray-500 truncate">

                                            {user.email}

                                        </p>

                                    </div>

                                </div>



                                {/* USER DETAILS */}

                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 min-w-0">


                                    {/* ROLE */}

                                    <div className="bg-[#F8F8F8] rounded-xl px-4 py-3 min-w-0">

                                        <p className="text-xs text-gray-400">
                                            Role
                                        </p>

                                        <p
                                            className={`font-semibold text-sm mt-1 ${
                                                user.role === 'Admin'
                                                    ? 'text-red-600'
                                                    : user.role === 'Organizer'
                                                    ? 'text-blue-600'
                                                    : 'text-green-600'
                                            }`}
                                        >

                                            {user.role}

                                        </p>

                                    </div>


                                    {/* STATUS */}

                                    <div className="bg-[#F8F8F8] rounded-xl px-4 py-3 min-w-0">

                                        <p className="text-xs text-gray-400">
                                            Account Status
                                        </p>

                                        <p
                                            className={`font-semibold text-sm mt-1 ${
                                                user.isRestricted
                                                    ? 'text-red-600'
                                                    : 'text-[#34C759]'
                                            }`}
                                        >

                                            {user.isRestricted
                                                ? 'Restricted'
                                                : 'Active'}

                                        </p>

                                    </div>


                                    {/* MEMBER SINCE */}

                                    <div className="bg-[#F8F8F8] rounded-xl px-4 py-3 min-w-0">

                                        <p className="text-xs text-gray-400">
                                            Member Since
                                        </p>

                                        <p className="font-semibold text-sm text-gray-700 mt-1">

                                            {user.createdAt
                                                ? new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()
                                                : 'Unknown'
                                            }

                                        </p>

                                    </div>


                                    {/* USER ID */}

                                    <div className="bg-[#F8F8F8] rounded-xl px-4 py-3 min-w-0">

                                        <p className="text-xs text-gray-400">
                                            User ID
                                        </p>

                                        <p
                                            className="font-mono text-xs text-gray-600 mt-1 truncate"
                                            title={user.userId}
                                        >

                                            {user.userId}

                                        </p>

                                    </div>

                                </div>



                                {/* ACTIONS */}

                                <div className="flex items-center gap-2 flex-wrap xl:w-[360px] xl:justify-end flex-shrink-0">


                                    <button
                                        onClick={() =>
                                            restrictUser(user)
                                        }
                                        disabled={
                                            user.role === 'Admin'
                                        }
                                        className={`
                                            px-4 py-2 rounded-lg text-sm font-semibold transition
                                            ${
                                                user.role === 'Admin'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : user.isRestricted
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer'
                                                    : 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
                                            }
                                        `}
                                    >

                                        {user.role === 'Admin'
                                            ? 'Protected'
                                            : user.isRestricted
                                            ? 'Remove Restriction'
                                            : 'Restrict'
                                        }

                                    </button>


                                    <button
                                        onClick={() =>
                                            changeRole(
                                                user._id,
                                                'Player'
                                            )
                                        }
                                        disabled={
                                            user.role === 'Player' ||
                                            user.role === 'Admin'
                                        }
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                                            user.role === 'Player' ||
                                            user.role === 'Admin'
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                                        }`}
                                    >

                                        Player

                                    </button>


                                    <button
                                        onClick={() =>
                                            changeRole(
                                                user._id,
                                                'Organizer'
                                            )
                                        }
                                        disabled={
                                            user.role === 'Organizer' ||
                                            user.role === 'Admin'
                                        }
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                                            user.role === 'Organizer' ||
                                            user.role === 'Admin'
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                                        }`}
                                    >

                                        Organizer

                                    </button>


                                    <button
                                        onClick={() =>
                                            deleteUser(
                                                user._id
                                            )
                                        }
                                        disabled={
                                            user.role === 'Admin'
                                        }
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                                            user.role === 'Admin'
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                                        }`}
                                    >

                                        {user.role === 'Admin'
                                            ? 'Protected'
                                            : 'Delete'
                                        }

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}



                    {/* =========================
                        PAGINATION
                    ========================= */}

                    {totalPages > 1 && (

                        <div className="flex gap-2 mt-8 justify-center">

                            {Array.from(
                                {
                                    length:
                                        totalPages
                                },
                                (_, i) => (

                                    <button
                                        key={i}
                                        onClick={() =>
                                            setPage(
                                                i + 1
                                            )
                                        }
                                        className={`cursor-pointer px-3 py-1 border rounded-lg ${
                                            page === i + 1
                                                ? 'bg-[#34C759] text-white border-[#34C759]'
                                                : 'bg-white text-gray-700 border-[#E5E7EB] hover:border-[#34C759]'
                                        }`}
                                    >

                                        {i + 1}

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </div>

            )}


            {/* =========================
                ORGANIZER REQUESTS MODAL
            ========================= */}

            {showOrganizerRequests && (

                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            setShowOrganizerRequests(
                                false
                            )

                            setSelectedOrganizerRequest(
                                null
                            )

                        }

                    }}
                >

                    <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col">


                        {/* HEADER */}

                        <div className="flex items-start justify-between p-6 border-b border-[#E5E7EB] shrink-0">

                            <div>

                                <div className="flex items-center gap-3">

                                    <h2 className="text-xl font-bold text-gray-800">
                                        Organizer Registration Requests
                                    </h2>


                                    {!loadingOrganizerRequests && (

                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">

                                            {organizerRequests.length}

                                        </span>

                                    )}

                                </div>


                                <p className="text-sm text-gray-500 mt-1">
                                    Select a request to review the Organizer application.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() => {

                                    setShowOrganizerRequests(
                                        false
                                    )

                                    setSelectedOrganizerRequest(
                                        null
                                    )

                                }}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer shrink-0"
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* BODY */}

                        <div className="p-6 overflow-y-auto">

                            {loadingOrganizerRequests ? (

                                <div className="py-12 text-center">

                                    <p className="text-gray-500">
                                        Loading Organizer requests...
                                    </p>

                                </div>

                            ) : organizerRequests.length === 0 ? (

                                <div className="py-14 text-center">

                                    <div className="w-14 h-14 bg-green-50 text-[#34C759] rounded-full flex items-center justify-center mx-auto mb-4">

                                        ✓

                                    </div>


                                    <p className="font-semibold text-gray-700">
                                        No Pending Requests
                                    </p>


                                    <p className="text-sm text-gray-500 mt-1">
                                        There are currently no Organizer registrations to review.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-3">

                                    {organizerRequests.map(
                                        request => (

                                            <button
                                                type="button"
                                                key={request._id}
                                                onClick={() =>
                                                    setSelectedOrganizerRequest(
                                                        request
                                                    )
                                                }
                                                className="w-full text-left border border-[#E5E7EB] rounded-2xl p-5 bg-white hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm transition cursor-pointer"
                                            >

                                                <div className="flex items-center justify-between gap-5">

                                                    <div className="flex items-center gap-4 min-w-0">

                                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">

                                                            <span className="font-bold">

                                                                {request.firstName
                                                                    ?.charAt(0)
                                                                    .toUpperCase()
                                                                }

                                                            </span>

                                                        </div>


                                                        <div className="min-w-0">

                                                            <div className="flex items-center gap-2 flex-wrap">

                                                                <h3 className="font-semibold text-gray-800">

                                                                    {request.firstName}{' '}
                                                                    {request.lastName}

                                                                </h3>


                                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">

                                                                    Pending

                                                                </span>

                                                            </div>


                                                            <p className="text-sm text-gray-500 mt-1 truncate">

                                                                @{request.username}

                                                                {' • '}

                                                                {request.userId}

                                                            </p>


                                                            <p className="text-sm text-gray-500 truncate">

                                                                {request.email}

                                                            </p>


                                                            <p className="text-xs text-gray-400 mt-2">

                                                                Requested{' '}

                                                                {request
                                                                    .organizerRequest
                                                                    ?.requestedAt

                                                                    ? new Date(
                                                                        request
                                                                            .organizerRequest
                                                                            .requestedAt
                                                                    ).toLocaleDateString(
                                                                        'en-US',
                                                                        {
                                                                            month:
                                                                                'long',

                                                                            day:
                                                                                'numeric',

                                                                            year:
                                                                                'numeric'
                                                                        }
                                                                    )

                                                                    : 'Unknown'
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="flex items-center gap-2 text-blue-500 shrink-0">

                                                        <span className="hidden sm:inline text-sm font-semibold">
                                                            Review
                                                        </span>

                                                        <FaChevronRight />

                                                    </div>

                                                </div>

                                            </button>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* =========================
                ORGANIZER REQUEST DETAILS MODAL
            ========================= */}

            {selectedOrganizerRequest && (

                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            setSelectedOrganizerRequest(
                                null
                            )

                        }

                    }}
                >

                    <div className="bg-white w-full max-w-3xl max-h-[88vh] rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col">


                        {/* DETAILS HEADER */}

                        <div className="flex items-start justify-between p-6 border-b border-[#E5E7EB] shrink-0">

                            <div>

                                <div className="flex items-center gap-3 flex-wrap">

                                    <h2 className="text-xl font-bold text-gray-800">
                                        Organizer Application
                                    </h2>


                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                                        Pending
                                    </span>

                                </div>


                                <p className="text-sm text-gray-500 mt-1">
                                    Review the applicant's information before approving or rejecting the request.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedOrganizerRequest(
                                        null
                                    )
                                }
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer shrink-0"
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* DETAILS BODY */}

                        <div className="p-6 overflow-y-auto">


                            {/* APPLICANT */}

                            <div className="flex items-start gap-4">

                                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">

                                    <span className="font-bold text-lg">

                                        {selectedOrganizerRequest.firstName
                                            ?.charAt(0)
                                            .toUpperCase()
                                        }

                                    </span>

                                </div>


                                <div className="min-w-0">

                                    <h3 className="font-semibold text-lg text-gray-800">

                                        {selectedOrganizerRequest.firstName}{' '}
                                        {selectedOrganizerRequest.lastName}

                                    </h3>


                                    <p className="text-sm text-gray-500 mt-1">

                                        @{selectedOrganizerRequest.username}

                                    </p>


                                    <p className="text-sm text-gray-500">

                                        {selectedOrganizerRequest.email}

                                    </p>


                                    <p className="text-xs font-mono text-gray-400 mt-1">

                                        {selectedOrganizerRequest.userId}

                                    </p>

                                </div>

                            </div>


                            {/* REQUEST DETAILS */}

                            <div className="grid md:grid-cols-2 gap-3 mt-6">

                                <div className="bg-[#F8F8F8] rounded-xl p-4">

                                    <p className="text-xs text-gray-400">
                                        Requested Role
                                    </p>

                                    <p className="text-sm font-semibold text-blue-600 mt-1">
                                        Organizer
                                    </p>

                                </div>


                                <div className="bg-[#F8F8F8] rounded-xl p-4">

                                    <p className="text-xs text-gray-400">
                                        Registered
                                    </p>

                                    <p className="text-sm text-gray-700 mt-1">

                                        {selectedOrganizerRequest
                                            .organizerRequest
                                            ?.requestedAt

                                            ? new Date(
                                                selectedOrganizerRequest
                                                    .organizerRequest
                                                    .requestedAt
                                            ).toLocaleDateString(
                                                'en-US',
                                                {
                                                    month:
                                                        'long',

                                                    day:
                                                        'numeric',

                                                    year:
                                                        'numeric'
                                                }
                                            )

                                            : 'Unknown'
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* =========================
                                ORGANIZER APPLICATION
                            ========================= */}

                            <div className="mt-5 border border-blue-100 bg-blue-50/40 rounded-2xl p-5">

                                <div className="mb-4">

                                    <h4 className="font-semibold text-gray-800">
                                        Application Information
                                    </h4>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Information submitted by the applicant during Organizer registration.
                                    </p>

                                </div>


                                <div className="grid md:grid-cols-2 gap-3">

                                    <div className="bg-white border border-blue-100 rounded-xl p-4">

                                        <p className="text-xs text-gray-400">
                                            Organization / Club
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700 mt-1">
                                            {selectedOrganizerRequest.organizerApplication?.organizationName ||
                                                'Not provided'
                                            }
                                        </p>

                                    </div>


                                    <div className="bg-white border border-blue-100 rounded-xl p-4">

                                        <p className="text-xs text-gray-400">
                                            Organizer Type
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700 mt-1">
                                            {selectedOrganizerRequest.organizerApplication?.organizerType ||
                                                'Not provided'
                                            }
                                        </p>

                                    </div>


                                    <div className="bg-white border border-blue-100 rounded-xl p-4">

                                        <p className="text-xs text-gray-400">
                                            Position / Role
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700 mt-1">
                                            {selectedOrganizerRequest.organizerApplication?.position ||
                                                'Not provided'
                                            }
                                        </p>

                                    </div>


                                    <div className="bg-white border border-blue-100 rounded-xl p-4">

                                        <p className="text-xs text-gray-400">
                                            Contact Number
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700 mt-1">
                                            {selectedOrganizerRequest.organizerApplication?.contactNumber ||
                                                'Not provided'
                                            }
                                        </p>

                                    </div>


                                    <div className="bg-white border border-blue-100 rounded-xl p-4">

                                        <p className="text-xs text-gray-400">
                                            Organizing Experience
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700 mt-1 whitespace-pre-wrap">
                                            {selectedOrganizerRequest.organizerApplication?.experience ||
                                                'Not provided'
                                            }
                                        </p>

                                    </div>


                                    <div className="bg-white border border-blue-100 rounded-xl p-4">

                                        <p className="text-xs text-gray-400">
                                            Intended Use
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700 mt-1 whitespace-pre-wrap">
                                            {selectedOrganizerRequest.organizerApplication?.intendedUse ||
                                                'Not provided'
                                            }
                                        </p>

                                    </div>

                                </div>


                                <div className="bg-white border border-blue-100 rounded-xl p-4 mt-3">

                                    <p className="text-xs text-gray-400">
                                        Previous Events
                                    </p>

                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                        {selectedOrganizerRequest.organizerApplication?.previousEvents ||
                                            'No previous events provided.'
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* DETAILS ACTIONS */}

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6 border-t border-[#E5E7EB] bg-[#FAFAFA] shrink-0">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedOrganizerRequest(
                                        null
                                    )
                                }
                                className="px-5 py-2.5 border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold cursor-pointer transition"
                            >

                                Back

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    rejectOrganizerRequest(
                                        selectedOrganizerRequest
                                    )
                                }
                                className="px-5 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold cursor-pointer transition"
                            >

                                Reject

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    approveOrganizerRequest(
                                        selectedOrganizerRequest
                                    )
                                }
                                className="px-5 py-2.5 bg-[#34C759] hover:bg-[#2DB84F] text-white rounded-xl text-sm font-semibold cursor-pointer transition"
                            >

                                Approve

                            </button>

                        </div>

                    </div>

                </div>

            )}



            {/* =========================
                DELETION REQUESTS MODAL
            ========================= */}

            {showDeletionRequests && (

                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            setShowDeletionRequests(
                                false
                            )

                        }

                    }}
                >

                    <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col">


                        {/* MODAL HEADER */}

                        <div className="flex items-start justify-between p-6 border-b border-[#E5E7EB] shrink-0">

                            <div>

                                <div className="flex items-center gap-3">

                                    <h2 className="text-xl font-bold text-gray-800">
                                        Account Deletion Requests
                                    </h2>


                                    {!loadingDeletionRequests && (

                                        <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">

                                            {deletionRequests.length}

                                        </span>

                                    )}

                                </div>


                                <p className="text-sm text-gray-500 mt-1">
                                    Review and manage pending account deletion requests.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowDeletionRequests(
                                        false
                                    )
                                }
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer shrink-0"
                            >

                                <FaTimes />

                            </button>

                        </div>



                        {/* MODAL BODY */}

                        <div className="p-6 overflow-y-auto">

                            {loadingDeletionRequests ? (

                                <div className="py-12 text-center">

                                    <p className="text-gray-500">
                                        Loading deletion requests...
                                    </p>

                                </div>

                            ) : deletionRequests.length === 0 ? (

                                <div className="py-14 text-center">

                                    <div className="w-14 h-14 bg-green-50 text-[#34C759] rounded-full flex items-center justify-center mx-auto mb-4">

                                        ✓

                                    </div>


                                    <p className="font-semibold text-gray-700">
                                        No Pending Requests
                                    </p>


                                    <p className="text-sm text-gray-500 mt-1">
                                        There are currently no account deletion requests to review.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {deletionRequests.map(
                                        request => {

                                            const requestUser =
                                                request.user

                                            const impact =
                                                request.impact || {}

                                            const activeTournaments =
                                                impact.activeTournaments || []

                                            const activeQueueSessions =
                                                impact.activeQueueSessions || []


                                            return (

                                                <div
                                                    key={requestUser._id}
                                                    className="border border-[#E5E7EB] rounded-2xl overflow-hidden"
                                                >


                                                    {/* REQUEST USER */}

                                                    <div className="p-5">

                                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">


                                                            <div className="flex items-start gap-4">

                                                                <div
                                                                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                                                        requestUser.role === 'Organizer'
                                                                            ? 'bg-blue-100 text-blue-600'
                                                                            : 'bg-green-100 text-green-600'
                                                                    }`}
                                                                >

                                                                    <span className="font-bold">

                                                                        {requestUser.firstName
                                                                            ?.charAt(0)
                                                                            .toUpperCase()
                                                                        }

                                                                    </span>

                                                                </div>


                                                                <div>

                                                                    <div className="flex items-center gap-2 flex-wrap">

                                                                        <h3 className="font-semibold text-gray-800">

                                                                            {requestUser.firstName}{' '}
                                                                            {requestUser.lastName}

                                                                        </h3>


                                                                        <span
                                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                                requestUser.role === 'Organizer'
                                                                                    ? 'bg-blue-50 text-blue-600'
                                                                                    : 'bg-green-50 text-green-600'
                                                                            }`}
                                                                        >

                                                                            {requestUser.role}

                                                                        </span>

                                                                    </div>


                                                                    <p className="text-sm text-gray-500 mt-1">

                                                                        @{requestUser.username}

                                                                    </p>


                                                                    <p className="text-sm text-gray-500">

                                                                        {requestUser.email}

                                                                    </p>


                                                                    <p className="text-xs font-mono text-gray-400 mt-1">

                                                                        {requestUser.userId}

                                                                    </p>

                                                                </div>

                                                            </div>



                                                            {/* ACTIONS */}

                                                            <div className="flex gap-2 shrink-0">

                                                                <button
                                                                    onClick={() =>
                                                                        rejectDeletion(
                                                                            request
                                                                        )
                                                                    }
                                                                    className="px-4 py-2 border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold cursor-pointer transition"
                                                                >

                                                                    Reject

                                                                </button>


                                                                <button
                                                                    onClick={() =>
                                                                        approveDeletion(
                                                                            request
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        impact.hasActiveResponsibilities
                                                                    }
                                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                                        impact.hasActiveResponsibilities
                                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                            : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                                                                    }`}
                                                                >

                                                                    Approve

                                                                </button>

                                                            </div>

                                                        </div>



                                                        {/* REQUEST DETAILS */}

                                                        <div className="grid md:grid-cols-2 gap-3 mt-5">

                                                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                                                <p className="text-xs text-gray-400">
                                                                    Reason
                                                                </p>

                                                                <p className="text-sm text-gray-700 mt-1">

                                                                    {requestUser
                                                                        .deletionRequest
                                                                        ?.reason ||
                                                                        'No reason provided'
                                                                    }

                                                                </p>

                                                            </div>


                                                            <div className="bg-[#F8F8F8] rounded-xl p-4">

                                                                <p className="text-xs text-gray-400">
                                                                    Requested
                                                                </p>

                                                                <p className="text-sm text-gray-700 mt-1">

                                                                    {requestUser
                                                                        .deletionRequest
                                                                        ?.requestedAt

                                                                        ? new Date(
                                                                            requestUser
                                                                                .deletionRequest
                                                                                .requestedAt
                                                                        ).toLocaleDateString(
                                                                            'en-US',
                                                                            {
                                                                                month:
                                                                                    'long',

                                                                                day:
                                                                                    'numeric',

                                                                                year:
                                                                                    'numeric'
                                                                            }
                                                                        )

                                                                        : 'Unknown'
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>

                                                    </div>



                                                    {/* ACTIVE RESPONSIBILITIES */}

                                                    {impact.hasActiveResponsibilities && (

                                                        <div className="border-t border-orange-200 bg-orange-50/60 p-5">

                                                            <div className="mb-4">

                                                                <p className="text-sm font-semibold text-orange-700">
                                                                    Active Responsibilities
                                                                </p>


                                                                <p className="text-xs text-orange-600 mt-1">
                                                                    Resolve these before account deletion can be approved.
                                                                </p>

                                                            </div>


                                                            <div className="grid md:grid-cols-2 gap-3">


                                                                {/* TOURNAMENTS */}

                                                                {activeTournaments.length > 0 && (

                                                                    <div className="bg-white border border-orange-200 rounded-xl p-4">

                                                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                                                            Tournaments
                                                                        </p>


                                                                        <div className="space-y-3">

                                                                            {activeTournaments.map(
                                                                                tournament => (

                                                                                    <div
                                                                                        key={
                                                                                            tournament._id
                                                                                        }
                                                                                        className="flex items-center justify-between gap-3"
                                                                                    >

                                                                                        <div className="min-w-0">

                                                                                            <p className="text-sm font-medium text-gray-700 truncate">

                                                                                                {tournament.title}

                                                                                            </p>

                                                                                            {tournament.location && (

                                                                                                <p className="text-xs text-gray-400 truncate">

                                                                                                    {tournament.location}

                                                                                                </p>

                                                                                            )}

                                                                                        </div>


                                                                                        <span className="text-xs text-orange-600 font-semibold shrink-0">

                                                                                            {tournament.status}

                                                                                        </span>

                                                                                    </div>

                                                                                )
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}



                                                                {/* QUICK PLAY */}

                                                                {activeQueueSessions.length > 0 && (

                                                                    <div className="bg-white border border-orange-200 rounded-xl p-4">

                                                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                                                            Quick Play
                                                                        </p>


                                                                        <div className="space-y-3">

                                                                            {activeQueueSessions.map(
                                                                                session => (

                                                                                    <div
                                                                                        key={
                                                                                            session._id
                                                                                        }
                                                                                        className="flex items-center justify-between gap-3"
                                                                                    >

                                                                                        <div className="min-w-0">

                                                                                            <p className="text-sm font-medium text-gray-700 truncate">

                                                                                                {session.name}

                                                                                            </p>


                                                                                            <p className="text-xs text-gray-400">

                                                                                                {session.gameType}

                                                                                                {' • '}

                                                                                                {session.numberOfCourts}{' '}

                                                                                                {session.numberOfCourts === 1
                                                                                                    ? 'Court'
                                                                                                    : 'Courts'
                                                                                                }

                                                                                            </p>

                                                                                        </div>


                                                                                        <span className="text-xs text-orange-600 font-semibold shrink-0">

                                                                                            {session.status}

                                                                                        </span>

                                                                                    </div>

                                                                                )
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}

                                                            </div>

                                                        </div>

                                                    )}

                                                </div>

                                            )

                                        }
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    )

}


export default UserManagement