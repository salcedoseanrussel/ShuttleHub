import { Routes, Route, useLocation } from 'react-router-dom'

import Sidebar from './components/sidebar'
import Header from './components/Header'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

import PlayerDashboard from './pages/PlayerDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'

import QuickPlay from './pages/quickPlay'
import QueueDetails from './pages/queueDetails'
import CreateQueue from './pages/createQueue'

import Tournaments from './pages/Tournaments'
import CreateTournament from './pages/CreateTournament'
import MyTournaments from './pages/MyTournaments'
import TournamentDetails from './pages/tournamentDetails'
import EditTournament from './pages/EditTournament'

import Notifications from './pages/Notifications'

import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'
import Profile from './pages/Profile'

import Reports from './pages/reports'
import TournamentReport from './pages/tournamentReport'
import QuickPlayReport from './pages/quickPlayReport'

import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'

import { Toaster } from 'react-hot-toast'

function App() {

    const location = useLocation()

    const hideLayout =
        location.pathname === '/' ||
        location.pathname === '/register' ||
        location.pathname === '/forgot-password'

    return (

        <div className="flex h-screen bg-[#f8f8f8] overflow-hidden">

            {!hideLayout && <Sidebar />}

            <div
                className={`flex-1 flex flex-col overflow-hidden ${
                    !hideLayout ? 'ml-64' : ''
                }`}
            >

                {!hideLayout && <Header />}

                <main className="flex-1 overflow-y-auto p-6">

                    <Routes>

                        {/* ========================= */}
                        {/* AUTH */}
                        {/* ========================= */}

                        <Route
                            path="/"
                            element={<Login />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />

                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />


                        {/* ========================= */}
                        {/* PLAYER */}
                        {/* ========================= */}

                        <Route
                            path="/player"
                            element={
                                <RoleProtectedRoute role="Player">
                                    <PlayerDashboard />
                                </RoleProtectedRoute>
                            }
                        />


                        {/* ========================= */}
                        {/* ORGANIZER */}
                        {/* ========================= */}

                        <Route
                            path="/organizer"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <OrganizerDashboard />
                                </RoleProtectedRoute>
                            }
                        />


                        {/* ========================= */}
                        {/* TOURNAMENTS */}
                        {/* ========================= */}

                        <Route
                            path="/tournaments"
                            element={<Tournaments />}
                        />

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
                            path="/tournament/:id"
                            element={<TournamentDetails />}
                        />

                        <Route
                            path="/edit-tournament/:id"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <EditTournament />
                                </RoleProtectedRoute>
                            }
                        />


                        {/* ========================= */}
                        {/* QUICK PLAY */}
                        {/* ========================= */}

                        <Route
                            path="/quick-play"
                            element={<QuickPlay />}
                        />

                        <Route
                            path="/quick-play/:id"
                            element={<QueueDetails />}
                        />

                        <Route
                            path="/create-queue"
                            element={
                                <RoleProtectedRoute role="Organizer">
                                    <CreateQueue />
                                </RoleProtectedRoute>
                            }
                        />


                        {/* ========================= */}
                        {/* REPORTS */}
                        {/* ========================= */}

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


                        {/* ========================= */}
                        {/* ADMIN */}
                        {/* ========================= */}

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


                        {/* ========================= */}
                        {/* COMMON */}
                        {/* ========================= */}

                        <Route
                            path="/notifications"
                            element={<Notifications />}
                        />

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
                            duration: 3000,
                            style: {
                                borderRadius: '12px',
                                background: '#fff',
                                color: '#333'
                            },
                            success: {
                                iconTheme: {
                                    primary: '#34C759',
                                    secondary: '#fff'
                                }
                            }
                        }}
                    />

                </main>

            </div>

        </div>

    )

}

export default App