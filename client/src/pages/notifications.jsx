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

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


                {/* HEADER */}

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">

                    <div>

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                            <span className="w-6 h-px bg-[#34C759]"/>
                            Activity Center
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                            Notifications
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                            Stay updated with tournament activity, account requests, and other ShuttleHub events.
                        </p>

                    </div>


                    {notifications.length > 0 && (

                        <div className="flex items-center gap-2 text-sm">

                            <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">
                                {notifications.length} total
                            </span>

                            <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium">
                                {unreadCount} unread
                            </span>

                        </div>

                    )}

                </div>


                {/* TOOLBAR */}

                {notifications.length > 0 && (

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-5">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">


                            <div className="flex flex-wrap gap-2">

                                {[
                                    {
                                        key:'all',
                                        label:'All'
                                    },
                                    {
                                        key:'unread',
                                        label:`Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`
                                    },
                                    {
                                        key:'read',
                                        label:'Read'
                                    }
                                ].map(item => (

                                    <button
                                        key={item.key}
                                        onClick={() => setFilter(item.key)}
                                        className={`cursor-pointer px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                                            filter === item.key
                                                ? 'bg-[#34C759] text-white border-[#34C759] shadow-sm'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                                        }`}
                                    >
                                        {item.label}
                                    </button>

                                ))}

                            </div>


                            <div className="flex flex-wrap gap-2">

                                {unreadCount > 0 && (

                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-[#2FAE4F] hover:bg-emerald-50/40 transition"
                                    >
                                        <FaCheckDouble className="text-xs"/>
                                        Mark all as read
                                    </button>

                                )}


                                <button
                                    onClick={handleDeleteAll}
                                    className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-red-600 border border-red-100 hover:bg-red-50 transition"
                                >
                                    <FaTrash className="text-xs"/>
                                    Delete all
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* CONTENT */}

                {loading ? (

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-14 text-center">

                        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>

                        <p className="text-sm font-medium text-slate-500">
                            Loading notifications...
                        </p>

                    </div>

                ) : filteredNotifications.length === 0 ? (

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-14 text-center">

                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#34C759] flex items-center justify-center mx-auto mb-4">
                            <FaBell className="text-xl"/>
                        </div>

                        <h2 className="text-lg font-semibold text-slate-900">
                            {filter === 'unread'
                                ? 'No Unread Notifications'
                                : filter === 'read'
                                ? 'No Read Notifications'
                                : 'No Notifications'
                            }
                        </h2>

                        <p className="text-sm text-slate-500 mt-2">
                            You're all caught up.
                        </p>

                    </div>

                ) : (

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <div className="divide-y divide-slate-100">

                            {filteredNotifications.map(notification => {

                                const deletionNotification =
                                    isDeletionNotification(
                                        notification
                                    )

                                const clickable =
                                    notification.link ||
                                    deletionNotification ||
                                    notification.tournament

                                return (

                                    <div
                                        key={notification._id}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                        className={`group relative px-5 sm:px-6 py-5 transition ${
                                            notification.isRead
                                                ? 'bg-white'
                                                : 'bg-emerald-50/35'
                                        } ${
                                            clickable
                                                ? 'cursor-pointer hover:bg-slate-50'
                                                : ''
                                        }`}
                                    >

                                        {!notification.isRead && (
                                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#34C759]"/>
                                        )}


                                        <div className="flex items-start gap-4">

                                            <div
                                                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    notification.isRead
                                                        ? 'bg-slate-100 text-slate-500'
                                                        : 'bg-emerald-50 text-[#34C759]'
                                                }`}
                                            >
                                                <FaBell className="text-sm"/>
                                            </div>


                                            <div className="flex-1 min-w-0">

                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                                                    <div className="min-w-0">

                                                        <p
                                                            className={`text-sm leading-6 ${
                                                                notification.isRead
                                                                    ? 'font-medium text-slate-700'
                                                                    : 'font-semibold text-slate-900'
                                                            }`}
                                                        >
                                                            {notification.message}
                                                        </p>


                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">

                                                            {notification.tournamentTitle && (
                                                                <span>
                                                                    Tournament: <span className="font-medium text-slate-700">{notification.tournamentTitle}</span>
                                                                </span>
                                                            )}

                                                            {notification.organizerUsername && (
                                                                <span>
                                                                    Organizer: <span className="font-medium text-slate-700">{notification.organizerUsername}</span>
                                                                </span>
                                                            )}

                                                        </div>


                                                        <p className="text-[11px] text-slate-400 mt-2.5">
                                                            {new Date(
                                                                notification.createdAt
                                                            ).toLocaleString()}
                                                        </p>

                                                    </div>


                                                    <div
                                                        className="flex items-center gap-2 shrink-0"
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
                                                                className="cursor-pointer w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-[#34C759] hover:border-emerald-300 transition"
                                                            >
                                                                <FaCheck className="text-xs"/>
                                                            </button>

                                                        )}


                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    notification._id
                                                                )
                                                            }
                                                            title="Delete notification"
                                                            className="cursor-pointer w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition"
                                                        >
                                                            <FaTrash className="text-xs"/>
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                )

                            })}

                        </div>

                    </div>

                )}

            </div>

        </div>

    )


}


export default Notifications