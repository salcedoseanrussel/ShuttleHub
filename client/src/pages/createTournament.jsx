import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const emptyForm = {
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
}


function CreateTournament(){

    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)


    const handleChange = (e) => {

        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))

    }


    const handleCreateTournament = async() => {

        if (
            !form.title.trim() ||
            !form.description.trim() ||
            !form.game ||
            !form.format ||
            !form.location.trim() ||
            !form.startDate ||
            !form.maxPlayers
        ) {
            toast.error('Please complete all required fields')
            return
        }


        if (Number(form.maxPlayers) < 2) {
            toast.error('Maximum participants must be at least 2')
            return
        }


        if (
            form.game !== 'Singles' &&
            Number(form.maxPlayers) % 2 !== 0
        ) {
            toast.error(
                'Doubles tournaments require an even maximum number of participants'
            )
            return
        }


        if (
            form.registrationDeadline &&
            new Date(form.registrationDeadline) >
            new Date(form.startDate)
        ) {
            toast.error(
                'Registration deadline cannot be after the tournament date'
            )
            return
        }


        if (form.registrationType === 'Paid') {

            if (
                !form.registrationFee ||
                Number(form.registrationFee) <= 0
            ) {
                toast.error('Enter a valid registration fee')
                return
            }


            if (
                !form.paymentMethod.trim() ||
                !form.accountName.trim() ||
                !form.accountNumber.trim()
            ) {
                toast.error('Complete all payment information')
                return
            }

        }


        try{

            setSaving(true)

            const token = localStorage.getItem('token')

            const payload = {
                title: form.title,
                description: form.description,
                game: form.game,
                format: form.format,
                location: form.location,
                startDate: form.startDate,
                registrationDeadline:
                    form.registrationDeadline || null,
                maxPlayers: Number(form.maxPlayers),
                registrationType: form.registrationType,
                registrationFee:
                    form.registrationType === 'Paid'
                        ? Number(form.registrationFee)
                        : 0,
                paymentInstructions:
                    form.registrationType === 'Paid'
                        ? {
                            method: form.paymentMethod.trim(),
                            accountName: form.accountName.trim(),
                            accountNumber: form.accountNumber.trim()
                        }
                        : {
                            method: '',
                            accountName: '',
                            accountNumber: ''
                        }
            }


            const res = await axios.post(
                'http://localhost:5000/api/tournaments/create',
                payload,
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            )


            toast.success(res.data.message)

            setForm(emptyForm)

        }catch(err){

            toast.error(
                err.response?.data?.message ||
                'Failed to create tournament'
            )

        }finally{

            setSaving(false)

        }

    }


    return (

        <div className="min-h-screen bg-[#F6F7F9]">

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">


                {/* HEADER */}

                <div className="mb-7">

                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34C759] mb-2">
                        <span className="w-6 h-px bg-[#34C759]"/>
                        Tournament Management
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                        Create Tournament
                    </h1>

                    <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
                        Configure the tournament details, registration setup, and payment information.
                    </p>

                </div>


                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">


                    {/* MAIN FORM */}

                    <div className="xl:col-span-8 space-y-5">


                        {/* TOURNAMENT INFORMATION */}

                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Tournament Information
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Enter the main details players will see when browsing tournaments.
                                </p>

                            </div>


                            <div className="p-5 sm:p-6 space-y-5">


                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tournament Title
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter tournament title"
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                    />

                                </div>


                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Description
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <textarea
                                        rows={5}
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Write a short description..."
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition resize-none"
                                    />

                                </div>


                                <div className="grid md:grid-cols-2 gap-5">

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Game Type
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>

                                        <select
                                            name="game"
                                            value={form.game}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        >
                                            <option value="">Select game type</option>
                                            <option value="Singles">Singles</option>
                                            <option value="Doubles">Doubles</option>
                                            <option value="Mixed Doubles">Mixed Doubles</option>
                                        </select>

                                    </div>


                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tournament Format
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>

                                        <select
                                            name="format"
                                            value={form.format}
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
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <input
                                        name="location"
                                        value={form.location}
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
                                            value={form.registrationDeadline}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        />

                                    </div>


                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tournament Date
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>

                                        <input
                                            type="date"
                                            name="startDate"
                                            value={form.startDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        />

                                    </div>

                                </div>


                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Maximum Participants
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <input
                                        type="number"
                                        min="2"
                                        name="maxPlayers"
                                        value={form.maxPlayers}
                                        onChange={handleChange}
                                        placeholder="Maximum number of players"
                                        className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                    />

                                    <p className="text-xs text-slate-400 mt-2">
                                        Doubles and Mixed Doubles require an even participant limit.
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* PAYMENT */}

                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                                <h2 className="text-lg font-semibold text-slate-950">
                                    Registration Payment
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Choose whether registration is free or requires payment.
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
                                            value={form.registrationType}
                                            onChange={handleChange}
                                            className="cursor-pointer w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                        >
                                            <option value="Free">Free</option>
                                            <option value="Paid">Paid</option>
                                        </select>

                                    </div>


                                    {form.registrationType === 'Paid' && (

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Registration Fee (₱)
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                step="0.01"
                                                name="registrationFee"
                                                value={form.registrationFee}
                                                onChange={handleChange}
                                                placeholder="150"
                                                className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                            />

                                        </div>

                                    )}

                                </div>


                                {form.registrationType === 'Paid' && (

                                    <div className="grid md:grid-cols-3 gap-5">

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Payment Method
                                            </label>

                                            <input
                                                name="paymentMethod"
                                                value={form.paymentMethod}
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
                                                value={form.accountName}
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
                                                value={form.accountNumber}
                                                onChange={handleChange}
                                                placeholder="09XX XXX XXXX"
                                                className="w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition"
                                            />

                                        </div>

                                    </div>

                                )}


                                {form.registrationType === 'Paid' && (

                                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            Players will upload a payment receipt and reference number. You must approve the payment before they become confirmed participants.
                                        </p>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ACTIONS */}

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => setForm(emptyForm)}
                                disabled={saving}
                                className="cursor-pointer px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition disabled:opacity-50"
                            >
                                Reset
                            </button>


                            <button
                                type="button"
                                onClick={handleCreateTournament}
                                disabled={saving}
                                className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
                            >
                                {saving ? 'Creating...' : 'Create Tournament'}
                            </button>

                        </div>

                    </div>


                    {/* SUMMARY */}

                    <aside className="xl:col-span-4">

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 xl:sticky xl:top-6">

                            <h2 className="text-lg font-semibold text-slate-950">
                                Tournament Summary
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Preview the most important tournament settings.
                            </p>


                            <div className="mt-5 space-y-3">

                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                        Tournament
                                    </p>

                                    <p className="text-sm font-semibold text-slate-900 mt-1 break-words">
                                        {form.title.trim() || 'Not set'}
                                    </p>

                                </div>


                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                                            Game
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {form.game || '—'}
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">
                                            Format
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {form.format || '—'}
                                        </p>

                                    </div>

                                </div>


                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Participants
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {form.maxPlayers || '—'}
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Registration
                                        </p>

                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {form.registrationType}
                                        </p>

                                    </div>

                                </div>


                                {form.registrationType === 'Paid' && (

                                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">

                                        <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">
                                            Registration Fee
                                        </p>

                                        <p className="text-lg font-bold text-slate-950 mt-1">
                                            ₱{form.registrationFee || '0'}
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            {form.paymentMethod || 'Payment method not set'}
                                        </p>

                                    </div>

                                )}


                                <div className="rounded-xl border border-dashed border-slate-200 p-4">

                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Review all required fields before creating the tournament. You can manage participants, teams, payments, and matches after creation.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </div>

    )

}

export default CreateTournament
