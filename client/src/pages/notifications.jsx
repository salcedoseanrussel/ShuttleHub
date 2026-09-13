import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
    useNavigate
} from 'react-router-dom'
import {
    FaBell,
    FaCheck,
    FaTrash,
    FaCheckDouble
} from 'react-icons/fa'
import toast from 'react-hot-toast'


function Notifications(){

    const [notifications, setNotifications] = useState([])
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()


    useEffect(() => {
        fetchNotifications()
    }, [])


    // ==========================
    // FETCH NOTIFICATIONS
    // ==========================

    const fetchNotifications = async () => {

        try {

            const token =
                localStorage.getItem('token')

            if (!token) return


            const res = await axios.get(
                'http://localhost:5000/api/notifications',
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            setNotifications(res.data)


        } catch (err) {

            console.log(
                err.response?.data ||
                err.message
            )

        } finally {

            setLoading(false)

        }

    }


    // ==========================
    // MARK ONE AS READ
    // ==========================

    const handleMarkAsRead = async (id) => {

        try {

            const token =
                localStorage.getItem('token')


            await axios.put(
                `http://localhost:5000/api/notifications/${id}/read`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            setNotifications(prev =>
                prev.map(notification =>
                    notification._id === id
                        ? {
                            ...notification,
                            isRead: true
                        }
                        : notification
                )
            )


        } catch (err) {

            console.log(err)

            toast.error(
                'Failed to mark notification as read'
            )

        }

    }


    // ==========================
    // MARK ALL AS READ
    // ==========================

    const handleMarkAllAsRead = async () => {

        try {

            const token =
                localStorage.getItem('token')


            await axios.put(
                'http://localhost:5000/api/notifications/read-all',
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    isRead: true
                }))
            )


            toast.success(
                'All notifications marked as read'
            )


        } catch (err) {

            console.log(err)

            toast.error(
                'Failed to mark notifications as read'
            )

        }

    }


    // ==========================
    // DELETE ONE
    // ==========================

    const handleDelete = async (id) => {

        try {

            const token =
                localStorage.getItem('token')


            await axios.delete(
                `http://localhost:5000/api/notifications/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            setNotifications(prev =>
                prev.filter(notification =>
                    notification._id !== id
                )
            )


            toast.success(
                'Notification deleted'
            )


        } catch (err) {

            console.log(err)

            toast.error(
                'Failed to delete notification'
            )

        }

    }


    // ==========================
    // DELETE ALL
    // ==========================

    const handleDeleteAll = async () => {

        const confirmed =
            window.confirm(
                'Are you sure you want to delete all notifications?'
            )


        if (!confirmed) return


        try {

            const token =
                localStorage.getItem('token')


            await axios.delete(
                'http://localhost:5000/api/notifications',
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            setNotifications([])


            toast.success(
                'All notifications deleted'
            )


        } catch (err) {

            console.log(err)

            toast.error(
                'Failed to delete notifications'
            )

        }

    }


    // ==========================
    // DELETION NOTIFICATION
    // ==========================

    const isDeletionNotification = (
        notification
    ) => {

        return notification.message
            ?.toLowerCase()
            .includes(
                'requested account deletion'
            )

    }


    // ==========================
    // OPEN NOTIFICATION
    // ==========================

    const handleNotificationClick = async (
        notification
    ) => {

        if (!notification.isRead) {

            await handleMarkAsRead(
                notification._id
            )

        }


        // SAVED NOTIFICATION LINK

        if (notification.link) {

            navigate(
                notification.link
            )

            return

        }


        // ACCOUNT DELETION REQUEST

        if (
            isDeletionNotification(
                notification
            )
        ) {

            navigate(
                '/admin/users?deletionRequests=open'
            )

            return

        }


        // TOURNAMENT NOTIFICATION

        if (notification.tournament) {

            navigate(
                `/tournament/${notification.tournament}`
            )

        }

    }


    // ==========================
    // FILTER
    // ==========================

    const filteredNotifications = useMemo(() => {

        if (filter === 'unread') {

            return notifications.filter(
                notification =>
                    !notification.isRead
            )

        }


        if (filter === 'read') {

            return notifications.filter(
                notification =>
                    notification.isRead
            )

        }


        return notifications


    }, [notifications, filter])


    const unreadCount =
        notifications.filter(
            notification =>
                !notification.isRead
        ).length


    return (

        <div className="min-h-screen bg-[#F8F8F8] p-8">


            {/* HEADER */}

            <div className="mb-6">

                <h1 className="text-3xl font-semibold text-[#34C759]">
                    Notifications
                </h1>


                <p className="text-gray-500">
                    Stay updated with tournament activities.
                </p>

            </div>



            {/* ACTION BAR */}

            {notifications.length > 0 && (

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 mb-6">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">


                        {/* FILTERS */}

                        <div className="flex flex-wrap gap-2">

                            <button
                                onClick={() =>
                                    setFilter('all')
                                }
                                className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                                    filter === 'all'
                                        ? 'bg-[#34C759] text-white border-[#34C759]'
                                        : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-[#34C759]'
                                }`}
                            >
                                All
                            </button>


                            <button
                                onClick={() =>
                                    setFilter('unread')
                                }
                                className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                                    filter === 'unread'
                                        ? 'bg-[#34C759] text-white border-[#34C759]'
                                        : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-[#34C759]'
                                }`}
                            >
                                Unread

                                {unreadCount > 0 && (

                                    <span className="ml-2">
                                        ({unreadCount})
                                    </span>

                                )}

                            </button>


                            <button
                                onClick={() =>
                                    setFilter('read')
                                }
                                className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                                    filter === 'read'
                                        ? 'bg-[#34C759] text-white border-[#34C759]'
                                        : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-[#34C759]'
                                }`}
                            >
                                Read
                            </button>

                        </div>



                        {/* ACTIONS */}

                        <div className="flex flex-wrap gap-2">

                            {unreadCount > 0 && (

                                <button
                                    onClick={
                                        handleMarkAllAsRead
                                    }
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-[#E5E7EB] hover:border-[#34C759] hover:text-[#34C759] transition"
                                >

                                    <FaCheck />

                                    Mark all as read

                                </button>

                            )}


                            <button
                                onClick={
                                    handleDeleteAll
                                }
                                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition"
                            >

                                <FaTrash />

                                Delete all

                            </button>

                        </div>

                    </div>

                </div>

            )}



            {/* LOADING */}

            {loading ? (

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center">

                    <p className="text-gray-500">
                        Loading notifications...
                    </p>

                </div>

            ) : filteredNotifications.length === 0 ? (

                /* EMPTY */

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center">

                    <FaBell className="mx-auto text-6xl text-[#34C759] mb-5"/>


                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">

                        {filter === 'unread'
                            ? 'No Unread Notifications'
                            : filter === 'read'
                            ? 'No Read Notifications'
                            : 'No Notifications'
                        }

                    </h2>


                    <p className="text-gray-500">
                        You're all caught up.
                    </p>

                </div>

            ) : (

                /* NOTIFICATIONS */

                <div className="grid gap-4">

                    {filteredNotifications.map(
                        notification => {

                            const deletionNotification =
                                isDeletionNotification(
                                    notification
                                )


                            return (

                                <div
                                    key={notification._id}
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }
                                    className={`rounded-2xl border overflow-hidden transition ${
                                        notification.isRead
                                            ? 'bg-white border-[#E5E7EB]'
                                            : 'bg-[#F0FDF4] border-[#BBF7D0]'
                                    } ${
                                        notification.link ||
                                        deletionNotification ||
                                        notification.tournament
                                            ? 'cursor-pointer hover:border-[#34C759] hover:shadow-sm'
                                            : ''
                                    }`}
                                >

                                    <div className="p-5">

                                        <div className="flex items-start gap-4">


                                            {/* ICON */}

                                            <div
                                                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                                    notification.isRead
                                                        ? 'bg-gray-100'
                                                        : 'bg-[#34C759]/10'
                                                }`}
                                            >

                                                <FaBell
                                                    className={`text-xl ${
                                                        notification.isRead
                                                            ? 'text-gray-500'
                                                            : 'text-[#34C759]'
                                                    }`}
                                                />

                                            </div>



                                            {/* CONTENT */}

                                            <div className="flex-1 min-w-0">

                                                <div className="flex justify-between gap-4">

                                                    <div>

                                                        <h2
                                                            className={`text-lg ${
                                                                notification.isRead
                                                                    ? 'font-medium text-gray-600'
                                                                    : 'font-semibold text-gray-700'
                                                            }`}
                                                        >

                                                            {notification.message}

                                                        </h2>


                                                        {notification.tournamentTitle && (

                                                            <p className="text-gray-500 mt-2">

                                                                Tournament:

                                                                <span className="font-medium text-gray-700">

                                                                    {' '}
                                                                    {notification.tournamentTitle}

                                                                </span>

                                                            </p>

                                                        )}


                                                        {notification.organizerUsername && (

                                                            <p className="text-gray-500 mt-1">

                                                                Organizer:

                                                                <span className="font-medium text-gray-700">

                                                                    {' '}
                                                                    {notification.organizerUsername}

                                                                </span>

                                                            </p>

                                                        )}


                                                    </div>



                                                    {/* ACTION BUTTONS */}

                                                    <div
                                                        className="flex items-center gap-2 flex-shrink-0"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >

                                                        {!notification.isRead && (

                                                            <button
                                                                onClick={() =>
                                                                    handleMarkAsRead(
                                                                        notification._id
                                                                    )
                                                                }
                                                                title="Mark as read"
                                                                className="cursor-pointer w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-gray-500 hover:text-[#34C759] hover:border-[#34C759] transition"
                                                            >

                                                                <FaCheck />

                                                            </button>

                                                        )}


                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    notification._id
                                                                )
                                                            }
                                                            title="Delete notification"
                                                            className="cursor-pointer w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 transition"
                                                        >

                                                            <FaTrash />

                                                        </button>

                                                    </div>

                                                </div>



                                                {/* DATE */}

                                                <div className="mt-4 pt-3 border-t border-[#F3F4F6]">

                                                    <p className="text-sm text-gray-400">

                                                        {new Date(
                                                            notification.createdAt
                                                        ).toLocaleString()}

                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )

                        }
                    )}

                </div>

            )}

        </div>

    )

}


export default Notifications