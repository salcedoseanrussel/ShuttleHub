import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

import authBackground from '../assets/ChatGPT Image Aug 29, 2026, 09_58_30 PM.png'

function Login(){

    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleLogin = async (e) => {

        e.preventDefault()

        try {

            setLoading(true)
            setMessage('')

            const response = await axios.post(
                'http://localhost:5000/api/auth/login',
                {
                    username: username.trim(),
                    password
                }
            )

            const role =
                response.data.user.role


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

            if (role === 'Player') {

                navigate(
                    '/player',
                    { replace: true }
                )

            }
            else if (role === 'Organizer') {

                navigate(
                    '/organizer',
                    { replace: true }
                )

            }
            else if (role === 'Admin') {

                navigate(
                    '/admin',
                    { replace: true }
                )

            }
            else {

                localStorage.removeItem('token')
                localStorage.removeItem('user')

                setMessage(
                    'Invalid account role.'
                )

            }

        } catch (err) {

            setMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to sign in. Please try again.'
            )

        } finally {

            setLoading(false)

        }

    }

    return (

        <div className="fixed inset-0 w-screen h-screen bg-white overflow-auto">

            <div
                className="hidden"
                style={{
                    backgroundImage:
                        `url("${authBackground}")`
                }}
            />

            

            


            <div className="min-h-screen w-full">

                <div className="min-h-screen w-full bg-white flex">

                    <div className="hidden lg:flex lg:w-[68%] relative overflow-hidden bg-slate-950 text-white px-12 xl:px-20 py-12 flex-col justify-between">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url("${authBackground}")` }}
                        />
                        <div className="absolute inset-0 bg-slate-950/60" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#34C759]/35 via-slate-950/10 to-slate-950/70" />

                        <div className="relative z-10 text-sm font-bold uppercase tracking-[0.18em]">
                            ShuttleHub
                        </div>

                        <div className="relative z-10 max-w-xl">
                            <h2 className="text-5xl xl:text-6xl font-bold tracking-tight mb-5 leading-tight">Welcome to ShuttleHub</h2>
                            <p className="text-base leading-7 text-white/80">Manage badminton tournaments, Quick Play sessions, matches, and player activity in one place.</p>
                        </div>

                        <p className="relative z-10 text-xs text-white/60">
                            Badminton Queueing & Tournament Management System
                        </p>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="w-full lg:w-[32%] flex flex-col justify-center bg-white"
                    >

                    <div className="w-full max-w-[430px] mx-auto px-7 sm:px-10 lg:px-8 pt-8 pb-5">

                        <div className="flex items-center justify-start gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#34C759] mb-3">
                            <span className="w-6 h-px bg-[#34C759]"/>
                            ShuttleHub
                            <span className="w-6 h-px bg-[#34C759]"/>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 text-left">
                            Welcome back
                        </h1>

                        <p className="text-sm text-slate-500 text-left mt-2">
                            Sign in to continue to your badminton workspace.
                        </p>

                    </div>


                    <div className="w-full max-w-[430px] mx-auto px-7 sm:px-10 lg:px-8 py-6">

                        <div className="space-y-5">


                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Username or User ID
                                </label>

                                <input
                                    className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                    placeholder="Enter username or user ID"
                                    value={username}
                                    onChange={(e) => {

                                        setUsername(
                                            e.target.value.toUpperCase()
                                        )

                                        if (message) {
                                            setMessage('')
                                        }

                                    }}
                                    required
                                />

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        className="w-full px-4 py-3 pr-12 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {

                                            setPassword(
                                                e.target.value
                                            )

                                            if (message) {
                                                setMessage('')
                                            }

                                        }}
                                        required
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition"
                                    >

                                        {showPassword ? (
                                            <FaEyeSlash />
                                        ) : (
                                            <FaEye />
                                        )}

                                    </button>

                                </div>

                            </div>

                        </div>


                        {message && (

                            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">

                                <p className="text-sm text-red-600 text-left">
                                    {message}
                                </p>

                            </div>

                        )}


                        <div className="flex justify-end mt-4">

                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-[#2FAE4F] hover:text-[#258E41] transition"
                            >
                                Forgot password?
                            </Link>

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-5 bg-[#34C759] text-white py-3 rounded-xl text-sm font-semibold shadow-sm transition ${
                                loading
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:bg-[#2FB350] cursor-pointer'
                            }`}
                        >

                            {loading
                                ? 'Signing in...'
                                : 'Sign In'
                            }

                        </button>


                        <div className="flex items-center gap-3 my-6">

                            <div className="h-px flex-1 bg-slate-100"/>

                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                                New to ShuttleHub?
                            </span>

                            <div className="h-px flex-1 bg-slate-100"/>

                        </div>


                        <Link
                            to="/register"
                            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition"
                        >
                            Create an account
                        </Link>

                    </div>

                    </form>

                </div>

            </div>

        </div>

    )

}

export default Login
