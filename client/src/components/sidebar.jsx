import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    FaTachometerAlt,
    FaShieldAlt,
    FaTrophy,
    FaPlus,
    FaList,
    FaUsers,
    FaSignOutAlt,
    FaChevronDown,
    FaChevronRight,
    FaChartBar
} from 'react-icons/fa'
import Swal from 'sweetalert2'

function Sidebar() {

    const navigate = useNavigate()
    const location = useLocation()

    const user = JSON.parse(
        localStorage.getItem('user')
    )


    // ==========================
    // DROPDOWNS
    // ==========================

    const tournamentPath =
        location.pathname === '/tournaments' ||
        location.pathname === '/create-tournament' ||
        location.pathname === '/my-tournaments' ||
        location.pathname.startsWith('/tournament/')


    const quickPlayPath =
        location.pathname === '/quick-play' ||
        location.pathname === '/create-queue' ||
        location.pathname.startsWith('/quick-play/')


    const reportsPath =
        location.pathname === '/reports' ||
        location.pathname.startsWith('/reports/')


    const [tournamentsOpen, setTournamentsOpen] =
        useState(tournamentPath)

    const [quickPlayOpen, setQuickPlayOpen] =
        useState(quickPlayPath)


    // ==========================
    // LOGOUT
    // ==========================

    const handleLogout = async () => {

        const result = await Swal.fire({
            title: 'Logout?',
            text: 'You will be signed out of your ShuttleHub account.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Logout',
            cancelButtonText: 'Stay'
        })

        if (!result.isConfirmed) return

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        navigate('/')
    }


    const isActive = (path) =>
        location.pathname === path


    const linkBase =
        'flex items-center gap-3 px-3 py-2 rounded-lg transition'

    const active =
        'bg-white/20 text-white'

    const inactive =
        'text-white/80 hover:bg-white/10 hover:text-white'


    const subLinkBase =
        'flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-sm transition'

    const subActive =
        'bg-white/20 text-white'

    const subInactive =
        'text-white/70 hover:bg-white/10 hover:text-white'


    return (

        <aside className="w-64 bg-[#00A63E] h-screen p-5 flex flex-col fixed">

            {/* LOGO */}

            <div className="mb-8">

                <h1 className="text-white text-2xl font-bold">
                    ShuttleHub
                </h1>

                <p className="text-white/80 text-sm">
                    Badminton Manager
                </p>

            </div>


            <nav className="flex flex-col gap-2">


                {/* ==========================
                    ADMIN
                ========================== */}

                {user?.role === 'Admin' && (

                    <>

                        <Link
                            to="/admin"
                            className={`${linkBase} ${
                                isActive('/admin')
                                    ? active
                                    : inactive
                            }`}
                        >
                            <FaShieldAlt />

                            Admin Dashboard
                        </Link>


                        <Link
                            to="/admin/users"
                            className={`${linkBase} ${
                                isActive('/admin/users')
                                    ? active
                                    : inactive
                            }`}
                        >
                            <FaTachometerAlt />

                            User Management
                        </Link>

                    </>

                )}


                {/* ==========================
                    DASHBOARD
                ========================== */}

                {user?.role !== 'Admin' && user && (

                    <Link
                        to={
                            user.role === 'Organizer'
                                ? '/organizer'
                                : '/player'
                        }
                        className={`${linkBase} ${
                            isActive('/organizer') ||
                            isActive('/player')
                                ? active
                                : inactive
                        }`}
                    >
                        <FaTachometerAlt />

                        Dashboard
                    </Link>

                )}


                {/* ==========================
                    TOURNAMENT DROPDOWN
                ========================== */}

                <div>

                    <button
                        type="button"
                        onClick={() =>
                            setTournamentsOpen(
                                !tournamentsOpen
                            )
                        }
                        className={`${linkBase} w-full justify-between cursor-pointer ${
                            tournamentPath
                                ? active
                                : inactive
                        }`}
                    >

                        <div className="flex items-center gap-3">

                            <FaTrophy />

                            <span>
                                Tournaments
                            </span>

                        </div>


                        {tournamentsOpen
                            ? <FaChevronDown className="text-xs" />
                            : <FaChevronRight className="text-xs" />
                        }

                    </button>


                    {tournamentsOpen && (

                        <div className="flex flex-col gap-1 mt-1">

                            {/* BROWSE */}

                            <Link
                                to="/tournaments"
                                className={`${subLinkBase} ${
                                    isActive('/tournaments')
                                        ? subActive
                                        : subInactive
                                }`}
                            >
                                <FaList className="text-xs" />

                                Browse Tournaments
                            </Link>


                            {/* CREATE */}

                            {user?.role === 'Organizer' && (

                                <Link
                                    to="/create-tournament"
                                    className={`${subLinkBase} ${
                                        isActive('/create-tournament')
                                            ? subActive
                                            : subInactive
                                    }`}
                                >
                                    <FaPlus className="text-xs" />

                                    Create Tournament
                                </Link>

                            )}


                            {/* MY TOURNAMENTS */}

                            {user &&
                                user.role !== 'Admin' && (

                                <Link
                                    to="/my-tournaments"
                                    className={`${subLinkBase} ${
                                        isActive('/my-tournaments')
                                            ? subActive
                                            : subInactive
                                    }`}
                                >
                                    <FaUsers className="text-xs" />

                                    My Tournaments
                                </Link>

                            )}

                        </div>

                    )}

                </div>


                {/* ==========================
                    QUICK PLAY DROPDOWN
                ========================== */}

                <div>

                    <button
                        type="button"
                        onClick={() =>
                            setQuickPlayOpen(
                                !quickPlayOpen
                            )
                        }
                        className={`${linkBase} w-full justify-between cursor-pointer ${
                            quickPlayPath
                                ? active
                                : inactive
                        }`}
                    >

                        <div className="flex items-center gap-3">

                            <FaUsers />

                            <span>
                                Quick Play
                            </span>

                        </div>


                        {quickPlayOpen
                            ? <FaChevronDown className="text-xs" />
                            : <FaChevronRight className="text-xs" />
                        }

                    </button>


                    {quickPlayOpen && (

                        <div className="flex flex-col gap-1 mt-1">

                            {/* BROWSE QUICK PLAY */}

                            <Link
                                to="/quick-play"
                                className={`${subLinkBase} ${
                                    isActive('/quick-play')
                                        ? subActive
                                        : subInactive
                                }`}
                            >
                                <FaList className="text-xs" />

                                Browse Sessions
                            </Link>


                            {/* CREATE QUICK PLAY */}

                            {user?.role === 'Organizer' && (

                                <Link
                                    to="/create-queue"
                                    className={`${subLinkBase} ${
                                        isActive('/create-queue')
                                            ? subActive
                                            : subInactive
                                    }`}
                                >
                                    <FaPlus className="text-xs" />

                                    Create Quick Play
                                </Link>

                            )}

                        </div>

                    )}

                </div>


                {/* ==========================
                    REPORTS
                    ORGANIZER ONLY
                ========================== */}

                {user?.role === 'Organizer' && (

                    <Link
                        to="/reports"
                        className={`${linkBase} ${
                            reportsPath
                                ? active
                                : inactive
                        }`}
                    >
                        <FaChartBar />

                        Reports
                    </Link>

                )}

            </nav>


            {/* ==========================
                LOGOUT
            ========================== */}

            <button
                onClick={handleLogout}
                className="cursor-pointer mt-auto flex items-center gap-2 text-white/80 hover:bg-white/10 hover:text-white py-2 px-3 rounded-lg transition"
            >
                <FaSignOutAlt />

                Logout
            </button>

        </aside>

    )

}

export default Sidebar
