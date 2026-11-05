import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function TournamentPaymentInfo({ tournament }) {
    const payment = tournament.paymentInstructions || {}
    const [open, setOpen] = useState(false)
    const dialogRef = useRef(null)
    const triggerRef = useRef(null)
    const amount = `₱${Number(tournament.registrationFee || 0).toLocaleString()}`

    useEffect(() => {
        if (!open || !payment.qrCode) return
        const dialog = dialogRef.current
        if (!dialog) return
        const main = triggerRef.current?.closest('main')
        const bodyOverflow = document.body.style.overflow
        const mainOverflow = main?.style.overflowY
        document.body.style.overflow = 'hidden'
        if (main) main.style.overflowY = 'hidden'
        if (!dialog.open) dialog.showModal()
        return () => {
            if (dialog.open) dialog.close()
            document.body.style.overflow = bodyOverflow
            if (main) main.style.overflowY = mainOverflow
            triggerRef.current?.focus({ preventScroll: true })
        }
    }, [open, payment.qrCode])

    const closeOnBackdrop = event => {
        if (event.target !== event.currentTarget) return
        const box = event.currentTarget.getBoundingClientRect()
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) setOpen(false)
    }

    return (
        <>
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center border-b border-slate-100 pb-5">
                <div className="min-w-0 space-y-4">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Registration fee</p>
                        <p className="text-2xl font-semibold text-slate-950 mt-1">{amount}</p>
                    </div>
                    <dl className="grid grid-cols-3 gap-x-5 gap-y-3 text-sm">
                        <div><dt className="text-xs text-slate-400">Payment method</dt><dd className="font-medium text-slate-800 mt-1">{payment.method || 'Payment'}</dd></div>
                        {payment.accountName && <div className="min-w-0"><dt className="text-xs text-slate-400">Account name</dt><dd className="font-medium text-slate-800 mt-1 break-words">{payment.accountName}</dd></div>}
                        {payment.accountNumber && <div><dt className="text-xs text-slate-400">Account number</dt><dd className="font-medium text-slate-800 mt-1 break-all select-all">{payment.accountNumber}</dd></div>}
                    </dl>
                    <p className="text-xs text-slate-500 max-w-md">Pay the organizer using the details or QR, then submit your payment below for approval.</p>
                </div>
                {payment.qrCode && (
                    <div className="justify-self-center text-center space-y-2 sm:justify-self-end">
                        <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-label="View payment QR and account details" aria-haspopup="dialog" aria-expanded={open} className="block rounded-xl cursor-pointer transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500">
                            <img src={payment.qrCode} alt="Organizer payment QR" className="w-44 h-44 object-contain rounded-xl border border-slate-200 bg-white" />
                        </button>
                        <p className="text-[11px] text-slate-400">Click QR to view payment details</p>
                        <a href={payment.qrCode} download="tournament-payment-qr.png" className="inline-block text-xs font-medium text-[#279A45] hover:underline">Download payment QR</a>
                    </div>
                )}
            </div>
            {open && payment.qrCode && createPortal(
                <dialog ref={dialogRef} aria-labelledby="payment-qr-modal-title" onCancel={event => { event.preventDefault(); setOpen(false) }} onClose={() => setOpen(false)} onClick={closeOnBackdrop} className="fixed m-auto w-[calc(100%_-_2rem)] max-w-md max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-xl backdrop:bg-black/50">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <div className="min-w-0">
                            <h2 id="payment-qr-modal-title" className="text-lg font-semibold text-slate-950">Payment details</h2>
                            {tournament.title && <p className="text-xs text-slate-500 mt-1 break-words">{tournament.title}</p>}
                        </div>
                        <button type="button" onClick={() => setOpen(false)} aria-label="Close payment details" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-500 hover:bg-slate-50 cursor-pointer">×</button>
                    </div>
                    <div className="space-y-5 p-5">
                        <div className="flex justify-center"><img src={payment.qrCode} alt="Full-size organizer payment QR" className="w-full max-w-64 aspect-square object-contain rounded-xl border border-slate-200 bg-white" /></div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                            <p className="text-xs text-slate-500">Amount to pay</p>
                            <p className="text-2xl font-semibold text-slate-950 mt-1">{amount}</p>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4"><dt className="text-slate-500">Payment method</dt><dd className="font-medium text-right break-words">{payment.method || 'Payment'}</dd></div>
                            {payment.accountName && <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4"><dt className="text-slate-500">Account name</dt><dd className="font-medium text-right break-words">{payment.accountName}</dd></div>}
                            {payment.accountNumber && <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4"><dt className="text-slate-500">Account number</dt><dd className="font-medium text-right break-all select-all">{payment.accountNumber}</dd></div>}
                        </dl>
                        <p className="text-xs text-slate-500 leading-relaxed">Confirm the recipient in your payment app before sending. Submit your receipt or payment reference afterward for organizer approval.</p>
                        <a href={payment.qrCode} download="tournament-payment-qr.png" className="flex w-full items-center justify-center rounded-xl bg-[#34C759] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2FB350]">Download QR code</a>
                    </div>
                </dialog>, document.body
            )}
        </>
    )
}
