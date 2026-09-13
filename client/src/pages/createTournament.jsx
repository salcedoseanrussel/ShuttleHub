import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function CreateTournament(){

    const [form, setForm] = useState({
        title:'',
        description:'',
        game:'',
        format:'',
        location:'',
        startDate:'',
        registrationDeadline:'',
        maxPlayers:''
    })


    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })

    }

    const handleCreateTournament = async() => {

        try{

            const token = localStorage.getItem('token')

            const res = await axios.post(
                'http://localhost:5000/api/tournaments/create',
                form,
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            )

            toast.success(res.data.message)

            setForm({
                title:'',
                description:'',
                game:'',
                format:'',
                location:'',
                startDate:'',
                registrationDeadline:'',
                maxPlayers:''
            })

        }catch(err){

            toast.error(
                err.response?.data?.message ||
                'Failed to create tournament'
            )

        }

    }

    return (

        <div className="min-h-screen bg-[#F8F8F8] p-8">

            {/* HEADER */}
            <div className="mb-8">

                <h1 className="text-3xl font-semibold text-[#34C759]">
                    Create Tournament
                </h1>

                <p className="text-gray-500">
                    Fill in the information below to create a new tournament.
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
                                name="title"
                                value={form.title}
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
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Write a short description..."
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition resize-none"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Game Type
                                </label>

                                <select
                                    name="game"
                                    value={form.game}
                                    onChange={handleChange}
                                    className="cursor-pointer w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                >
                                    <option value="">
                                        Select game type
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
                                    value={form.format}
                                    onChange={handleChange}
                                    className="cursor-pointer w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
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
                                name="location"
                                value={form.location}
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
                                    value={form.registrationDeadline}
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
                                    value={form.startDate}
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
                                name="maxPlayers"
                                value={form.maxPlayers}
                                onChange={handleChange}
                                placeholder="Maximum number of players"
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            />
                        </div>

                    </div>

                    <div className="flex justify-end gap-4 mt-8">

                        <button
                            onClick={() =>
                                setForm({
                                    title:'',
                                    description:'',
                                    game:'',
                                    format:'',
                                    location:'',
                                    startDate:'',
                                    registrationDeadline:'',
                                    maxPlayers:''
                                })
                            }
                            className="cursor-pointer px-8 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 hover:bg-gray-50 font-semibold transition"
                        >
                            Reset
                        </button>

                        <button
                            onClick={handleCreateTournament}
                            className="cursor-pointer px-8 py-3 rounded-xl bg-[#34C759] hover:bg-[#2fb450] text-white font-semibold transition"
                        >
                            Create Tournament
                        </button>

                    </div>

                </div>

            </div>

        </div>

    )

}

export default CreateTournament