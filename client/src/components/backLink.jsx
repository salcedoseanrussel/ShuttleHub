import { Link, useLocation } from 'react-router-dom'

function BackLink({ fallbackTo, fallbackLabel, optional = false }) {
    const location = useLocation()
    const back = location.state?.back
    const validBack = typeof back?.to === 'string' && back.to.startsWith('/') && !back.to.startsWith('//')

    if (optional && !validBack) return null

    return (
        <Link
            to={validBack ? back.to : fallbackTo}
            state={validBack ? back.state : undefined}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-500"
        >
            <span aria-hidden="true">←</span>
            {validBack ? back.label || fallbackLabel : fallbackLabel}
        </Link>
    )
}

export default BackLink
