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

        <div className="fixed inset-0 overflow-hidden">

            {/* BLURRED FULL-SCREEN BACKGROUND */}

            <div
                className="absolute -inset-3 bg-cover bg-center bg-no-repeat blur-[6px] scale-105"
                style={{
                    backgroundImage:
                        `url("${authBackground}")`
                }}
            />


            {/* DARK OVERLAY */}

            <div className="absolute inset-0 bg-black/20" />


            <div className="relative z-10 w-full h-full min-h-screen flex items-center justify-center p-6">

                <form
                    onSubmit={handleLogin}
                    className="relative z-10 w-[380px] bg-white/95 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl"
                >

                    <h1 className="text-3xl font-semibold text-[#34C759] text-center">
                        ShuttleHub
                    </h1>


                    <p className="text-center text-gray-500 mb-6">
                        Badminton Manager
                    </p>


                    <p className="text-center text-gray-400 text-sm mb-6">
                        Sign in to manage your badminton journey
                    </p>


                    {/* USERNAME / USER ID */}

                    <input
                        className="w-full p-3 mb-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400"
                        placeholder="Username or User ID"
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


                    {/* PASSWORD */}

                    <div className="relative mb-2">

                        <input
                            type={
                                showPassword
                                    ? 'text'
                                    : 'password'
                            }
                            className="w-full p-3 pr-11 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400"
                            placeholder="Password"
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >

                            {showPassword ? (
                                <FaEyeSlash />
                            ) : (
                                <FaEye />
                            )}

                        </button>

                    </div>


                    {/* ERROR MESSAGE */}

                    {message && (

                        <div className="mb-4 mt-3 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">

                            <p className="text-sm text-red-600 text-center">
                                {message}
                            </p>

                        </div>

                    )}


                    {/* FORGOT PASSWORD */}

                    <div className="text-right mb-4">

                        <Link
                            to="/forgot-password"
                            className="text-sm text-[#34C759] hover:underline"
                        >
                            Forgot Password?
                        </Link>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#34C759] text-white p-3 rounded-lg font-semibold transition ${
                            loading
                                ? 'opacity-60 cursor-not-allowed'
                                : 'hover:opacity-90 cursor-pointer'
                        }`}
                    >

                        {loading
                            ? 'Signing in...'
                            : 'Sign In'
                        }

                    </button>


                    <p className="text-sm text-center mt-4 text-gray-500">

                        Don't have an account?{' '}

                        <Link
                            to="/register"
                            className="text-[#34C759] font-medium"
                        >
                            Sign up
                        </Link>

                    </p>

                </form>

            </div>

        </div>

    )

}

export default Login