import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function PaymentAddressSelect({ selectedId, current, keepCurrent, initialPayment, onSelect }) {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const original = useRef(initialPayment || { method: current.paymentMethod, accountName: current.accountName, accountNumber: current.accountNumber, qrCode: current.qrCode })
    const mounted = useRef(false)
    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const { data } = await axios.get('http://localhost:5000/api/users/payment-addresses', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (mounted.current) setAddresses(data.paymentAddresses || [])
        } catch { if (mounted.current) setError('Could not load your payment addresses. Try refreshing the list.') }
        finally { if (mounted.current) setLoading(false) }
    }
    useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false } }, [])
    const change = event => {
        const id = event.target.value
        const address = addresses.find(item => item._id === id)
        onSelect(id, address || (keepCurrent ? original.current : { method: '', accountName: '', accountNumber: '', qrCode: '' }))
    }
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="saved-payment-address" className="text-sm font-medium text-slate-700">Payment address</label>
                <Link to="/profile?tab=payments" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#279A45] hover:underline">Manage in my profile</Link>
            </div>
            <div className="flex gap-2">
                <select id="saved-payment-address" value={selectedId || ''} onChange={change} disabled={loading} className="min-w-0 flex-1 px-3 py-3 rounded-xl border border-slate-200 bg-[#FAFBFC] text-sm">
                    <option value="">{loading ? 'Loading payment addresses…' : keepCurrent ? 'Keep current payment instructions' : 'Select a saved payment address'}</option>
                    {addresses.map(address => <option key={address._id} value={address._id}>{address.label} · {address.method}</option>)}
                </select>
                <button type="button" disabled={loading} onClick={load} className="shrink-0 rounded-xl border border-slate-200 px-3 text-xs text-slate-600 hover:bg-slate-50">Refresh</button>
            </div>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            {!loading && !error && !addresses.length && <p className="text-xs text-slate-500">Add a payment address in your profile, then refresh this list. Your tournament form stays open.</p>}
            {(selectedId || keepCurrent) && (
                <div className="flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="min-w-0 flex-1 space-y-1 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">{current.paymentMethod || 'Payment instructions'}</p>
                        {current.accountName && <p className="break-words">{current.accountName}</p>}
                        {current.accountNumber && <p className="break-all">{current.accountNumber}</p>}
                        <p className="text-xs text-slate-400 pt-2">A copy is saved with this tournament. Changes in your profile do not automatically change tournament payment instructions.</p>
                    </div>
                    {current.qrCode && <img src={current.qrCode} alt="Selected payment QR" className="w-28 h-28 object-contain rounded-lg border border-slate-200 bg-white shrink-0" />}
                </div>
            )}
        </div>
    )
}
