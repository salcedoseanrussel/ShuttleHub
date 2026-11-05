import { useEffect, useId, useRef, useState } from 'react'
import { FaQrcode, FaUpload, FaCheckCircle } from 'react-icons/fa'
import { detectAndCropPaymentQr } from '../utils/paymentQrDetection'

export default function PaymentQrUpload({ value, onChange }) {
    const uploadId = useId()
    const statusId = `${uploadId}-status`
    const [message, setMessage] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState(false)
    const request = useRef(0)
    useEffect(() => () => { request.current += 1 }, [])

    const selectFile = async event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        const current = ++request.current
        setError(false)
        setMessage('')
        setBusy(false)
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            setError(true)
            setMessage('Choose a PNG, JPG, or WebP image up to 5 MB.')
            return
        }
        setBusy(true)
        try {
            const url = URL.createObjectURL(file)
            const picture = new Image()
            try {
                picture.src = url
                await picture.decode()
            } finally { URL.revokeObjectURL(url) }
            // Let the browser show the scanning status before CPU-based QR detection starts.
            await new Promise(resolve => setTimeout(resolve, 0))
            if (current !== request.current) return
            const qr = detectAndCropPaymentQr(picture)
            if (current !== request.current) return
            onChange(qr)
            setMessage('QR detected and automatically cropped. Check the recipient before saving.')
        } catch (err) {
            if (current === request.current) {
                setError(true)
                setMessage(`${err.message || 'Could not read this image.'}${value ? ' Your previous QR is unchanged.' : ''}`)
            }
        } finally { if (current === request.current) setBusy(false) }
    }
    const remove = () => {
        request.current += 1
        setBusy(false)
        setMessage('')
        setError(false)
        if (!busy) onChange('')
    }
    return (
        <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-800">Payment QR code</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Optional</span>
            </div>
            <label htmlFor={uploadId} className={`relative flex flex-col sm:flex-row items-center gap-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-5 text-center sm:text-left transition focus-within:ring-2 focus-within:ring-emerald-300 focus-within:ring-offset-2 ${busy ? 'opacity-70' : 'cursor-pointer hover:border-[#34C759] hover:bg-emerald-50'}`}>
                <input id={uploadId} type="file" accept="image/png,image/jpeg,image/webp" onChange={selectFile} disabled={busy} className="sr-only" aria-label={value ? 'Replace payment QR image' : 'Upload payment QR image'} aria-describedby={statusId} />
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-2xl text-[#279A45]"><FaQrcode /></span>
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{value ? 'Replace your payment QR' : 'Add your payment QR'}</span>
                    <span className="block text-xs text-slate-500 mt-1">Choose the QR from your GCash, Maya, or bank account.</span>
                    <span className="block text-[11px] text-slate-400 mt-1">PNG, JPG or WebP · Up to 5 MB · Automatically cropped</span>
                </span>
                <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#34C759] px-4 py-2.5 text-sm font-semibold text-white"><FaUpload className="text-xs" />{busy ? 'Scanning…' : value ? 'Replace QR' : 'Upload QR Code'}</span>
            </label>
            <div id={statusId} aria-live="polite" aria-atomic="true">
                {(busy || message) && <p role={error ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-xs ${error ? 'border border-red-100 bg-red-50 text-red-600' : 'text-slate-500'}`}>
                    {busy ? 'Detecting and cropping your QR code…' : message}
                </p>}
            </div>
            {value && (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <img src={value} alt="Payment QR preview with white scanning border" className="h-40 w-40 shrink-0 max-w-full rounded-lg border border-slate-200 bg-white object-contain" />
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                        <p className="flex items-center justify-center sm:justify-start gap-2 text-sm font-medium text-slate-800"><FaCheckCircle aria-hidden="true" className="text-[#279A45]" />Current QR code</p>
                        <p className="text-xs text-slate-500 mt-2 max-w-sm">Check that this QR belongs to the account you want players to pay.</p>
                        {!busy && <button type="button" onClick={remove} className="mt-3 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50">Remove QR</button>}
                    </div>
                </div>
            )}
            {busy && <button type="button" onClick={remove} className="text-xs font-medium text-red-600 hover:underline">Cancel upload</button>}
        </div>
    )
}
