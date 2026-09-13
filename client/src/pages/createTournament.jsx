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

        <div className="min-h-screen bg-[#F8F8F8] p-8">

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
                                    <option value="">Select game type</option>
                                    <option value="Singles">Singles</option>
                                    <option value="Doubles">Doubles</option>
                                    <option value="Mixed Doubles">Mixed Doubles</option>
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
                                    <option value="">Select tournament format</option>
                                    <option value="Single Elimination">Single Elimination</option>
                                    <option value="Round Robin">Round Robin</option>
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
                                min="2"
                                name="maxPlayers"
                                value={form.maxPlayers}
                                onChange={handleChange}
                                placeholder="Maximum number of players"
                                className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                            />
                        </div>

                        <div className="border-t border-[#E5E7EB] pt-6">

                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Registration Payment
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Registration Type
                                    </label>
                                    <select
                                        name="registrationType"
                                        value={form.registrationType}
                                        onChange={handleChange}
                                        className="cursor-pointer w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                    >
                                        <option value="Free">Free</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                </div>

                                {form.registrationType === 'Paid' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
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
                                            className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                        />
                                    </div>
                                )}

                            </div>

                            {form.registrationType === 'Paid' && (

                                <div className="grid md:grid-cols-3 gap-6 mt-6">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Payment Method
                                        </label>
                                        <input
                                            name="paymentMethod"
                                            value={form.paymentMethod}
                                            onChange={handleChange}
                                            placeholder="GCash"
                                            className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Account Name
                                        </label>
                                        <input
                                            name="accountName"
                                            value={form.accountName}
                                            onChange={handleChange}
                                            placeholder="Account holder"
                                            className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Account Number
                                        </label>
                                        <input
                                            name="accountNumber"
                                            value={form.accountNumber}
                                            onChange={handleChange}
                                            placeholder="09XX XXX XXXX"
                                            className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:bg-white focus:border-[#34C759] outline-none transition"
                                        />
                                    </div>

                                </div>

                            )}

                            {form.registrationType === 'Paid' && (
                                <p className="text-sm text-gray-500 mt-4">
                                    Players will upload a payment receipt and reference number. You must approve the payment before they become confirmed participants.
                                </p>
                            )}

                        </div>

                    </div>

                    <div className="flex justify-end gap-4 mt-8">

                        <button
                            type="button"
                            onClick={() => setForm(emptyForm)}
                            disabled={saving}
                            className="cursor-pointer px-8 py-3 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 hover:bg-gray-50 font-semibold transition disabled:opacity-50"
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateTournament}
                            disabled={saving}
                            className="cursor-pointer px-8 py-3 rounded-xl bg-[#34C759] hover:bg-[#2fb450] text-white font-semibold transition disabled:opacity-50"
                        >
                            {saving ? 'Creating...' : 'Create Tournament'}
                        </button>

                    </div>

                </div>

            </div>

        </div>

    )

}

export default CreateTournament
