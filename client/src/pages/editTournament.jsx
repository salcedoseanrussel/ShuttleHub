import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

function EditTournament(){

    const { id } = useParams()

    const navigate = useNavigate()

    const [formData, setFormData] = useState({

        title:'',
        description:'',
        game:'',
        format:'',
        location:'',
        startDate:'',
        registrationDeadline:'',
        maxPlayers:''

    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {

        fetchTournament()

    }, [])

    const fetchTournament = async() => {

        try{

            setLoading(true)

            const response = await axios.get(

                `http://localhost:5000/api/tournaments/${id}`

            )

            setFormData({

                title:response.data.title || '',
                description:response.data.description || '',
                game:response.data.game || '',
                format:response.data.format || '',
                location:response.data.location || '',
                startDate:
                    response.data.startDate
                        ?.split('T')[0] || '',
                registrationDeadline:
                    response.data.registrationDeadline
                        ?.split('T')[0] || '',
                maxPlayers:
                    response.data.maxPlayers || ''

            })

        }catch(err){

            console.log(err)

            toast.error(
                err.response?.data?.message ||
                'Failed to load tournament'
            )

        }finally{

            setLoading(false)

        }

    }

    const handleChange = (e) => {

        setFormData({

            ...formData,
            [e.target.name]:e.target.value

        })

    }

    const handleSubmit = async() => {

        if (
            !formData.title.trim() ||
            !formData.description.trim() ||
            !formData.game ||
            !formData.format ||
            !formData.location.trim() ||
            !formData.startDate ||
            !formData.maxPlayers
        ) {

            toast.error(
                'Please complete all required fields'
            )

            return
        }

        if (
            Number(formData.maxPlayers) < 2
        ) {

            toast.error(
                'Maximum participants must be at least 2'
            )

            return
        }

        if (
            formData.game !== 'Singles' &&
            Number(formData.maxPlayers) % 2 !== 0
        ) {

            toast.error(
                'Doubles tournaments require an even maximum number of participants'
            )

            return
        }

        if (
            formData.registrationDeadline &&
            new Date(formData.registrationDeadline) >
            new Date(formData.startDate)
        ) {

            toast.error(
                'Registration deadline cannot be after the tournament date'
            )

            return
        }

        const result = await Swal.fire({

            title:'Save Changes?',

            text:
                'Your tournament information will be updated.',

            icon:'question',

            showCancelButton:true,

            confirmButtonColor:'#34C759',

            cancelButtonColor:'#9CA3AF',

            confirmButtonText:'Save Changes',

            cancelButtonText:'Cancel'

        })

        if (!result.isConfirmed) return

        try{

            setSaving(true)

            const token =
                localStorage.getItem('token')

            const response = await axios.put(

                `http://localhost:5000/api/tournaments/${id}`,

                {

                    ...formData,

                    maxPlayers:
                        Number(formData.maxPlayers)

                },

                {
                    headers:{
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            )

            toast.success(
                response.data?.message ||
                'Tournament updated successfully'
            )

            navigate(`/tournament/${id}`)

        }catch(err){

            console.log(err)

            toast.error(
                err.response?.data?.message ||
                'Failed to update tournament'
            )

        }finally{

            setSaving(false)

        }

    }

    if(loading){

        return(

            <div className="min-h-screen bg-[#F8F8F8] p-8">

                <div className="text-gray-500">
                    Loading tournament...
                </div>

            </div>

        )

    }

    return(

        <div className="min-h-screen bg-[#F8F8F8] p-8">

            {/* HEADER */}
            <div className="mb-8">

                <h1 className="text-3xl font-semibold text-[#34C759]">
                    Edit Tournament
                </h1>

                <p className="text-gray-500">
                    Update your tournament information.
                </p>

            </div>

            <div className="bg-white w-full max-w-4xl mx-auto rounded-2xl border border-[#E5E7EB] overflow-hidden">

                <div className="p-8">

                    <h2 className="text-lg font-semibold text-gray-700 mb-5">
                        Tournament Information
                    </h2>

                    <div className="space-y-6">

                        <div>

                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Tournament Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter tournament title"
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Description
                            </label>

                            <textarea
                                rows={5}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Write a short description..."
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition resize-none"
                            />

                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Game
                                </label>

                                <select
                                    name="game"
                                    value={formData.game}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition cursor-pointer"
                                >

                                    <option value="">
                                        Select game
                                    </option>

                                    <option value="Singles">
                                        Singles
                                    </option>

                                    <option value="Doubles">
                                        Doubles
                                    </option>

                                    <option value="Mixed Doubles">
                                        Mixed Doubles
                                    </option>

                                </select>

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Tournament Format
                                </label>

                                <select
                                    name="format"
                                    value={formData.format}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition cursor-pointer"
                                >

                                    <option value="">
                                        Select tournament format
                                    </option>

                                    <option value="Single Elimination">
                                        Single Elimination
                                    </option>

                                    <option value="Round Robin">
                                        Round Robin
                                    </option>

                                </select>

                            </div>

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Tournament venue"
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            />

                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Registration Deadline
                                </label>

                                <input
                                    type="date"
                                    name="registrationDeadline"
                                    value={formData.registrationDeadline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                />

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Tournament Date
                                </label>

                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Maximum Participants
                            </label>

                            <input
                                type="number"
                                min="2"
                                name="maxPlayers"
                                value={formData.maxPlayers}
                                onChange={handleChange}
                                placeholder="Maximum number of players"
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            />

                        </div>

                    </div>

                    <div className="flex justify-end gap-4 mt-8">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/tournament/${id}`)
                            }
                            disabled={saving}
                            className="cursor-pointer px-8 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 hover:bg-gray-50 font-semibold transition disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="cursor-pointer px-8 py-3 rounded-xl bg-[#34C759] hover:bg-[#2fb450] text-white font-semibold transition disabled:opacity-50"
                        >

                            {saving
                                ? 'Saving...'
                                : 'Save Changes'}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    )

}

export default EditTournament