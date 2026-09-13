import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
    FaEye,
    FaEyeSlash,
    FaCheck,
    FaTimes
} from 'react-icons/fa'

import authBackground from '../assets/ChatGPT Image Aug 29, 2026, 09_58_30 PM.png'

function Register(){

    const navigate = useNavigate()

    const [step, setStep] = useState(1)

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Player'
    })

    const [organizerApplication, setOrganizerApplication] = useState({
        organizationName: '',
        organizerType: '',
        position: '',
        contactNumber: '',
        experience: '',
        previousEvents: '',
        intendedUse: ''
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })

    }

    const handleOrganizerChange = (e) => {

        setOrganizerApplication({
            ...organizerApplication,
            [e.target.name]: e.target.value
        })

    }

    // =========================
    // PASSWORD REQUIREMENTS
    // =========================

    const passwordRequirements = {

        length: form.password.length >= 8,

        uppercase: /[A-Z]/.test(form.password),

        number: /[0-9]/.test(form.password)

    }

    const passwordValid =
        passwordRequirements.length &&
        passwordRequirements.uppercase &&
        passwordRequirements.number

    // =========================
    // CONFIRM PASSWORD
    // =========================

    const passwordsMatch =
        form.password === form.confirmPassword

    // =========================
    // EMAIL VALIDATION
    // =========================

    const emailValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            form.email.trim()
        )

    // =========================
    // NEXT STEP
    // =========================

    const handleNext = () => {

        if (
            !form.firstName.trim() ||
            !form.lastName.trim() ||
            !form.username.trim() ||
            !form.email.trim()
        ) {

            alert(
                'Please complete all required fields.'
            )

            return

        }


        if (!emailValid) {

            alert(
                'Please enter a valid email address.'
            )

            return

        }


        setStep(2)

    }

    // =========================
    // ORGANIZER FORM VALIDATION
    // =========================

    const organizerFormValid =
        organizerApplication.organizerType.trim() &&
        organizerApplication.position.trim() &&
        organizerApplication.contactNumber.trim() &&
        organizerApplication.experience.trim() &&
        organizerApplication.intendedUse.trim()


    const handleSecurityContinue = (e) => {

        e.preventDefault()

        if (!passwordValid) {

            alert(
                'Password must be at least 8 characters long, contain one uppercase letter, and contain one number.'
            )

            return
        }

        if (!passwordsMatch) {

            alert('Passwords do not match.')

            return
        }

        if (form.role === 'Organizer') {

            setStep(3)

            return
        }

        handleRegister(e)

    }


    // =========================
    // REGISTER
    // =========================

    const handleRegister = async (e) => {

        e.preventDefault()

        if (!passwordValid) {

            alert(
                'Password must be at least 8 characters long, contain one uppercase letter, and contain one number.'
            )

            return

        }

        if (!passwordsMatch) {

            alert('Passwords do not match.')

            return

        }

        if (
            form.role === 'Organizer' &&
            !organizerFormValid
        ) {

            alert(
                'Please complete all required Organizer application fields.'
            )

            return

        }

        try {

            setLoading(true)

            const {
                confirmPassword,
                ...accountData
            } = form

            const registrationData = {
                ...accountData,

                ...(form.role === 'Organizer'
                    ? {
                        organizerApplication: {
                            organizationName:
                                organizerApplication.organizationName.trim(),

                            organizerType:
                                organizerApplication.organizerType.trim(),

                            position:
                                organizerApplication.position.trim(),

                            contactNumber:
                                organizerApplication.contactNumber.trim(),

                            experience:
                                organizerApplication.experience.trim(),

                            previousEvents:
                                organizerApplication.previousEvents.trim(),

                            intendedUse:
                                organizerApplication.intendedUse.trim()
                        }
                    }
                    : {})
            }

            const response = await axios.post(
                'http://localhost:5000/api/auth/register',
                registrationData
            )

            console.log(
                'REGISTER RESPONSE:',
                JSON.stringify(response.data, null, 2)
            )

            console.log(
                'STATUS:',
                response.status
            )

            // =========================
            // ORGANIZER REGISTRATION
            // =========================

            if (
                form.role === 'Organizer'
            ) {

                localStorage.removeItem('token')
                localStorage.removeItem('user')

                await Swal.fire({
                    title: 'Registration Submitted',
                    text: 'Your Organizer account is waiting for Admin approval. You can log in after your registration has been approved.',
                    icon: 'success',
                    confirmButtonColor: '#34C759'
                })

                navigate('/')

                return
            }


            // =========================
            // PLAYER AUTO LOGIN
            // =========================

            if (
                !response.data.token ||
                !response.data.user
            ) {

                alert(
                    'Account created, but automatic login failed.'
                )

                return
            }


            localStorage.setItem(
                'token',
                response.data.token
            )

            localStorage.setItem(
                'user',
                JSON.stringify(
                    response.data.user
                )
            )


            navigate('/player')

        } catch (err) {

            console.log('REGISTER ERROR:', err)

            console.log(
                'STATUS:',
                err.response?.status
            )

            console.log(
                'SERVER RESPONSE:',
                JSON.stringify(
                    err.response?.data,
                    null,
                    2
                )
            )

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Error creating account'
            )

        } finally {

            setLoading(false)

        }

    }

    // =========================
    // REQUIREMENT ITEM
    // =========================

    const Requirement = ({ valid, children }) => (

        <div
            className={`flex items-center gap-2 text-sm ${
                valid
                    ? 'text-green-600'
                    : 'text-gray-400'
            }`}
        >

            {valid ? (
                <FaCheck />
            ) : (
                <FaTimes />
            )}

            <span>
                {children}
            </span>

        </div>

    )

    return (

        <div className="fixed inset-0 overflow-hidden">

            {/* BLURRED FULL-SCREEN BACKGROUND */}
            <div
                className="absolute -inset-3 bg-cover bg-center bg-no-repeat blur-[6px] scale-105"
                style={{
                    backgroundImage: `url("${authBackground}")`
                }}
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/20" />

            <div className="relative z-10 w-full h-full min-h-screen flex items-center justify-center p-6">

                <div className="relative z-10 bg-white/95 backdrop-blur-sm w-full max-w-[560px] max-h-[92vh] overflow-y-auto p-8 rounded-2xl border border-white/50 shadow-xl">

                    {/* ========================= */}
                    {/* HEADER */}
                    {/* ========================= */}

                    <h1 className="text-3xl font-semibold text-[#34C759] text-center">
                        ShuttleHub
                    </h1>

                    <p className="text-center text-gray-500">
                        Badminton Manager
                    </p>

                    <p className="text-center text-gray-400 text-sm mt-2 mb-6">
                        Create your account
                    </p>


                    {/* ========================= */}
                    {/* STEP INDICATOR */}
                    {/* ========================= */}

                    <div className="flex items-center mb-7">

                        <div className="flex items-center gap-2">

                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    step >= 1
                                        ? 'bg-[#34C759] text-white'
                                        : 'bg-gray-100 text-gray-400'
                                }`}
                            >
                                1
                            </div>

                            <span
                                className={`text-sm font-semibold ${
                                    step >= 1
                                        ? 'text-gray-700'
                                        : 'text-gray-400'
                                }`}
                            >
                                Account
                            </span>

                        </div>


                        <div className="flex-1 h-px bg-gray-200 mx-3" />


                        <div className="flex items-center gap-2">

                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    step >= 2
                                        ? 'bg-[#34C759] text-white'
                                        : 'bg-gray-100 text-gray-400'
                                }`}
                            >
                                2
                            </div>

                            <span
                                className={`text-sm font-semibold ${
                                    step >= 2
                                        ? 'text-gray-700'
                                        : 'text-gray-400'
                                }`}
                            >
                                Security
                            </span>

                        </div>


                        {form.role === 'Organizer' && (
                            <>

                                <div className="flex-1 h-px bg-gray-200 mx-3" />


                                <div className="flex items-center gap-2">

                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                            step >= 3
                                                ? 'bg-[#34C759] text-white'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                    >
                                        3
                                    </div>

                                    <span
                                        className={`text-sm font-semibold ${
                                            step >= 3
                                                ? 'text-gray-700'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        Organizer
                                    </span>

                                </div>

                            </>
                        )}

                    </div>


                    {/* ========================= */}
                    {/* STEP 1 */}
                    {/* ========================= */}

                    {step === 1 && (

                        <div>

                            <p className="text-lg font-semibold text-gray-700 mb-1">
                                Account Information
                            </p>

                            <p className="text-sm text-gray-400 mb-5">
                                Enter your basic account details.
                            </p>


                            {/* FIRST + LAST NAME */}

                            <div className="grid grid-cols-2 gap-3 mb-3">

                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className="w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759]"
                                />

                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className="w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759]"
                                />

                            </div>


                            {/* USERNAME */}

                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Username"
                                className="w-full p-3 mb-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759]"
                            />


                            {/* EMAIL */}

                            <div className="mb-5">

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className={`w-full p-3 border rounded-lg outline-none focus:border-[#34C759] ${
                                        form.email && !emailValid
                                            ? 'border-red-400'
                                            : 'border-[#E5E7EB]'
                                    }`}
                                />


                                {form.email && !emailValid && (

                                    <p className="text-xs text-red-500 mt-1">

                                        Please enter a valid email address.

                                    </p>

                                )}

                            </div>


                            {/* CONTINUE */}

                            <button
                                type="button"
                                onClick={handleNext}
                                className="cursor-pointer w-full bg-[#34C759] hover:opacity-90 text-white p-3 rounded-lg font-semibold"
                            >
                                Continue
                            </button>

                        </div>

                    )}


                    {/* ========================= */}
                    {/* STEP 2 */}
                    {/* ========================= */}

                    {step === 2 && (

                        <form onSubmit={handleSecurityContinue}>

                            <p className="text-lg font-semibold text-gray-700 mb-1">
                                Account Security
                            </p>

                            <p className="text-sm text-gray-400 mb-5">
                                Create a strong password for your account.
                            </p>


                            {/* ========================= */}
                            {/* PASSWORD */}
                            {/* ========================= */}

                            <div className="relative mb-3">

                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full p-3 pr-11 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759]"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >

                                    {showPassword
                                        ? <FaEyeSlash />
                                        : <FaEye />
                                    }

                                </button>

                            </div>


                            {/* ========================= */}
                            {/* PASSWORD REQUIREMENTS */}
                            {/* ========================= */}

                            <div className="bg-[#F8F8F8] rounded-xl p-4 mb-4">

                                <p className="text-sm font-semibold text-gray-600 mb-3">
                                    Password must contain:
                                </p>

                                <div className="space-y-2">

                                    <Requirement
                                        valid={passwordRequirements.length}
                                    >
                                        At least 8 characters
                                    </Requirement>

                                    <Requirement
                                        valid={passwordRequirements.uppercase}
                                    >
                                        One uppercase letter
                                    </Requirement>

                                    <Requirement
                                        valid={passwordRequirements.number}
                                    >
                                        One number
                                    </Requirement>

                                </div>

                            </div>


                            {/* ========================= */}
                            {/* CONFIRM PASSWORD */}
                            {/* ========================= */}

                            <div className="relative mb-2">

                                <input
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    className={`w-full p-3 pr-11 border rounded-lg outline-none focus:border-[#34C759] ${
                                        form.confirmPassword &&
                                        !passwordsMatch
                                            ? 'border-red-400'
                                            : 'border-[#E5E7EB]'
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >

                                    {showConfirmPassword
                                        ? <FaEyeSlash />
                                        : <FaEye />
                                    }

                                </button>

                            </div>


                            {/* PASSWORD MATCH MESSAGE */}

                            {form.confirmPassword && (

                                <p
                                    className={`text-xs mb-4 ${
                                        passwordsMatch
                                            ? 'text-green-600'
                                            : 'text-red-500'
                                    }`}
                                >

                                    {passwordsMatch
                                        ? 'Passwords match'
                                        : 'Passwords do not match'
                                    }

                                </p>

                            )}


                            {/* ========================= */}
                            {/* ROLE */}
                            {/* ========================= */}

                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="cursor-pointer w-full p-3 mb-5 border border-gray-200 rounded-lg outline-none focus:border-[#34C759]"
                            >

                                <option value="Player">
                                    Player
                                </option>

                                <option value="Organizer">
                                    Organizer
                                </option>

                            </select>


                            {/* ========================= */}
                            {/* ACTIONS */}
                            {/* ========================= */}

                            <div className="flex gap-3">

                                {/* BACK */}

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="cursor-pointer flex-1 border border-[#E5E7EB] text-gray-600 p-3 rounded-lg font-semibold hover:bg-gray-50"
                                >
                                    Back
                                </button>


                                {/* CREATE ACCOUNT */}

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !passwordValid ||
                                        !passwordsMatch
                                    }
                                    className="cursor-pointer flex-1 bg-[#34C759] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg font-semibold"
                                >

                                    {loading
                                        ? 'Creating...'
                                        : form.role === 'Organizer'
                                        ? 'Continue'
                                        : 'Create Account'
                                    }

                                </button>

                            </div>

                        </form>

                    )}


                    {/* ========================= */}
                    {/* STEP 3 - ORGANIZER APPLICATION */}
                    {/* ========================= */}

                    {step === 3 &&
                        form.role === 'Organizer' && (

                        <form onSubmit={handleRegister}>

                            <p className="text-lg font-semibold text-gray-700 mb-1">
                                Organizer Application
                            </p>

                            <p className="text-sm text-gray-400 mb-5">
                                Tell us about your Organizer background. An Admin will review this information before approving your account.
                            </p>


                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">

                                <p className="text-sm font-semibold text-blue-700">
                                    Organizer approval required
                                </p>

                                <p className="text-xs text-blue-600/80 mt-1">
                                    Your account cannot log in as an Organizer until an Admin approves this application.
                                </p>

                            </div>


                            <div className="mb-3">

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Organization / Club
                                </label>

                                <input
                                    type="text"
                                    name="organizationName"
                                    value={organizerApplication.organizationName}
                                    onChange={handleOrganizerChange}
                                    placeholder="Optional organization, school, or badminton club"
                                    className="w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759]"
                                />

                            </div>


                            <div className="grid sm:grid-cols-2 gap-3 mb-3">

                                <div>

                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Organizer Type *
                                    </label>

                                    <select
                                        name="organizerType"
                                        value={organizerApplication.organizerType}
                                        onChange={handleOrganizerChange}
                                        className="cursor-pointer w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759] bg-white"
                                    >
                                        <option value="">
                                            Select type
                                        </option>
                                        <option value="School / University">
                                            School / University
                                        </option>
                                        <option value="Badminton Club / Community">
                                            Badminton Club / Community
                                        </option>
                                        <option value="Independent Organizer">
                                            Independent Organizer
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>

                                </div>


                                <div>

                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Position / Role *
                                    </label>

                                    <input
                                        type="text"
                                        name="position"
                                        value={organizerApplication.position}
                                        onChange={handleOrganizerChange}
                                        placeholder="e.g. Tournament Committee"
                                        className="w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759]"
                                    />

                                </div>

                            </div>


                            <div className="grid sm:grid-cols-2 gap-3 mb-3">

                                <div>

                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Contact Number *
                                    </label>

                                    <input
                                        type="text"
                                        name="contactNumber"
                                        value={organizerApplication.contactNumber}
                                        onChange={handleOrganizerChange}
                                        placeholder="e.g. 09XXXXXXXXX"
                                        className="w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759]"
                                    />

                                </div>


                                <div>

                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Organizing Experience *
                                    </label>

                                    <select
                                        name="experience"
                                        value={organizerApplication.experience}
                                        onChange={handleOrganizerChange}
                                        className="cursor-pointer w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759] bg-white"
                                    >
                                        <option value="">
                                            Select experience
                                        </option>
                                        <option value="First-time Organizer">
                                            First-time Organizer
                                        </option>
                                        <option value="Less than 1 year">
                                            Less than 1 year
                                        </option>
                                        <option value="1–2 years">
                                            1–2 years
                                        </option>
                                        <option value="3+ years">
                                            3+ years
                                        </option>
                                    </select>

                                </div>

                            </div>


                            <div className="mb-3">

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Intended Use *
                                </label>

                                <select
                                    name="intendedUse"
                                    value={organizerApplication.intendedUse}
                                    onChange={handleOrganizerChange}
                                    className="cursor-pointer w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759] bg-white"
                                >
                                    <option value="">
                                        Select intended use
                                    </option>
                                    <option value="Tournament Management">
                                        Tournament Management
                                    </option>
                                    <option value="Quick Play Management">
                                        Quick Play Management
                                    </option>
                                    <option value="Tournament and Quick Play">
                                        Tournament and Quick Play
                                    </option>
                                </select>

                            </div>


                            <div className="mb-5">

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Previous Events
                                </label>

                                <textarea
                                    name="previousEvents"
                                    value={organizerApplication.previousEvents}
                                    onChange={handleOrganizerChange}
                                    rows="3"
                                    placeholder="Optional. Mention tournaments, leagues, club events, or Quick Play sessions you have helped organize."
                                    className="w-full p-3 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#34C759] resize-none"
                                />

                            </div>


                            <div className="flex gap-3">

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="cursor-pointer flex-1 border border-[#E5E7EB] text-gray-600 p-3 rounded-lg font-semibold hover:bg-gray-50"
                                >
                                    Back
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !organizerFormValid
                                    }
                                    className="cursor-pointer flex-1 bg-[#34C759] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg font-semibold"
                                >
                                    {loading
                                        ? 'Submitting...'
                                        : 'Submit Application'
                                    }
                                </button>

                            </div>

                        </form>

                    )}


                    {/* ========================= */}
                    {/* FOOTER */}
                    {/* ========================= */}

                    <p className="text-sm text-center mt-5 text-gray-500">

                        Already have an account?{' '}

                        <Link
                            to="/"
                            className="text-[#34C759] font-medium"
                        >
                            Sign in
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    )

}

export default Register