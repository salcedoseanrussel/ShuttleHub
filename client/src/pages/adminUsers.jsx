import { useEffect, useState } from 'react'
import axios from 'axios'

function AdminUsers() {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')

    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchUsers()
    }, [])

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
            console.log('FETCH USERS ERROR:', err.response?.data || err.message)
        } finally {
            setLoading(false)
        }
    }

    const banUser = async (id) => {
        try {

            await axios.put(
                `http://localhost:5000/api/admin/ban/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            fetchUsers()

        } catch (err) {
            alert(err.response?.data?.message)
        }
    }

    const changeRole = async (id, role) => {
        try {

            await axios.put(
                `http://localhost:5000/api/admin/role/${id}`,
                { role },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            fetchUsers()

        } catch (err) {
            alert(err.response?.data?.message)
        }
    }

    const deleteUser = async (id) => {
        try {

            await axios.delete(
                `http://localhost:5000/api/admin/users/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            fetchUsers()

        } catch (err) {
            alert(err.response?.data?.message)
        }
    }

    return (

        <div className="min-h-screen bg-[#f8f8f8] p-8">

            <h1 className="text-3xl font-semibold text-[#34C759] mb-6">
                User Management
            </h1>

            <div className="flex gap-2 mb-6 flex-wrap">

                <button
                    onClick={() => setFilter('All')}
                    className={`cursor-pointer px-3 py-1 rounded-lg border${
                        filter === 'All'
                            ? 'bg-[#34C759] text-white'
                            : 'bg-white text-gray-700'
                    }`}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter('Player')}
                    className={`px-3 py-1 rounded-lg border ${
                        filter === 'Player'
                            ? 'bg-[#34C759] text-white'
                            : 'bg-white text-gray-700'
                    }`}
                >
                    Players
                </button>

                <button
                    onClick={() => setFilter('Organizer')}
                    className={`px-3 py-1 rounded-lg border ${
                        filter === 'Organizer'
                            ? 'bg-[#34C759] text-white'
                            : 'bg-white text-gray-700'
                    }`}
                >
                    Organizers
                </button>

                <button
                    onClick={() => setFilter('Admin')}
                    className={`px-3 py-1 rounded-lg border ${
                        filter === 'Admin'
                            ? 'bg-[#34C759] text-white'
                            : 'bg-white text-gray-700'
                    }`}
                >
                    Admins
                </button>

                <button
                    onClick={() => setFilter('Banned')}
                    className={`px-3 py-1 rounded-lg border ${
                        filter === 'Banned'
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-700'
                    }`}
                >
                    Banned
                </button>

            </div>

            {loading ? (
                <p className="text-gray-500">Loading users...</p>
            ) : (

                <div className="grid gap-4">

                    {users
                        .filter(user => {

                            if (filter === 'All') return true

                            if (filter === 'Banned') return user.isBanned === true

                            return user.role === filter

                        })
                        .map(user => (

                        <div
                            key={user._id}
                            className="bg-white border border-[#E5E7EB] rounded-xl p-6"
                        >

                            <div className="flex justify-between items-start">

                                <div>

                                    <h2 className="text-lg font-semibold text-[#34C759]">
                                        {user.username}
                                    </h2>

                                    <p className="text-sm text-gray-600">
                                        {user.email}
                                    </p>

                                    <p className="text-sm mt-1 flex items-center gap-2">
                                        Role:

                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${
                                                user.role === 'Admin'
                                                    ? 'bg-red-100 text-red-600'
                                                    : user.role === 'Organizer'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-green-100 text-green-600'
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </p>

                                    {user.isBanned && (
                                        <p className="text-red-500 font-semibold text-sm mt-1">
                                            {user.isBanned && (
                                                <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-red-500 text-white font-semibold">
                                                    BANNED
                                                </span>
                                            )}
                                        </p>
                                    )}

                                </div>

                                <div className="flex gap-2 flex-wrap">

                                    <button
                                        onClick={() => banUser(user._id)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                                    >
                                        Ban / Unban
                                    </button>

                                    <button
                                        onClick={() => changeRole(user._id, 'Organizer')}
                                        className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                                    >
                                        Organizer
                                    </button>

                                    <button
                                        onClick={() => changeRole(user._id, 'Player')}
                                        className="bg-gray-500 text-white px-3 py-1 rounded-lg"
                                    >
                                        Player
                                    </button>

                                    <button
                                        onClick={() => deleteUser(user._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-lg"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    )
}

export default AdminUsers