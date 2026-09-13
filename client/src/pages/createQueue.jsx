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

        <div className="min-h-screen bg-[#F8F8F8] p-8">

            {/* HEADER */}

            <div className="mb-8">

                <h1 className="text-3xl font-semibold text-[#34C759]">
                    Create Quick Play
                </h1>

                <p className="text-gray-500">
                    Fill in the information below to create a new Quick Play session.
                </p>

            </div>


            {/* FORM CARD */}

            <div className="bg-white w-full max-w-4xl mx-auto rounded-2xl border border-[#E5E7EB] overflow-hidden">

                <form
                    onSubmit={handleSubmit}
                    className="p-8"
                >

                    <h2 className="text-lg font-semibold text-gray-700 mb-5">
                        Quick Play Information
                    </h2>


                    <div className="space-y-6">

                        {/* SESSION NAME */}

                        <div>

                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Session Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter session name"
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            />

                        </div>


                        {/* LOCATION */}

                        <div>

                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Quick Play venue"
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            />

                        </div>


                        {/* GAME TYPE */}

                        <div>

                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Game Type
                            </label>

                            <select
                                name="gameType"
                                value={formData.gameType}
                                onChange={handleChange}
                                className="cursor-pointer w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            >

                                <option value="Singles">
                                    Singles
                                </option>

                                <option value="Doubles">
                                    Doubles
                                </option>

                            </select>

                            <p className="text-xs text-gray-400 mt-2">
                                Singles requires 2 players per court.
                                Doubles requires 4 players per court.
                            </p>

                        </div>


                        {/* NUMBER OF COURTS */}

                        <div>

                            <label className="block text-sm font-medium text-gray-600 mb-2">
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
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            />

                            <p className="text-xs text-gray-400 mt-2">
                                Enter the number of courts available for this session.
                            </p>

                        </div>

                    </div>


                    {/* BUTTONS */}

                    <div className="flex justify-end gap-4 mt-8">

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                            className="cursor-pointer px-8 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 hover:bg-gray-50 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset
                        </button>


                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer px-8 py-3 rounded-xl bg-[#34C759] hover:bg-[#2fb450] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            {loading
                                ? 'Creating...'
                                : 'Create Quick Play'
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    )

}

export default CreateQueue