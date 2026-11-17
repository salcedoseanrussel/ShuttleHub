import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import authBackground from '../assets/ChatGPT Image Aug 29, 2026, 09_58_30 PM.png'
import AuthCard from '../components/authCard'
import tournamentImage from '../assets/tournament.png'
import queueImage from '../assets/queue.png'
import logo_alt from '../assets/logo_alt.png'

function Landing(){
    const location = useLocation()
    const authRef = useRef(null)
    const exploreRef = useRef(null)
    const authMode = new URLSearchParams(location.search).get('auth')
    const showMobileAuth = authMode === 'login' || authMode === 'register'



    return (
        <div className="min-h-screen bg-[#F6F7F9]">

            <section className="relative [overflow-anchor:none] min-h-[calc(100dvh-4rem)] lg:min-h-0 lg:h-[860px] overflow-hidden">

                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${authBackground}")` }}
                />

                <div className="absolute inset-0 bg-slate-950/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/35" />

                <div className="relative z-10 max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-10 py-9 lg:py-0 min-h-[calc(100dvh-4rem)] lg:min-h-0 lg:h-full flex flex-col lg:grid grid-cols-1 lg:grid-cols-[1fr_430px] gap-5 lg:gap-16 items-center">

                    <div className={`w-full max-w-2xl mx-auto lg:mx-0 flex flex-col min-h-0 lg:block text-center lg:text-left ${showMobileAuth ? 'flex-none' : 'flex-1'} lg:flex-none`}>
                        <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 mb-3 lg:mb-5">
                            <img
                                src={logo_alt}
                                alt="ShuttleHub logo"
                                className="w-14 h-14 object-contain"
                            />
                            <div className="text-left">
                                <p className="text-lg font-semibold text-white leading-none">
                                    ShuttleHub
                                </p>
                                <p className="text-xs uppercase tracking-[0.18em] text-[#34C759] mt-1 lg:mt-1.5">
                                    Badminton Manager
                                </p>
                            </div>
                        </div>

                        <div className={`${showMobileAuth ? 'hidden' : 'flex'} flex-1 flex-col justify-center py-8 lg:contents`}>
                        <h1 className="text-2xl sm:text-3xl lg:text-6xl font-semibold lg:font-bold tracking-tight text-white leading-[1.05]">
                            Play. Compete. Connect.
                        </h1>

                        <p className="text-sm sm:text-base lg:text-lg text-slate-200 mt-5 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Discover badminton tournaments and Queue Mode sessions. Browse ShuttleHub freely, then sign in when you are ready to join.
                        </p>
                        </div>


                        <div className={`${showMobileAuth ? 'hidden' : 'flex'} lg:flex flex-col sm:flex-row justify-center lg:justify-start gap-3 mt-0 lg:mt-8`}>
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

                    <div ref={authRef} className={`${showMobileAuth ? 'block' : 'hidden'} lg:block w-full max-w-lg mx-auto scroll-mt-20`}>
                        <div className="lg:hidden flex justify-end mb-2">
                            <Link to="/" aria-label="Close login or registration" className="inline-flex min-h-11 items-center gap-2 px-3 rounded-lg text-sm text-white hover:bg-white/10">Close <span aria-hidden="true">×</span></Link>
                        </div>
                        <AuthCard />
                    </div>

                    <button
                        type="button"
                        aria-label="Scroll to explore ShuttleHub"
                        onClick={() => {
                            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                            exploreRef.current?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })
                            exploreRef.current?.focus({ preventScroll: true })
                        }}
                        className="lg:hidden shrink-0 self-center flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 motion-safe:animate-bounce">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>
                </div>
            </section>

            <section ref={exploreRef} tabIndex={-1} aria-label="Explore ShuttleHub" className="scroll-mt-16 max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-18">
                <div className="mb-6 lg:mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                        <span className="w-6 h-px bg-[#34C759]" />
                        Explore ShuttleHub
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight text-slate-950">
                        See what is happening on the court
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-500 mt-2 max-w-2xl">
                        Browse public events without an account. Sign in only when you are ready to participate.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-5">
                    <Link to="/tournaments"
                        className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition">
                        <div className="w-full h-28 sm:h-36 lg:h-56 overflow-hidden">
                            <img
                                src={tournamentImage}
                                alt="Badminton tournament"
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                        </div>

                        <div className="p-3 sm:p-4 lg:p-7">
                            <h3 className="text-base lg:text-xl font-bold text-slate-950">Tournament Mode</h3>
                            <p className="text-xs lg:text-sm text-slate-500 mt-1 lg:mt-2 leading-relaxed">
                                Browse available tournaments, schedules, participants, brackets, standings, and results.
                            </p>
                            <span className="inline-block text-xs lg:text-sm font-semibold text-[#34C759] mt-3 lg:mt-5 group-hover:translate-x-1 transition-transform">
                                View tournaments →
                            </span>
                        </div>
                    </Link>

                    <Link to="/quick-play"
                        className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition">
                        <div className="w-full h-28 sm:h-36 lg:h-56 overflow-hidden">
                            <img
                                src={queueImage}
                                alt="Badminton quick play"
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                        </div>

                        <div className="p-3 sm:p-4 lg:p-7">
                            <h3 className="text-base lg:text-xl font-bold text-slate-950">Queue Mode</h3>
                            <p className="text-xs lg:text-sm text-slate-500 mt-1 lg:mt-2 leading-relaxed">
                                Check open badminton sessions, courts, participants, current matches, and completed results.
                            </p>
                            <span className="inline-block text-xs lg:text-sm font-semibold text-[#34C759] mt-3 lg:mt-5 group-hover:translate-x-1 transition-transform">
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
