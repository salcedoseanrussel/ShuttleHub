import { useEffect, useRef, useState } from 'react'
import { extractReceiptReference } from '../utils/receiptReference'

export default function ReceiptSubmission({ reference, onReference, receipt, onReceipt, onSubmit, submitting, rejected }) {
    const [mode, setMode] = useState('upload')
    const [reading, setReading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState('')
    const [editing, setEditing] = useState(false)
    const [preview, setPreview] = useState('')
    const request = useRef(0)
    const workerRef = useRef(null)
    const clearWorker = () => {
        request.current += 1
        const worker = workerRef.current
        workerRef.current = null
        if (worker) void worker.terminate().catch(() => {})
    }
    useEffect(() => () => {
        request.current += 1
        if (workerRef.current) void workerRef.current.terminate().catch(() => {})
    }, [])
    useEffect(() => {
        if (!receipt) { setPreview(''); return }
        const url = URL.createObjectURL(receipt)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [receipt])
    const changeMode = next => {
        clearWorker()
        setReading(false)
        setMessage('')
        setEditing(false)
        onReceipt(null)
        onReference('')
        setMode(next)
    }
    const upload = async event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        clearWorker()
        const current = request.current
        setReading(false)
        onReference('')
        onReceipt(null)
        setMessage('')
        setEditing(false)
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            setMessage('Choose a JPG, PNG, or WebP receipt up to 5 MB.')
            return
        }
        onReceipt(file)
        setReading(true)
        setProgress(0)
        let worker
        try {
            const { createWorker } = await import('tesseract.js')
            if (current !== request.current) return
            worker = await createWorker('eng', 1, { logger: status => {
                if (current === request.current && status.status === 'recognizing text') setProgress(Math.round(status.progress * 100))
            } })
            if (current !== request.current) return
            workerRef.current = worker
            const result = await worker.recognize(file)
            if (current !== request.current) return
            const detected = extractReceiptReference(result.data.text)
            onReference(detected)
            setEditing(!detected)
            setMessage(detected ? 'Reference detected. Check it against your receipt before submitting.' : 'No clear reference was found. Enter it below or upload a clearer receipt.')
        } catch {
            if (current === request.current) {
                setEditing(true)
                setMessage('Could not read this receipt. Enter its reference below, or choose another image.')
            }
        } finally {
            if (worker) {
                if (workerRef.current === worker) workerRef.current = null
                await worker.terminate().catch(() => {})
            }
            if (current === request.current) setReading(false)
        }
    }
    const inputClass = 'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759]'
    return (
        <div className="mt-5 space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-slate-900">Submit your payment</h3>
                <p className="text-xs text-slate-500 mt-1">Upload a receipt to read the reference automatically, or enter the reference without an image.</p>
            </div>
            <div className="inline-flex max-w-full gap-1 rounded-xl bg-slate-100 p-1" aria-label="Payment submission options">
                {[['upload', 'Upload receipt'], ['manual', 'Enter reference']].map(([id, label]) => (
                    <button key={id} type="button" disabled={submitting} aria-pressed={mode === id} onClick={() => { if (mode !== id) changeMode(id) }} className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap ${mode === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{label}</button>
                ))}
            </div>
            {mode === 'upload' && (
                <div className="space-y-3">
                    <label htmlFor="tournament-payment-receipt" className="block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center hover:border-[#34C759]">
                        <span className="block text-sm font-medium text-slate-700">{receipt ? 'Choose another receipt' : 'Choose receipt image'}</span>
                        <span className="block text-xs text-slate-400 mt-1">JPG, PNG or WebP · Up to 5 MB</span>
                        <input id="tournament-payment-receipt" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={submitting} className="sr-only" />
                    </label>
                    {preview && <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                        <a href={preview} target="_blank" rel="noreferrer" aria-label="Open receipt preview" className="shrink-0"><img src={preview} alt="Uploaded payment receipt" className="h-24 w-20 rounded-lg object-contain bg-slate-50" /></a>
                        <div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-700 break-all">{receipt?.name}</p><p className="text-xs text-slate-500 mt-2" role="status">{reading ? `Reading receipt… ${progress}%` : message}</p>
                            {reading && <button type="button" onClick={() => { clearWorker(); setReading(false); setEditing(true); setMessage('Enter the reference from this receipt.'); }} className="text-xs text-[#279A45] mt-2 hover:underline">Enter reference instead</button>}
                        </div>
                    </div>}
                    {!preview && message && <p className="text-xs text-red-600" role="alert">{message}</p>}
                    {reference && !reading && !editing && <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3"><div className="min-w-0"><p className="text-xs text-slate-500">Detected reference</p><p className="text-sm font-medium text-slate-900 break-all mt-1">{reference}</p></div><button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-[#279A45]">Correct</button></div>}
                </div>
            )}
            {(mode === 'manual' || editing) && !reading && <div>
                <label htmlFor="payment-reference-entry" className="block text-xs font-medium text-slate-600 mb-2">{mode === 'manual' ? 'Reference number' : 'Correct receipt reference'}</label>
                <input id="payment-reference-entry" type="text" maxLength={100} value={reference} onChange={e => onReference(e.target.value)} disabled={submitting} placeholder="Enter the reference from your payment" className={inputClass} />
            </div>}
            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={onSubmit} disabled={reading || submitting || !reference.trim() || (mode === 'upload' && !receipt)} className="px-5 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#2FB350] text-white text-sm font-semibold cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Submitting…' : rejected ? 'Resubmit payment' : 'Submit payment'}</button>
                <p className="text-xs text-slate-400">The organizer will verify your payment.</p>
            </div>
        </div>
    )
}
