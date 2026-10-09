import { Link } from 'react-router-dom'
import authBackground from '../assets/ChatGPT Image Aug 29, 2026, 09_58_30 PM.png'
import AuthCard from '../components/authCard'
import tournamentImage from '../assets/tournament.png'
import queueImage from '../assets/queue.png'
import logo_alt from '../assets/logo_alt.png'

function Landing(){

    return (
        <div className="min-h-screen bg-[#F6F7F9]">

            <section className="relative h-[820px] lg:h-[860px] overflow-hidden">

                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${authBackground}")` }}
                />

                <div className="absolute inset-0 bg-slate-950/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/35" />

                <div className="relative z-10 max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 h-full grid grid-cols-1 lg:grid-cols-[1fr_430px] gap-10 lg:gap-16 items-center">

                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-5">
                            <img
                                src={logo_alt}
                                alt="ShuttleHub logo"
                                className="w-14 h-14 object-contain"
                            />
                            <div>
                                <p className="text-lg font-semibold text-white leading-none">
                                    ShuttleHub
                                </p>
                                <p className="text-xs uppercase tracking-[0.18em] text-[#34C759] mt-1.5">
                                    Badminton Manager
                                </p>
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                            Play. Compete. Connect.
                        </h1>

                        <p className="text-base sm:text-lg text-slate-200 mt-5 max-w-xl leading-relaxed">
                            Discover badminton tournaments and Queue Mode sessions. Browse ShuttleHub freely, then sign in when you are ready to join.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            <Link to="/tournaments"
                                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm transition">
                                Explore Tournament Mode
                            </Link>

                            <Link to="/quick-play"
                                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 text-white text-sm font-semibold backdrop-blur-sm transition">
                                View Queue Mode
                            </Link>
                        </div>
                    </div>

                    <AuthCard />

                </div>
            </section>

            <section className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                        <span className="w-6 h-px bg-[#34C759]" />
                        Explore ShuttleHub
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                        See what is happening on the court
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                        Browse public events without an account. Sign in only when you are ready to participate.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Link to="/tournaments"
                        className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition">
                        <div className="w-full h-48 sm:h-56 overflow-hidden">
                            <img
                                src={tournamentImage}
                                alt="Badminton tournament"
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                        </div>

                        <div className="p-6 sm:p-7">
                            <h3 className="text-xl font-bold text-slate-950">Tournament Mode</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                Browse available tournaments, schedules, participants, brackets, standings, and results.
                            </p>
                            <span className="inline-block text-sm font-semibold text-[#34C759] mt-5 group-hover:translate-x-1 transition-transform">
                                View tournaments →
                            </span>
                        </div>
                    </Link>

                    <Link to="/quick-play"
                        className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition">
                        <div className="w-full h-48 sm:h-56 overflow-hidden">
                            <img
                                src={queueImage}
                                alt="Badminton quick play"
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                        </div>

                        <div className="p-6 sm:p-7">
                            <h3 className="text-xl font-bold text-slate-950">Queue Mode</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                Check open badminton sessions, courts, participants, current matches, and completed results.
                            </p>
                            <span className="inline-block text-sm font-semibold text-[#34C759] mt-5 group-hover:translate-x-1 transition-transform">
                                View Queue Mode →
                            </span>
                        </div>
                    </Link>
                </div>
            </section>

        </div>
    )
}

export default Landing
