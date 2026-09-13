import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import {
    FaUser,
    FaEnvelope,
    FaAt,
    FaCalendarAlt,
    FaShieldAlt,
    FaPen,
    FaLock,
    FaTimes,
    FaEye,
    FaEyeSlash,
    FaTrashAlt,
    FaExclamationTriangle
} from 'react-icons/fa'


function Profile() {

    const [user, setUser] = useState(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)

    const [editing, setEditing] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)


    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: ''
    })


    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })


    // ==========================
    // FETCH PROFILE
    // ==========================

    useEffect(() => {
        fetchProfile()
    }, [])


    const fetchProfile = async () => {

        try {

            setLoading(true)

            const token =
                localStorage.getItem('token')


            const res = await axios.get(
                'http://localhost:5000/api/users/profile',
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            setUser(res.data)


            setForm({
                firstName:
                    res.data.firstName || '',

                lastName:
                    res.data.lastName || '',

                username:
                    res.data.username || '',

                email:
                    res.data.email || ''
            })


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to load profile'
            )

        } finally {

            setLoading(false)

        }

    }


    // ==========================
    // PROFILE INPUT
    // ==========================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]:
                e.target.value
        })

    }


    // ==========================
    // OPEN EDIT
    // ==========================

    const openEditModal = () => {

        setForm({
            firstName:
                user.firstName || '',

            lastName:
                user.lastName || '',

            username:
                user.username || '',

            email:
                user.email || ''
        })

        setEditing(true)

    }


    // ==========================
    // SAVE PROFILE
    // ==========================

    const handleSave = async () => {

        if (
            !form.firstName.trim() ||
            !form.lastName.trim() ||
            !form.username.trim() ||
            !form.email.trim()
        ) {

            toast.error(
                'Please complete all fields'
            )

            return

        }


        try {

            setSaving(true)

            const token =
                localStorage.getItem('token')


            const res = await axios.put(
                'http://localhost:5000/api/users/profile',
                {
                    firstName:
                        form.firstName.trim(),

                    lastName:
                        form.lastName.trim(),

                    username:
                        form.username.trim(),

                    email:
                        form.email.trim()
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            setUser(res.data.user)


            const storedUser =
                JSON.parse(
                    localStorage.getItem('user')
                )


            localStorage.setItem(
                'user',
                JSON.stringify({
                    ...storedUser,

                    firstName:
                        res.data.user.firstName,

                    lastName:
                        res.data.user.lastName,

                    username:
                        res.data.user.username,

                    email:
                        res.data.user.email
                })
            )


            toast.success(
                'Profile updated successfully'
            )


            setEditing(false)


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to update profile'
            )

        } finally {

            setSaving(false)

        }

    }


    // ==========================
    // CHANGE PASSWORD
    // ==========================

    const handlePasswordChange = async () => {

        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {

            toast.error(
                'Please complete all password fields'
            )

            return

        }


        if (
            passwordForm.newPassword.length < 6
        ) {

            toast.error(
                'New password must be at least 6 characters'
            )

            return

        }


        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {

            toast.error(
                'New passwords do not match'
            )

            return

        }


        if (
            passwordForm.currentPassword ===
            passwordForm.newPassword
        ) {

            toast.error(
                'New password must be different from your current password'
            )

            return

        }


        try {

            setUpdatingPassword(true)

            const token =
                localStorage.getItem('token')


            const res = await axios.put(
                'http://localhost:5000/api/users/change-password',
                {
                    currentPassword:
                        passwordForm.currentPassword,

                    newPassword:
                        passwordForm.newPassword
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            toast.success(
                res.data.message ||
                'Password updated successfully'
            )


            setChangingPassword(false)


            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })


            setShowCurrentPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to change password'
            )

        } finally {

            setUpdatingPassword(false)

        }

    }


    // ==========================
    // CLOSE PASSWORD MODAL
    // ==========================

    const closePasswordModal = () => {

        setChangingPassword(false)

        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })

        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)

    }


    // ==========================
    // PASSWORD FIELD
    // ==========================

    const PasswordInput = ({
        label,
        placeholder,
        value,
        onChange,
        visible,
        setVisible
    }) => (

        <div>

            <label className="block text-sm font-medium text-gray-600 mb-2">
                {label}
            </label>


            <div className="relative">

                <input
                    type={
                        visible
                            ? 'text'
                            : 'password'
                    }
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                />


                <button
                    type="button"
                    onClick={() =>
                        setVisible(!visible)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >

                    {visible
                        ? <FaEyeSlash />
                        : <FaEye />
                    }

                </button>

            </div>

        </div>

    )


    // ==========================
    // LOADING
    // ==========================

    if (loading) {

        return (

            <div className="min-h-screen bg-[#F8F8F8] p-8">

                <div className="animate-pulse">

                    <div className="h-9 w-48 bg-gray-200 rounded-lg" />

                    <div className="h-4 w-80 bg-gray-200 rounded mt-3" />


                    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 mt-8">

                        <div className="h-96 bg-white border border-[#E5E7EB] rounded-2xl" />

                        <div className="lg:col-span-2 h-96 bg-white border border-[#E5E7EB] rounded-2xl" />

                    </div>

                </div>

            </div>

        )

    }


    if (!user) {

        return (

            <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">

                <div className="text-center">

                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUser className="text-xl" />
                    </div>

                    <p className="font-semibold text-gray-700">
                        Unable to load profile
                    </p>

                    <button
                        onClick={fetchProfile}
                        className="mt-4 px-5 py-2.5 bg-[#34C759] text-white rounded-xl font-semibold cursor-pointer hover:bg-[#2fb450] transition"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        )

    }


    const initials =
        `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
            .toUpperCase()



    // ==========================
    // SWITCH ACCOUNT ROLE
    // ==========================

    const handleRoleSwitch = async () => {

        const targetRole =
            user.role === 'Organizer'
                ? 'Player'
                : 'Organizer'


        const result = await Swal.fire({

            title:
                `Switch to ${targetRole}?`,

            text:
                targetRole === 'Organizer'
                    ? 'You will switch to Organizer mode and gain access to Organizer features.'
                    : 'You will switch to Player mode. Your Organizer access will remain approved.',

            icon:
                'question',

            showCancelButton:
                true,

            confirmButtonColor:
                '#34C759',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                `Switch to ${targetRole}`,

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const token =
                localStorage.getItem(
                    'token'
                )


            const res =
                await axios.put(

                    'http://localhost:5000/api/users/switch-role',

                    {
                        role:
                            targetRole
                    },

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                )


            // Replace old token because
            // JWT contains the role

            localStorage.setItem(
                'token',
                res.data.token
            )


            localStorage.setItem(
                'user',
                JSON.stringify(
                    res.data.user
                )
            )


            setUser(
                res.data.user
            )


            await Swal.fire({

                title:
                    `Switched to ${targetRole}`,

                text:
                    targetRole === 'Organizer'
                        ? 'You are now using ShuttleHub as an Organizer.'
                        : 'You are now using ShuttleHub as a Player.',

                icon:
                    'success',

                confirmButtonColor:
                    '#34C759'

            })


            // Reload layout/sidebar so
            // role-based navigation updates

            window.location.reload()


        } catch (err) {

            Swal.fire({

                title:
                    'Switch Failed',

                text:
                    err.response?.data?.message ||
                    'Failed to switch account role.',

                icon:
                    'error',

                confirmButtonColor:
                    '#EF4444'

            })

        }

    }

    // ==========================
    // REQUEST ORGANIZER ACCESS
    // ==========================

    const handleOrganizerRequest = async () => {

        const result = await Swal.fire({

            title: 'Request Organizer Access?',

            text:
                'Your request will be reviewed by an administrator. You will remain a Player while the request is pending.',

            icon: 'question',

            showCancelButton: true,

            confirmButtonColor:
                '#34C759',

            cancelButtonColor:
                '#9CA3AF',

            confirmButtonText:
                'Submit Request',

            cancelButtonText:
                'Cancel'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const token =
                localStorage.getItem('token')


            const res = await axios.post(

                'http://localhost:5000/api/users/request-organizer',

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
                    'Request Submitted',

                text:
                    res.data.message,

                icon:
                    'success',

                confirmButtonColor:
                    '#34C759'

            })


            fetchProfile()


        } catch (err) {

            Swal.fire({

                title:
                    'Request Failed',

                text:
                    err.response?.data?.message ||
                    'Failed to submit Organizer request.',

                icon:
                    'error',

                confirmButtonColor:
                    '#EF4444'

            })

        }

    }

    // ==========================
    // REQUEST ACCOUNT DELETION
    // ==========================

    const handleDeletionRequest = async () => {

        const result = await Swal.fire({

            title: 'Request Account Deletion?',

            html: `
                <div style="text-align:left">
                    <p style="color:#6B7280; margin-bottom:15px;">
                        Your account will not be deleted immediately.
                        An administrator will review your request first.
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
                        id="deletion-reason"
                        class="swal2-textarea"
                        placeholder="Tell us why you want to delete your account..."
                        style="width:100%; margin:0; box-sizing:border-box;"
                    ></textarea>
                </div>
            `,

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor: '#EF4444',

            cancelButtonColor: '#9CA3AF',

            confirmButtonText:
                'Submit Request',

            cancelButtonText:
                'Cancel',

            focusConfirm: false,

            preConfirm: () => {

                return document
                    .getElementById(
                        'deletion-reason'
                    )
                    ?.value
                    ?.trim() || ''

            }

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const token =
                localStorage.getItem('token')


            const res = await axios.post(
                'http://localhost:5000/api/users/request-deletion',
                {
                    reason:
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


            fetchProfile()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to submit deletion request'
            )

        }

    }

    // ==========================
    // CANCEL DELETION REQUEST
    // ==========================

    const handleCancelDeletion = async () => {

        const result = await Swal.fire({

            title: 'Cancel Deletion Request?',

            text:
                'Your account deletion request will be withdrawn.',

            icon: 'question',

            showCancelButton: true,

            confirmButtonColor: '#34C759',

            cancelButtonColor: '#9CA3AF',

            confirmButtonText:
                'Yes, Cancel Request',

            cancelButtonText:
                'Keep Request'

        })


        if (!result.isConfirmed) {
            return
        }


        try {

            const token =
                localStorage.getItem('token')


            const res = await axios.put(
                'http://localhost:5000/api/users/cancel-deletion',
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


            fetchProfile()


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to cancel deletion request'
            )

        }

    }



    return (

        <div className="min-h-screen bg-[#F8F8F8] p-8">


            {/* ==========================
                HEADER
            ========================== */}

            <div className="mb-8">

                <h1 className="text-3xl font-semibold text-[#34C759]">
                    My Profile
                </h1>

                <p className="text-gray-500">
                    Manage your account information and security.
                </p>

            </div>


            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">


                {/* ==========================
                    PROFILE CARD
                ========================== */}

                <div className="space-y-4 h-fit">

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

                    {/* GREEN TOP */}

                    <div className="h-24 bg-[#34C759]/10" />


                    <div className="px-8 pb-8 text-center">

                        {/* AVATAR */}

                        <div className="-mt-14 mx-auto w-28 h-28 rounded-full bg-[#34C759] border-[6px] border-white flex items-center justify-center shadow-sm">

                            <span className="text-white text-3xl font-bold">
                                {initials}
                            </span>

                        </div>


                        {/* NAME */}

                        <h2 className="text-2xl font-bold text-gray-800 mt-4">
                            {user.firstName}{' '}
                            {user.lastName}
                        </h2>


                        <p className="text-gray-500 mt-1">
                            @{user.username}
                        </p>

                        {user.userId && (
                            <p className="text-xs text-gray-400 mt-2 font-mono">
                                ID: {user.userId}
                            </p>
                        )}


                        {/* ROLE */}

                        <span
                            className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-semibold ${
                                user.role === 'Organizer'
                                    ? 'bg-blue-50 text-blue-600'
                                    : user.role === 'Admin'
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-green-50 text-green-600'
                            }`}
                        >
                            {user.role === 'Admin' && (
                                <FaShieldAlt className="text-xs" />
                            )}

                            {user.role}
                        </span>


                        {/* RESTRICTED */}

                        {user.isRestricted && (

                            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3">

                                <p className="text-sm font-semibold text-red-600">
                                    Account Restricted
                                </p>

                                <p className="text-xs text-red-500 mt-1">
                                    Some account features are currently unavailable.
                                </p>

                            </div>

                        )}


                        {/* DETAILS */}

                        <div className="mt-7 pt-6 border-t border-[#E5E7EB] space-y-4 text-left">


                            <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <FaEnvelope />
                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs text-gray-400">
                                        Email
                                    </p>

                                    <p className="text-sm font-medium text-gray-700 truncate">
                                        {user.email}
                                    </p>

                                </div>

                            </div>


                            <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <FaCalendarAlt />
                                </div>

                                <div>

                                    <p className="text-xs text-gray-400">
                                        Member Since
                                    </p>

                                    <p className="text-sm font-medium text-gray-700">

                                        {user.createdAt
                                            ? new Date(
                                                user.createdAt
                                            ).toLocaleDateString(
                                                'en-US',
                                                {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                }
                                            )
                                            : 'N/A'
                                        }

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                    {/* ==========================
                        SWITCH ACCOUNT MODE
                    ========================== */}

                    {user.role !== 'Admin' &&
                        user.organizerAccess === true &&
                        (
                            user.organizerRequest?.status === 'Approved' ||
                            user.organizerRequestStatus === 'Approved'
                        ) && (

                            <div
                                className={`border rounded-2xl p-5 ${
                                    user.role === 'Organizer'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-blue-50 border-blue-200'
                                }`}
                            >

                                <div className="flex items-start gap-3">

                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            user.role === 'Organizer'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-blue-100 text-blue-600'
                                        }`}
                                    >
                                        <FaUser />
                                    </div>


                                    <div className="min-w-0">

                                        <p
                                            className={`text-sm font-bold ${
                                                user.role === 'Organizer'
                                                    ? 'text-green-700'
                                                    : 'text-blue-700'
                                            }`}
                                        >
                                            Switch Account Mode
                                        </p>

                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">

                                            You are currently using ShuttleHub as a{' '}

                                            <span className="font-semibold">
                                                {user.role}
                                            </span>.

                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={handleRoleSwitch}
                                    className={`w-full mt-4 px-4 py-3 rounded-xl text-sm font-semibold text-white transition cursor-pointer ${
                                        user.role === 'Organizer'
                                            ? 'bg-[#34C759] hover:bg-[#2fb450]'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                                >

                                    {user.role === 'Organizer'
                                        ? 'Switch to Player'
                                        : 'Switch to Organizer'
                                    }

                                </button>

                            </div>

                        )}

                </div>


                {/* ==========================
                    RIGHT SIDE
                ========================== */}

                <div className="lg:col-span-2 space-y-6">


                    {/* ACCOUNT INFORMATION */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

                        <div className="p-8">

                            <div className="flex items-center justify-between gap-4 mb-7">

                                <div>

                                    <h2 className="text-xl font-bold text-gray-800">
                                        Account Information
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Your personal and account details.
                                    </p>

                                </div>


                                <button
                                    onClick={openEditModal}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-[#34C759] hover:bg-[#2fb450] text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                                >
                                    <FaPen className="text-xs" />

                                    Edit
                                </button>

                            </div>


                            <div className="grid md:grid-cols-2 gap-5">

                                {/* USER ID */}

                                <div className="border border-[#E5E7EB] rounded-xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                                            <FaUser />
                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-xs text-gray-400">
                                                User ID
                                            </p>

                                            <p className="font-mono font-semibold text-gray-700 mt-1">
                                                {user.userId || 'N/A'}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* ROLE */}

                                <div className="border border-[#E5E7EB] rounded-xl p-5">

                                    <div className="flex items-center justify-between gap-4">

                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    user.role === 'Admin'
                                                        ? 'bg-red-50 text-red-500'
                                                        : user.role === 'Organizer'
                                                        ? 'bg-blue-50 text-blue-500'
                                                        : 'bg-green-50 text-green-500'
                                                }`}
                                            >

                                                {user.role === 'Admin' ? (
                                                    <FaShieldAlt />
                                                ) : (
                                                    <FaUser />
                                                )}

                                            </div>


                                            <div>

                                                <p className="text-xs text-gray-400">
                                                    Account Role
                                                </p>

                                                <p className="font-semibold text-gray-700 mt-1">
                                                    {user.role}
                                                </p>

                                            </div>

                                        </div>



                                    </div>

                                </div>


                                {/* FIRST NAME */}

                                <div className="border border-[#E5E7EB] rounded-xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                                            <FaUser />
                                        </div>

                                        <div>

                                            <p className="text-xs text-gray-400">
                                                First Name
                                            </p>

                                            <p className="font-semibold text-gray-700 mt-1">
                                                {user.firstName}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* LAST NAME */}

                                <div className="border border-[#E5E7EB] rounded-xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                                            <FaUser />
                                        </div>

                                        <div>

                                            <p className="text-xs text-gray-400">
                                                Last Name
                                            </p>

                                            <p className="font-semibold text-gray-700 mt-1">
                                                {user.lastName}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* USERNAME */}

                                <div className="border border-[#E5E7EB] rounded-xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                                            <FaAt />
                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-xs text-gray-400">
                                                Username
                                            </p>

                                            <p className="font-semibold text-gray-700 mt-1 truncate">
                                                @{user.username}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* EMAIL */}

                                <div className="border border-[#E5E7EB] rounded-xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center shrink-0">
                                            <FaEnvelope />
                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-xs text-gray-400">
                                                Email Address
                                            </p>

                                            <p className="font-semibold text-gray-700 mt-1 truncate">
                                                {user.email}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==========================
                        SECURITY
                    ========================== */}

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

                        {/* HEADER */}

                        <div className="px-8 py-6 border-b border-[#E5E7EB]">

                            <div className="flex items-center gap-4">

                                <div className="w-11 h-11 bg-[#34C759]/10 text-[#34C759] rounded-xl flex items-center justify-center shrink-0">

                                    <FaShieldAlt />

                                </div>


                                <div>

                                    <h2 className="text-xl font-bold text-gray-800">
                                        Password & Security
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Manage your password and keep your account secure.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="p-8">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                                <div className="flex items-center gap-4">

                                    <div className="w-12 h-12 bg-gray-50 border border-[#E5E7EB] text-gray-500 rounded-xl flex items-center justify-center shrink-0">

                                        <FaLock />

                                    </div>


                                    <div>

                                        <p className="font-semibold text-gray-800">
                                            Account Password
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Change your password regularly to help keep your account protected.
                                        </p>

                                    </div>

                                </div>


                                <button
                                    onClick={() =>
                                        setChangingPassword(true)
                                    }
                                    className="shrink-0 px-5 py-2.5 bg-[#34C759] hover:bg-[#2fb450] text-white rounded-xl font-semibold text-sm transition cursor-pointer"
                                >
                                    Change Password
                                </button>

                            </div>


                            {/* SECURITY TIP */}

                            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">

                                <div className="flex items-start gap-3 bg-[#F8F8F8] rounded-xl p-4">

                                    <div className="w-8 h-8 bg-[#34C759]/10 text-[#34C759] rounded-lg flex items-center justify-center shrink-0 mt-0.5">

                                        <FaShieldAlt className="text-sm" />

                                    </div>


                                    <div>

                                        <p className="text-sm font-semibold text-gray-700">
                                            Keep your account secure
                                        </p>

                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            Use a strong password that you don't use on other accounts.
                                            Never share your password with anyone.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==========================
                        ORGANIZER ACCESS
                    ========================== */}

                    {user.role === 'Player' &&
                        user.organizerAccess !== true &&
                        user.organizerRequest?.status !== 'Approved' && (

                        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

                            {/* HEADER */}

                            <div className="px-8 py-6 border-b border-[#E5E7EB]">

                                <div className="flex items-center gap-4">

                                    <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">

                                        <FaShieldAlt />

                                    </div>


                                    <div>

                                        <h2 className="text-xl font-bold text-gray-800">
                                            Organizer Access
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Request permission to create and manage tournaments and Quick Play sessions.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* BODY */}

                            <div className="p-8">

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                                    <div>

                                        <p className="font-semibold text-gray-800">
                                            Become an Organizer
                                        </p>


                                        {user.organizerRequest?.status === 'Pending' ? (

                                            <>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Your Organizer request is currently waiting for administrator review.
                                                </p>


                                                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold">

                                                    <span className="w-2 h-2 rounded-full bg-orange-400" />

                                                    Pending Review

                                                </div>

                                            </>

                                        ) : user.organizerRequest?.status === 'Rejected' ? (

                                            <>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Your previous Organizer request was not approved.
                                                    You may submit another request.
                                                </p>


                                                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">

                                                    <span className="w-2 h-2 rounded-full bg-red-400" />

                                                    Previous Request Rejected

                                                </div>

                                            </>

                                        ) : (

                                            <p className="text-sm text-gray-500 mt-1 max-w-lg">
                                                Organizer accounts can create tournaments,
                                                manage participants, and run Quick Play sessions.
                                                Your request must first be approved by an administrator.
                                            </p>

                                        )}

                                    </div>


                                    <button
                                        onClick={
                                            handleOrganizerRequest
                                        }
                                        disabled={
                                            user.organizerRequest
                                                ?.status === 'Pending'
                                        }
                                        className={`shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                                            user.organizerRequest
                                                ?.status === 'Pending'
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                                        }`}
                                    >

                                        {user.organizerRequest
                                            ?.status === 'Pending'
                                            ? 'Request Pending'
                                            : user.organizerRequest
                                                ?.status === 'Rejected'
                                            ? 'Request Again'
                                            : 'Request Organizer Access'
                                        }

                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                    {/* ==========================
                        DANGER ZONE
                    ========================== */}

                    {user.role !== 'Admin' && (

                        <div className="bg-white border border-red-200 rounded-2xl overflow-hidden">

                            {/* HEADER */}

                            <div className="px-8 py-6 border-b border-red-100">

                                <div className="flex items-center gap-4">

                                    <div className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">

                                        <FaExclamationTriangle />

                                    </div>


                                    <div>

                                        <h2 className="text-xl font-bold text-gray-800">
                                            Danger Zone
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Actions in this section can affect your account.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* DELETE ACCOUNT */}

                            <div className="p-8">

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                                    <div className="flex items-start gap-4">

                                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">

                                            <FaTrashAlt />

                                        </div>


                                        <div>

                                            <p className="font-semibold text-gray-800">
                                                Delete Account
                                            </p>


                                            {user.deletionRequest?.status === 'Pending' ? (

                                                <>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Your account deletion request is waiting for administrator review.
                                                    </p>


                                                    {user.deletionRequest?.requestedAt && (

                                                        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold">

                                                            <span className="w-2 h-2 rounded-full bg-orange-400" />

                                                            Pending since{' '}

                                                            {new Date(
                                                                user.deletionRequest.requestedAt
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                }
                                                            )}

                                                        </div>

                                                    )}

                                                </>

                                            ) : (

                                                <p className="text-sm text-gray-500 mt-1 max-w-lg">
                                                    Request permanent deletion of your ShuttleHub account.
                                                    An administrator will review your request before your
                                                    account is deleted.
                                                </p>

                                            )}

                                        </div>

                                    </div>


                                    {user.deletionRequest?.status === 'Pending' ? (

                                        <button
                                            onClick={handleCancelDeletion}
                                            className="shrink-0 px-5 py-2.5 border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition cursor-pointer"
                                        >
                                            Cancel Request
                                        </button>

                                    ) : (

                                        <button
                                            onClick={handleDeletionRequest}
                                            className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition cursor-pointer"
                                        >

                                            <FaTrashAlt className="text-xs" />

                                            Request Deletion

                                        </button>

                                    )}

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>


            {/* ==========================
                EDIT PROFILE MODAL
            ========================== */}

            {editing && (

                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !saving
                        ) {
                            setEditing(false)
                        }

                    }}
                >

                    <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden">

                        {/* MODAL HEADER */}

                        <div className="flex items-start justify-between p-7 border-b border-[#E5E7EB]">

                            <div>

                                <h2 className="text-2xl font-semibold text-[#34C759]">
                                    Edit Profile
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Update your personal account information.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(false)
                                }
                                disabled={saving}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition"
                            >
                                <FaTimes />
                            </button>

                        </div>


                        {/* FORM */}

                        <div className="p-7">

                            <div className="grid md:grid-cols-2 gap-5">


                                <div>

                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        First Name
                                    </label>

                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        placeholder="First name"
                                        className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                    />

                                </div>


                                <div>

                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Last Name
                                    </label>

                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                    />

                                </div>

                            </div>


                            <div className="mt-5">

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Username
                                </label>

                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Username"
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                />

                            </div>


                            <div className="mt-5">

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Email address"
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                />

                            </div>


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 mt-8">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditing(false)
                                    }
                                    disabled={saving}
                                    className="px-6 py-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 font-semibold transition cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-3 rounded-xl bg-[#34C759] hover:bg-[#2fb450] text-white font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >

                                    {saving
                                        ? 'Saving...'
                                        : 'Save Changes'
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ==========================
                CHANGE PASSWORD MODAL
            ========================== */}

            {changingPassword && (

                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !updatingPassword
                        ) {
                            closePasswordModal()
                        }

                    }}
                >

                    <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden">

                        {/* HEADER */}

                        <div className="flex items-start justify-between p-7 border-b border-[#E5E7EB]">

                            <div className="flex items-center gap-4">

                                <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                                    <FaLock />
                                </div>


                                <div>

                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Change Password
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter your current and new password.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={closePasswordModal}
                                disabled={updatingPassword}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition"
                            >
                                <FaTimes />
                            </button>

                        </div>


                        {/* BODY */}

                        <div className="p-7 space-y-5">

                            <PasswordInput
                                label="Current Password"
                                placeholder="Enter current password"
                                value={
                                    passwordForm.currentPassword
                                }
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        currentPassword:
                                            e.target.value
                                    })
                                }
                                visible={
                                    showCurrentPassword
                                }
                                setVisible={
                                    setShowCurrentPassword
                                }
                            />


                            <PasswordInput
                                label="New Password"
                                placeholder="Enter new password"
                                value={
                                    passwordForm.newPassword
                                }
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        newPassword:
                                            e.target.value
                                    })
                                }
                                visible={
                                    showNewPassword
                                }
                                setVisible={
                                    setShowNewPassword
                                }
                            />


                            <PasswordInput
                                label="Confirm New Password"
                                placeholder="Confirm new password"
                                value={
                                    passwordForm.confirmPassword
                                }
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        confirmPassword:
                                            e.target.value
                                    })
                                }
                                visible={
                                    showConfirmPassword
                                }
                                setVisible={
                                    setShowConfirmPassword
                                }
                            />


                            <p className="text-xs text-gray-400">
                                Password must contain at least 6 characters.
                            </p>


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={
                                        closePasswordModal
                                    }
                                    disabled={
                                        updatingPassword
                                    }
                                    className="px-6 py-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 font-semibold transition cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handlePasswordChange
                                    }
                                    disabled={
                                        updatingPassword
                                    }
                                    className="px-6 py-3 rounded-xl bg-[#34C759] hover:bg-[#2fb450] text-white font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >

                                    {updatingPassword
                                        ? 'Updating...'
                                        : 'Update Password'
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )

}

export default Profile