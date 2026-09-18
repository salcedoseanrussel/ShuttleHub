import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

function CreateQueue() {

    const navigate = useNavigate()

    const token = localStorage.getItem('token')

    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        gameType: 'Doubles',
        numberOfCourts: 1
    })


    // ==========================
    // INPUT CHANGE
    // ==========================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

    }


    // ==========================
    // RESET FORM
    // ==========================

    const handleReset = () => {

        setFormData({
            name: '',
            location: '',
            gameType: 'Doubles',
            numberOfCourts: 1
        })

    }


    // ==========================
    // CREATE SESSION
    // ==========================

    const handleSubmit = async (e) => {

        e.preventDefault()

        if (
            !formData.name.trim() ||
            !formData.location.trim()
        ) {

            toast.error(
                'Please complete all required fields'
            )

            return
        }


        if (
            Number(formData.numberOfCourts) < 1
        ) {

            toast.error(
                'Number of courts must be at least 1'
            )

            return
        }


        try {

            setLoading(true)

            const res = await axios.post(
                'http://localhost:5000/api/queue/create',
                {
                    name:
                        formData.name.trim(),

                    location:
                        formData.location.trim(),

                    gameType:
                        formData.gameType,

                    numberOfCourts:
                        Number(
                            formData.numberOfCourts
                        )
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            toast.success(
                res.data.message
            )


            navigate(
                `/quick-play/${res.data.session._id}`
            )


        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                'Failed to create Quick Play session'
            )

        } finally {

            setLoading(false)

        }

    }


    return (

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


                {/* HEADER */}

                <div className="mb-7">

                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                        <span className="w-6 h-px bg-[#34C759]"/>
                        Quick Play
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                        Create Quick Play
                    </h1>

                    <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                        Set up a new Quick Play session and configure the venue, game type, and available courts.
                    </p>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">


                    {/* FORM */}

                    <div className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Session Information
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Enter the basic details for this Quick Play session.
                                </p>

                            </div>


                            <div className="p-5 sm:p-6 space-y-5">


                                {/* SESSION NAME */}

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Session Name
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Evening Quick Play"
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                    />

                                </div>


                                {/* LOCATION */}

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Location
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Enter venue or court location"
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                    />

                                </div>


                                <div className="grid md:grid-cols-2 gap-5">


                                    {/* GAME TYPE */}

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Game Type
                                        </label>

                                        <select
                                            name="gameType"
                                            value={formData.gameType}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        >

                                            <option value="Singles">
                                                Singles
                                            </option>

                                            <option value="Doubles">
                                                Doubles
                                            </option>

                                        </select>

                                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                            Singles uses 2 players per court. Doubles uses 4 players per court.
                                        </p>

                                    </div>


                                    {/* NUMBER OF COURTS */}

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Number of Courts
                                        </label>

                                        <input
                                            type="number"
                                            name="numberOfCourts"
                                            value={formData.numberOfCourts}
                                            onChange={handleChange}
                                            min="1"
                                            max="20"
                                            placeholder="Number of available courts"
                                            className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        />

                                        <p className="text-xs text-slate-400 mt-2">
                                            Maximum of 20 courts.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100">

                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="cursor-pointer px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Reset
                                </button>


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >

                                    {loading
                                        ? 'Creating...'
                                        : 'Create Quick Play'
                                    }

                                </button>

                            </div>

                        </form>

                    </div>


                    {/* SIDE SUMMARY */}

                    <aside className="xl:col-span-4">

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 xl:sticky xl:top-6">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Session Summary
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Review the current setup before creating the session.
                            </p>


                            <div className="mt-5 space-y-3">

                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                        Session
                                    </p>

                                    <p className="text-sm font-semibold text-slate-800 mt-1 break-words">
                                        {formData.name.trim() || 'Not set'}
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                        Location
                                    </p>

                                    <p className="text-sm font-semibold text-slate-800 mt-1 break-words">
                                        {formData.location.trim() || 'Not set'}
                                    </p>

                                </div>


                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                                            Game Type
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {formData.gameType}
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">
                                            Courts
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {formData.numberOfCourts || 1}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-4">

                                <p className="text-xs text-slate-500 leading-relaxed">
                                    After creating the session, you can manage players, courts, and matches from the Quick Play session page.
                                </p>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </div>

    )

}

export default CreateQueue
