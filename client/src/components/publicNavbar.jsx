import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'

function PublicNavbar(){

    const user = JSON.parse(localStorage.getItem('user'))

    const dashboardPath =
        user?.role === 'Admin'
            ? '/admin'
            : user?.role === 'Organizer'
                ? '/organizer'
                : '/player'

    const navClass = ({ isActive }) =>
        `text-sm font-medium transition ${
            isActive
                ? 'text-[#34C759]'
                : 'text-slate-600 hover:text-slate-950'
        }`

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">

            <div className="max-w-[1480px] mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

                <Link
                    to="/"
                    className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-950"
                >
                    <img
                        src={logo}
                        alt="ShuttleHub logo"
                        className="w-9 h-9 object-contain"
                    />

                    <span>
                        Shuttle<span className="text-[#34C759]">Hub</span>
                    </span>
                </Link>


                <nav className="hidden md:flex items-center gap-7">

                    <NavLink to="/" end className={navClass}>
                        Home
                    </NavLink>

                    <NavLink to="/tournaments" className={navClass}>
                        Tournament Mode
                    </NavLink>

                    <NavLink to="/quick-play" className={navClass}>
                        Queue Mode
                    </NavLink>

                </nav>


                <div className="flex items-center gap-2">

                    {user ? (
                        <Link
                            to={dashboardPath}
                            className="px-4 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/?auth=login"
                                className="px-3 sm:px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-950 transition"
                            >
                                Login
                            </Link>

                            <Link
                                to="/?auth=register"
                                className="px-4 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold transition"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>

            </div>

        </header>
    )
}

export default PublicNavbar
