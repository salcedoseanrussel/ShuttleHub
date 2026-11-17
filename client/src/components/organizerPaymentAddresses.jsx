import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import PaymentQrUpload from './paymentQrUpload'

const empty = { label: '', method: 'GCash', accountName: '', accountNumber: '', qrCode: '' }
const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100'
const config = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
const endpoint = 'http://localhost:5000/api/users/payment-addresses'

export default function OrganizerPaymentAddresses() {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState(null)
    const [editingId, setEditingId] = useState('')
    const [saving, setSaving] = useState(false)
    const [removing, setRemoving] = useState('')
    const mounted = useRef(false)
    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const { data } = await axios.get(endpoint, config())
            if (mounted.current) setAddresses(data.paymentAddresses || [])
        } catch (err) { if (mounted.current) setError(err.response?.data?.message || 'Could not load payment addresses') }
        finally { if (mounted.current) setLoading(false) }
    }
    useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false } }, [])
    const start = address => {
        setEditingId(address?._id || '')
        setForm(address ? { label: address.label, method: address.method, accountName: address.accountName || '', accountNumber: address.accountNumber || '', qrCode: address.qrCode || '' } : { ...empty })
    }
    const save = async event => {
        event.preventDefault()
        if (!form.label.trim() || !form.method.trim() || (!form.qrCode && (!form.accountName.trim() || !form.accountNumber.trim()))) {
            toast.error('Add a label, payment method, and either account name and number or a QR image')
            return
        }
        setSaving(true)
        try {
            const { data } = editingId
                ? await axios.put(`${endpoint}/${editingId}`, form, config())
                : await axios.post(endpoint, form, config())
            if (!mounted.current) return
            setAddresses(data.paymentAddresses || [])
            setForm(null)
            toast.success(data.message)
        } catch (err) { toast.error(err.response?.data?.message || 'Could not save payment address') }
        finally { if (mounted.current) setSaving(false) }
    }
    const remove = async address => {
        const result = await Swal.fire({ title: 'Remove payment address?', text: 'It will no longer be available for selection. Existing tournament payment instructions will stay as saved.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Remove', confirmButtonColor: '#EF4444', cancelButtonColor: '#9CA3AF' })
        if (!result.isConfirmed || !mounted.current) return
        setRemoving(address._id)
        try {
            const { data } = await axios.delete(`${endpoint}/${address._id}`, config())
            if (!mounted.current) return
            setAddresses(data.paymentAddresses || [])
            toast.success(data.message)
        } catch (err) { toast.error(err.response?.data?.message || 'Could not remove payment address') }
        finally { if (mounted.current) setRemoving('') }
    }
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap justify-between items-start gap-3">
                <div><h2 className="text-lg font-semibold text-slate-950">Payment addresses</h2><p className="text-sm text-slate-500 mt-1">Save up to 5 bank or e-wallet accounts and QR codes, then select one for a paid tournament.</p></div>
                {!form && <button type="button" disabled={loading || !!error || addresses.length >= 5 || !!removing} onClick={() => start(null)} className="rounded-xl bg-[#34C759] text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50 whitespace-nowrap">Add address</button>}
            </div>
            <div className="p-5 sm:p-6">
                {loading ? <p className="text-sm text-slate-500">Loading payment addresses…</p> : error ? <div><p className="text-sm text-red-600" role="alert">{error}</p><button type="button" onClick={load} className="text-sm text-[#279A45] mt-2">Try again</button></div> : form ? (
                    <form onSubmit={save} className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">{editingId ? 'Edit payment address' : 'New payment address'}</h3>
                        <fieldset disabled={saving} className="grid md:grid-cols-2 gap-4">
                            {[['label','Address label','My GCash',80],['method','Bank / E-wallet','GCash, Maya, or bank name',100],['accountName','Account name','Account holder',200],['accountNumber','Account number','Wallet number or bank account',100]].map(([key,label,placeholder,max]) => (
                                <div key={key}><label htmlFor={`saved-${key}`} className="block text-xs font-medium text-slate-600 mb-2">{label}{['label','method'].includes(key) ? ' *' : ''}</label><input id={`saved-${key}`} required={['label','method'].includes(key)} maxLength={max} value={form[key]} onChange={e => setForm(previous => ({ ...previous, [key]: e.target.value }))} placeholder={placeholder} className={inputClass} /></div>
                            ))}
                            <PaymentQrUpload key={editingId || 'new'} value={form.qrCode} onChange={qrCode => setForm(previous => previous ? { ...previous, qrCode } : previous)} />
                        </fieldset>
                        <div className="flex gap-2"><button type="submit" disabled={saving} className="rounded-xl bg-[#34C759] text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{saving ? 'Saving…' : 'Save address'}</button><button type="button" disabled={saving} onClick={() => setForm(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600">Cancel</button></div>
                    </form>
                ) : addresses.length ? (
                    <div className="space-y-3">{addresses.map(address => <div key={address._id} className="flex flex-wrap items-start gap-4 rounded-xl border border-slate-200 p-4">
                        <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900 break-words">{address.label}</p><p className="text-xs text-[#279A45] mt-1">{address.method}</p>{address.accountName && <p className="text-sm text-slate-600 mt-2 break-words">{address.accountName}</p>}{address.accountNumber && <p className="text-sm text-slate-600 mt-1 break-all">{address.accountNumber}</p>}</div>
                        {address.qrCode && <img src={address.qrCode} alt={`${address.label} payment QR`} className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-contain" />}
                        <div className="flex gap-3 text-xs"><button type="button" disabled={!!removing} onClick={() => start(address)} className="text-[#279A45] font-medium">Edit</button><button type="button" disabled={!!removing} onClick={() => remove(address)} className="text-red-600">{removing === address._id ? 'Removing…' : 'Remove'}</button></div>
                    </div>)}</div>
                ) : <p className="text-sm text-slate-500">No saved payment addresses yet. Add your bank or e-wallet details, a QR image, or both.</p>}
            </div>
        </section>
    )
}
