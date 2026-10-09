import BackLink from '../components/backLink'
import { useEffect, useState } from 'react'
import { Navigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import ProfileOverview from '../components/profileOverview'

function UserProfile() {
    const { userId } = useParams()
    const location = useLocation()
    const viewer = JSON.parse(localStorage.getItem('user') || 'null')
    const isOwner = String(viewer?._id || viewer?.id || '') === userId
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [retry, setRetry] = useState(0)

    useEffect(() => {
        let cancelled = false
        if (isOwner) return

        const loadProfile = async () => {
            setLoading(true)
            setError('')
            setProfile(null)
            setStats(null)
            try {
                const res = await axios.get(`http://localhost:5000/api/users/profiles/${userId}`)
                if (!cancelled) {
                    setProfile(res.data.profile)
                    setStats(res.data.stats)
                }
            } catch (err) {
                if (!cancelled) setError(err.response?.data?.message || 'This profile could not be loaded.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadProfile()
        return () => { cancelled = true }
    }, [userId, isOwner, retry])

    if (isOwner) return <Navigate to="/profile" state={location.state} replace />

    return (
        <div className="min-h-screen bg-[#F6F7F9]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">
                <div className="mb-7">
                    <BackLink fallbackTo="/tournaments" fallbackLabel="Back to Tournaments" />
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-3">{profile?.role === 'Organizer' ? 'Organizer Profile' : 'Player Profile'}</h1>
                    <p className="text-sm text-slate-500 mt-2">Profile overview and recorded activity.</p>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500" role="status">Loading profile...</div>
                ) : error || !profile ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="text-sm text-slate-500">{error || 'Profile not found.'}</p>
                        <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-4 px-4 py-2 rounded-xl bg-[#34C759] text-white text-sm font-semibold hover:bg-[#2FB350] cursor-pointer">Try again</button>
                    </div>
                ) : (
                    <ProfileOverview key={userId} user={profile} stats={stats} loading={false} error="" readOnly />
                )}
            </div>
        </div>
    )
}

export default UserProfile
