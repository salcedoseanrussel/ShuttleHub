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
        maxPlayers:'',
        registrationType:'Free',
        registrationFee:'',
        paymentMethod:'GCash',
        accountName:'',
        accountNumber:''
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
                    response.data.maxPlayers || '',
                registrationType:
                    response.data.registrationType || 'Free',
                registrationFee:
                    response.data.registrationFee || '',
                paymentMethod:
                    response.data.paymentInstructions?.method || 'GCash',
                accountName:
                    response.data.paymentInstructions?.accountName || '',
                accountNumber:
                    response.data.paymentInstructions?.accountNumber || ''
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
            toast.error('Please complete all required fields')
            return
        }

        if (Number(formData.maxPlayers) < 2) {
            toast.error('Maximum participants must be at least 2')
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

        if (formData.registrationType === 'Paid') {

            if (
                !formData.registrationFee ||
                Number(formData.registrationFee) <= 0
            ) {
                toast.error('Enter a valid registration fee')
                return
            }

            if (
                !formData.paymentMethod.trim() ||
                !formData.accountName.trim() ||
                !formData.accountNumber.trim()
            ) {
                toast.error('Complete all payment information')
                return
            }

        }

        const result = await Swal.fire({
            title:'Save Changes?',
            text:'Your tournament information will be updated.',
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

            const token = localStorage.getItem('token')

            const response = await axios.put(
                `http://localhost:5000/api/tournaments/${id}`,
                {
                    title: formData.title,
                    description: formData.description,
                    game: formData.game,
                    format: formData.format,
                    location: formData.location,
                    startDate: formData.startDate,
                    registrationDeadline:
                        formData.registrationDeadline || null,
                    maxPlayers: Number(formData.maxPlayers),
                    registrationType: formData.registrationType,
                    registrationFee:
                        formData.registrationType === 'Paid'
                            ? Number(formData.registrationFee)
                            : 0,
                    paymentInstructions:
                        formData.registrationType === 'Paid'
                            ? {
                                method: formData.paymentMethod.trim(),
                                accountName: formData.accountName.trim(),
                                accountNumber: formData.accountNumber.trim()
                            }
                            : {
                                method: '',
                                accountName: '',
                                accountNumber: ''
                            }
                },
                {
                    headers:{
                        Authorization:`Bearer ${token}`
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

            <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">

                <div className="bg-white border border-slate-200 rounded-2xl px-7 py-6 shadow-sm text-center">

                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34C759] rounded-full animate-spin mx-auto mb-4"/>

                    <p className="text-sm font-medium text-slate-600">
                        Loading tournament...
                    </p>

                </div>

            </div>

        )

    }


    return(

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


                {/* HEADER */}

                <div className="mb-7">

                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                        <span className="w-6 h-px bg-[#34C759]"/>
                        Tournament Management
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                        Edit Tournament
                    </h1>

                    <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                        Update tournament details, registration settings, and payment information.
                    </p>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">


                    {/* MAIN FORM */}

                    <div className="xl:col-span-8 space-y-5">


                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Tournament Information
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Modify the main tournament details shown to players.
                                </p>

                            </div>


                            <div className="p-5 sm:p-6 space-y-5">

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tournament Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter tournament title"
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                    />

                                </div>


                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Description
                                    </label>

                                    <textarea
                                        rows={5}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Write a short description..."
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition resize-none"
                                    />

                                </div>


                                <div className="grid md:grid-cols-2 gap-5">

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Game
                                        </label>

                                        <select
                                            name="game"
                                            value={formData.game}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        >
                                            <option value="">Select game</option>
                                            <option value="Singles">Singles</option>
                                            <option value="Doubles">Doubles</option>
                                            <option value="Mixed Doubles">Mixed Doubles</option>
                                        </select>

                                    </div>


                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tournament Format
                                        </label>

                                        <select
                                            name="format"
                                            value={formData.format}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        >
                                            <option value="">Select tournament format</option>
                                            <option value="Single Elimination">Single Elimination</option>
                                            <option value="Round Robin">Round Robin</option>
                                        </select>

                                    </div>

                                </div>


                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Tournament venue"
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                    />

                                </div>


                                <div className="grid md:grid-cols-2 gap-5">

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Registration Deadline
                                        </label>

                                        <input
                                            type="date"
                                            name="registrationDeadline"
                                            value={formData.registrationDeadline}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        />

                                    </div>


                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tournament Date
                                        </label>

                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        />

                                    </div>

                                </div>


                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Maximum Participants
                                    </label>

                                    <input
                                        type="number"
                                        min="2"
                                        name="maxPlayers"
                                        value={formData.maxPlayers}
                                        onChange={handleChange}
                                        placeholder="Maximum number of players"
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                    />

                                </div>

                            </div>

                        </section>


                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Registration Payment
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Update registration fees and payment instructions.
                                </p>

                            </div>


                            <div className="p-5 sm:p-6 space-y-5">

                                <div className="grid md:grid-cols-2 gap-5">

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Registration Type
                                        </label>

                                        <select
                                            name="registrationType"
                                            value={formData.registrationType}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        >
                                            <option value="Free">Free</option>
                                            <option value="Paid">Paid</option>
                                        </select>

                                    </div>


                                    {formData.registrationType === 'Paid' && (

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Registration Fee (₱)
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                step="0.01"
                                                name="registrationFee"
                                                value={formData.registrationFee}
                                                onChange={handleChange}
                                                placeholder="150"
                                                className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                            />

                                        </div>

                                    )}

                                </div>


                                {formData.registrationType === 'Paid' && (

                                    <div className="grid md:grid-cols-3 gap-5">

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Payment Method
                                            </label>

                                            <input
                                                name="paymentMethod"
                                                value={formData.paymentMethod}
                                                onChange={handleChange}
                                                placeholder="GCash"
                                                className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                            />

                                        </div>


                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Account Name
                                            </label>

                                            <input
                                                name="accountName"
                                                value={formData.accountName}
                                                onChange={handleChange}
                                                placeholder="Account holder"
                                                className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                            />

                                        </div>


                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Account Number
                                            </label>

                                            <input
                                                name="accountNumber"
                                                value={formData.accountNumber}
                                                onChange={handleChange}
                                                placeholder="09XX XXX XXXX"
                                                className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                            />

                                        </div>

                                    </div>

                                )}

                            </div>

                        </section>


                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => navigate(`/tournament/${id}`)}
                                disabled={saving}
                                className="cursor-pointer px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition disabled:opacity-50"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>

                        </div>

                    </div>


                    {/* SUMMARY */}

                    <aside className="xl:col-span-4">

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 xl:sticky xl:top-6">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Current Setup
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Review the tournament settings before saving.
                            </p>


                            <div className="mt-5 space-y-3">

                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                        Tournament
                                    </p>

                                    <p className="text-sm font-semibold text-slate-900 mt-1 break-words">
                                        {formData.title.trim() || 'Not set'}
                                    </p>

                                </div>


                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                                            Game
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {formData.game || '—'}
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">
                                            Format
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {formData.format || '—'}
                                        </p>

                                    </div>

                                </div>


                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Participants
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {formData.maxPlayers || '—'}
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Registration
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {formData.registrationType}
                                        </p>

                                    </div>

                                </div>


                                {formData.registrationType === 'Paid' && (

                                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">
                                            Registration Fee
                                        </p>

                                        <p className="text-lg font-bold text-slate-950 mt-1">
                                            ₱{formData.registrationFee || '0'}
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            {formData.paymentMethod || 'Payment method not set'}
                                        </p>

                                    </div>

                                )}

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </div>

    )

}

export default EditTournament
