import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
    FaArrowLeft,
    FaEnvelope,
    FaKey,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaCheckCircle
} from 'react-icons/fa'

import authBackground from '../assets/ChatGPT Image Aug 29, 2026, 09_58_30 PM.png'

function ForgotPassword() {

    const navigate = useNavigate()


    // email | verify | reset | success

    const [step, setStep] =
        useState('email')

    const [email, setEmail] =
        useState('')

    const [code, setCode] =
        useState('')

    const [newPassword, setNewPassword] =
        useState('')

    const [confirmPassword, setConfirmPassword] =
        useState('')

    const [loading, setLoading] =
        useState(false)

    const [showPassword, setShowPassword] =
        useState(false)

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false)


    // ==========================
    // SEND CODE
    // ==========================

    const handleSendCode = async (e) => {

        e.preventDefault()


        if (!email.trim()) {

            toast.error(
                'Enter your email address'
            )

            return

        }


        try {

            setLoading(true)


            const res = await axios.post(
                'http://localhost:5000/api/auth/forgot-password',
                {
                    email:
                        email.trim()
                }
            )


            toast.success(
                res.data.message
            )


            setStep('verify')


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to send verification code'
            )

        } finally {

            setLoading(false)

        }

    }


    // ==========================
    // VERIFY CODE
    // ==========================

    const handleVerifyCode = async (e) => {

        e.preventDefault()


        if (code.length !== 6) {

            toast.error(
                'Enter the 6-digit verification code'
            )

            return

        }


        try {

            setLoading(true)


            const res = await axios.post(
                'http://localhost:5000/api/auth/verify-reset-code',
                {
                    email:
                        email.trim(),

                    code
                }
            )


            toast.success(
                res.data.message
            )


            setStep('reset')


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Invalid verification code'
            )

        } finally {

            setLoading(false)

        }

    }


    // ==========================
    // RESEND CODE
    // ==========================

    const handleResend = async () => {

        try {

            setLoading(true)


            const res = await axios.post(
                'http://localhost:5000/api/auth/forgot-password',
                {
                    email:
                        email.trim()
                }
            )


            setCode('')


            toast.success(
                res.data.message
            )


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to resend code'
            )

        } finally {

            setLoading(false)

        }

    }


    // ==========================
    // RESET PASSWORD
    // ==========================

    const handleResetPassword = async (e) => {

        e.preventDefault()


        if (newPassword.length < 6) {

            toast.error(
                'Password must be at least 6 characters'
            )

            return

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            toast.error(
                'Passwords do not match'
            )

            return

        }


        try {

            setLoading(true)


            const res = await axios.post(
                'http://localhost:5000/api/auth/reset-password',
                {
                    email:
                        email.trim(),

                    code,

                    newPassword
                }
            )


            toast.success(
                res.data.message
            )


            setStep('success')


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to reset password'
            )

        } finally {

            setLoading(false)

        }

    }


    return (

        <div className="fixed inset-0 overflow-auto">

            {/* BLURRED FULL-SCREEN BACKGROUND */}
            <div
                className="fixed -inset-3 bg-cover bg-center bg-no-repeat blur-[6px] scale-105"
                style={{
                    backgroundImage: `url("${authBackground}")`
                }}
            />

            {/* DARK OVERLAY */}
            <div className="fixed inset-0 bg-black/20" />

            {/* PAGE CONTENT */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">

                {/* CARD */}
                <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">

                    {/* BRAND */}
                    <div className="text-center mb-6">

                        <h1 className="text-3xl font-semibold text-[#34C759]">
                            ShuttleHub
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Badminton Manager
                        </p>

                    </div>


                    {/* ========================= */}
                    {/* EMAIL STEP */}
                    {/* ========================= */}

                    {step === 'email' && (

                        <>

                            <div className="w-14 h-14 mx-auto bg-[#34C759]/10 text-[#34C759] rounded-full flex items-center justify-center mb-5">
                                <FaEnvelope className="text-xl" />
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 text-center">
                                Forgot Password?
                            </h2>

                            <p className="text-sm text-gray-500 text-center mt-2 mb-7">
                                Enter the email associated with your
                                ShuttleHub account and we'll send you
                                a verification code.
                            </p>

                            <form onSubmit={handleSendCode}>

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="cursor-pointer w-full mt-5 bg-[#34C759] hover:bg-[#2fb450] text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? 'Sending...'
                                        : 'Send Verification Code'
                                    }
                                </button>

                            </form>

                        </>

                    )}


                    {/* ========================= */}
                    {/* VERIFY STEP */}
                    {/* ========================= */}

                    {step === 'verify' && (

                        <>

                            <div className="w-14 h-14 mx-auto bg-[#34C759]/10 text-[#34C759] rounded-full flex items-center justify-center mb-5">
                                <FaKey className="text-xl" />
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 text-center">
                                Check Your Email
                            </h2>

                            <p className="text-sm text-gray-500 text-center mt-2">
                                We sent a 6-digit verification code to
                            </p>

                            <p className="text-sm font-semibold text-gray-700 text-center mt-1 mb-7 break-all">
                                {email}
                            </p>

                            <form onSubmit={handleVerifyCode}>

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Verification Code
                                </label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => {

                                        const value =
                                            e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 6)

                                        setCode(value)

                                    }}
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition text-center text-2xl font-semibold tracking-[0.4em]"
                                />

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        code.length !== 6
                                    }
                                    className="cursor-pointer w-full mt-5 bg-[#34C759] hover:bg-[#2fb450] text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? 'Verifying...'
                                        : 'Verify Code'
                                    }
                                </button>

                            </form>

                            <div className="text-center mt-5">

                                <p className="text-sm text-gray-500">
                                    Didn't receive the code?
                                </p>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="mt-1 text-sm text-[#34C759] font-semibold cursor-pointer hover:underline disabled:opacity-50"
                                >
                                    Resend Code
                                </button>

                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setCode('')
                                    setStep('email')
                                }}
                                className="cursor-pointer flex items-center justify-center gap-2 w-full text-sm text-gray-500 mt-6 hover:text-gray-700"
                            >
                                <FaArrowLeft />
                                Change email
                            </button>

                        </>

                    )}


                    {/* ========================= */}
                    {/* RESET PASSWORD STEP */}
                    {/* ========================= */}

                    {step === 'reset' && (

                        <>

                            <div className="w-14 h-14 mx-auto bg-[#34C759]/10 text-[#34C759] rounded-full flex items-center justify-center mb-5">
                                <FaLock className="text-xl" />
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800 text-center">
                                Create New Password
                            </h2>

                            <p className="text-sm text-gray-500 text-center mt-2 mb-7">
                                Enter a new password for your ShuttleHub account.
                            </p>

                            <form onSubmit={handleResetPassword}>

                                {/* NEW PASSWORD */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        New Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showPassword
                                                ? <FaEyeSlash />
                                                : <FaEye />
                                            }
                                        </button>

                                    </div>

                                </div>


                                {/* CONFIRM PASSWORD */}
                                <div className="mt-5">

                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Confirm Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showConfirmPassword
                                                ? <FaEyeSlash />
                                                : <FaEye />
                                            }
                                        </button>

                                    </div>

                                </div>

                                <p className="text-xs text-gray-400 mt-3">
                                    Password must be at least 6 characters.
                                </p>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="cursor-pointer w-full mt-6 bg-[#34C759] hover:bg-[#2fb450] text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? 'Resetting...'
                                        : 'Reset Password'
                                    }
                                </button>

                            </form>

                        </>

                    )}


                    {/* ========================= */}
                    {/* SUCCESS STEP */}
                    {/* ========================= */}

                    {step === 'success' && (

                        <div className="text-center">

                            <div className="w-16 h-16 mx-auto bg-green-50 text-[#34C759] rounded-full flex items-center justify-center mb-5">
                                <FaCheckCircle className="text-3xl" />
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800">
                                Password Reset
                            </h2>

                            <p className="text-sm text-gray-500 mt-2 mb-7">
                                Your password has been changed successfully.
                                You can now sign in using your new password.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/')
                                }
                                className="cursor-pointer w-full bg-[#34C759] hover:bg-[#2fb450] text-white py-3 rounded-xl font-semibold transition"
                            >
                                Back to Sign In
                            </button>

                        </div>

                    )}


                    {/* ========================= */}
                    {/* LOGIN LINK */}
                    {/* ========================= */}

                    {step !== 'success' && (

                        <p className="text-sm text-center mt-6 text-gray-500">

                            Remember your password?{' '}

                            <Link
                                to="/"
                                className="text-[#34C759] font-semibold hover:underline"
                            >
                                Sign in
                            </Link>

                        </p>

                    )}

                </div>

            </div>

        </div>

    )

}

export default ForgotPassword