import { useLayoutEffect, useRef } from 'react'
import {
    Routes,
    Route,
    useLocation,
    Navigate
} from 'react-router-dom'

import Sidebar from './components/sidebar'
import Header from './components/Header'
import PublicNavbar from './components/publicNavbar'

import Landing from './pages/landing'

import PlayerDashboard from './pages/playerDashboard'
import OrganizerDashboard from './pages/organizerDashboard'

import QuickPlay from './pages/quickPlay'
import QueueDetails from './pages/queueDetails'
import CreateQueue from './pages/createQueue'
import MyQueues from './pages/myQueues'

import Tournaments from './pages/tournaments'
import CreateTournament from './pages/createTournament'
import MyTournaments from './pages/myTournaments'
import TournamentDetails from './pages/tournamentDetails'
import EditTournament from './pages/editTournament'

import Notifications from './pages/notifications'

import AdminDashboard from './pages/adminDashboard'
import UserManagement from './pages/userManagement'
import Profile from './pages/profile'
import UserProfile from './pages/userProfile'

import Reports from './pages/reports'
import TournamentReport from './pages/tournamentReport'
import QuickPlayReport from './pages/quickPlayReport'

import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'

import { Toaster } from 'react-hot-toast'

function App() {

    const location = useLocation()
    const mainRef = useRef(null)

    useLayoutEffect(() => {
        const previousScrollRestoration = window.history.scrollRestoration
        window.history.scrollRestoration = 'manual'

        return () => {
            window.history.scrollRestoration = previousScrollRestoration
        }
    }, [])

    useLayoutEffect(() => {
        mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, [location.key, location.pathname, location.search])

    const user = JSON.parse(localStorage.getItem('user'))

    const publicPaths = [
        '/',
        '/tournaments',
        '/quick-play'
    ]

    const isPublicPage =
        !user && (
            publicPaths.includes(location.pathname) ||
            location.pathname.startsWith('/tournament/') ||
            location.pathname.startsWith('/quick-play/') ||
            location.pathname.startsWith('/profile/')
        )

    const showPrivateLayout =
        !!user &&
        !isPublicPage

    const showPublicNavbar =
        isPublicPage

    return (

        <div className={`${showPrivateLayout ? 'flex h-screen overflow-hidden' : 'min-h-screen'} bg-[#f8f8f8]`}>

            {showPrivateLayout && <Sidebar />}

            <div
                className={`${showPrivateLayout ? 'flex-1 flex flex-col overflow-hidden ml-64' : 'w-full'}`}
            >

                {showPrivateLayout && <Header />}
                {showPublicNavbar && <PublicNavbar />}

                <main ref={mainRef} className={showPrivateLayout ? 'flex-1 overflow-y-auto p-6' : 'w-full'}>

                    <Routes>

                        {/* PUBLIC */}
                        <Route
                            path="/"
                            element={
                                user
                                    ? (
                                        <Navigate
                                            to={
                                                user.role === 'Admin'
                                                    ? '/admin'
                                                    : user.role === 'Organizer'
                                                    ? '/organizer'
                                                    : '/player'
                                            }
                                            replace
                                        />
                                    )
                                    : <Landing />
                            }
                        />

                        {/* PLAYER */}
                        <Route
                            path="/player"
                            element={
                                <RoleProtectedRoute role="Player">
                                    <PlayerDashboard />
                                </RoleProtectedRoute>
                            }
                        />

                        {/* ORGANIZER */}
                        <Route
                            path="/organizer"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <OrganizerDashboard />
                                </RoleProtectedRoute>
                            }
                        />

                        {/* TOURNAMENTS - PUBLIC VIEWING */}
                        <Route path="/tournaments" element={<Tournaments />} />
                        <Route path="/tournament/:id" element={<TournamentDetails />} />

                        <Route
                            path="/create-tournament"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <CreateTournament />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="/my-tournaments"
                            element={
                                <ProtectedRoute>
                                    <MyTournaments />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/edit-tournament/:id"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <EditTournament />
                                </RoleProtectedRoute>
                            }
                        />

                        {/* QUICK PLAY - PUBLIC VIEWING */}
                        <Route path="/quick-play" element={<QuickPlay />} />
                        <Route path="/quick-play/:id" element={<QueueDetails />} />

                        <Route
                            path="/create-queue"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <CreateQueue />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="/my-queues"
                            element={
                                <ProtectedRoute>
                                    <MyQueues />
                                </ProtectedRoute>
                            }
                        />

                        {/* REPORTS */}
                        <Route
                            path="/reports"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <Reports />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="/reports/tournament/:id"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <TournamentReport />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="/reports/quickplay/:id"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <QuickPlayReport />
                                </RoleProtectedRoute>
                            }
                        />

                        {/* ADMIN */}
                        <Route
                            path="/admin"
                            element={
                                <RoleProtectedRoute role="Admin">
                                    <AdminDashboard />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute>
                                    <RoleProtectedRoute role="Admin">
                                        <UserManagement />
                                    </RoleProtectedRoute>
                                </ProtectedRoute>
                            }
                        />

                        {/* COMMON */}
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/profile/:userId" element={<UserProfile />} />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                    </Routes>

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000
                        }}
                    />

                </main>

            </div>

        </div>
    )
}

export default App
