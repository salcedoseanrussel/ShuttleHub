import { useEffect, useState } from 'react'
import { FaBell, FaUserCircle } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Header(){

    const navigate = useNavigate()

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user'))
    )

    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {

        fetchUnreadCount()
        fetchCurrentUser()

        const interval = setInterval(() => {
            fetchUnreadCount()
        }, 10000)

        const handleStorageChange = () => {
            setUser(
                JSON.parse(localStorage.getItem('user'))
            )
        }

        window.addEventListener(
            'storage',
            handleStorageChange
        )

        window.addEventListener(
            'profile-picture-updated',
            handleStorageChange
        )

        return () => {
            clearInterval(interval)
            window.removeEventListener(
                'storage',
                handleStorageChange
            )
            window.removeEventListener(
                'profile-picture-updated',
                handleStorageChange
            )
        }

    }, [])

    const fetchCurrentUser = async () => {

        try {

            const token = localStorage.getItem('token')

            if (!token) return

            const response = await axios.get(
                'http://localhost:5000/api/users/profile',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const currentUser =
                response.data.user || response.data

            setUser(currentUser)

            localStorage.setItem(
                'user',
                JSON.stringify(currentUser)
            )

        } catch (err) {

            console.log('Failed to fetch current user')

        }

    }

    const fetchUnreadCount = async () => {

        try {

            const token = localStorage.getItem('token')

            if (!token) return

            const response = await axios.get(
                'http://localhost:5000/api/notifications/unread-count',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setUnreadCount(response.data.count)

        } catch (err) {

            console.log('Failed to fetch notification count')

        }

    }

    return(

        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex justify-between items-center">

            {/* TITLE */}
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Shuttle<span className="text-[#34C759]">Hub</span>
            </h1>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

                {/* NOTIFICATIONS */}
                <Link
                    to="/notifications"
                    className="relative text-gray-500 hover:text-green-600"
                >

                    <FaBell size={20} />

                    {unreadCount > 0 && (

                        <span
                            className="
                                absolute
                                -top-2
                                -right-2
                                min-w-[18px]
                                h-[18px]
                                px-1
                                flex
                                items-center
                                justify-center
                                bg-red-500
                                text-white
                                text-[10px]
                                font-bold
                                rounded-full
                            "
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>

                    )}

                </Link>

                {/* ROLE */}
                <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        user?.role === 'Organizer'
                            ? 'bg-blue-100 text-blue-600'
                            : user?.role === 'Admin'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                    }`}
                >
                    {user?.role}
                </span>

                {/* PROFILE */}
                <button
                    onClick={() => navigate('/profile')}
                    className="
                        cursor-pointer
                        w-8
                        h-8
                        rounded-full
                        overflow-hidden
                        border
                        border-gray-300
                        bg-gray-100
                        hover:bg-gray-200
                        transition
                        flex
                        items-center
                        justify-center
                    "
                >

                    {user?.profilePicture ? (

                        <img
                            src={`http://localhost:5000/api/users/profile-picture/${user.profilePicture}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />

                    ) : (

                        <FaUserCircle className="text-3xl text-gray-500" />

                    )}

                </button>

            </div>

        </header>

    )

}

export default Header
