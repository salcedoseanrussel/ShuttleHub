function ResultsPodium({
    entries = [],
    title = 'Final Results',
    description = '',
    loading = false,
    error = '',
    metallic = false
}) {

    const places = [
        { rank: 2, label: 'Runner-up', color: 'bg-slate-100 border-slate-200 text-slate-700', height: 'h-16' },
        { rank: 1, label: 'Winner', color: 'bg-amber-50 border-amber-200 text-amber-700', height: 'h-24' },
        { rank: 3, label: 'Third Place', color: 'bg-orange-50 border-orange-200 text-orange-700', height: 'h-12' }
    ]

    const metalFinishes = {
        1: { border: '#D8C58F', text: '#78602A', colors: '#E5D3A3 0%, #F1E6C8 32%, #F7EFD9 48%, #E9D9B0 72%, #EDDEBA 100%' },
        2: { border: '#CBD0D6', text: '#58616D', colors: '#CCD2D9 0%, #E6E9ED 32%, #F3F5F7 48%, #D7DDE3 72%, #E1E5EA 100%' },
        3: { border: '#D8BBA5', text: '#805B40', colors: '#D7B79D 0%, #EAD6C6 32%, #F3E5DA 48%, #DEC3AD 72%, #E6CEBB 100%' }
    }

    const metalStyle = rank => metallic ? {
        backgroundImage: `linear-gradient(135deg, ${metalFinishes[rank].colors})`,
        borderColor: metalFinishes[rank].border,
        color: metalFinishes[rank].text,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 3px rgba(70,50,25,0.04)'
    } : undefined

    return (
        <section className="mt-5" aria-label={title}>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}

            {loading ? (
                <p className="text-sm text-slate-500 mt-4">Loading results...</p>
            ) : error ? (
                <p className="text-sm text-slate-500 mt-4">{error}</p>
            ) : entries.length === 0 ? (
                <p className="text-sm text-slate-500 mt-4">No completed results available.</p>
            ) : (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mt-5">
                    {places.map(place => {
                        const placed = entries.filter(entry => entry.rank === place.rank)
                        return (
                            <div key={place.rank} className="min-w-0 text-center">
                                <div style={metalStyle(place.rank)} className={`rounded-t-xl border p-2 sm:p-4 ${place.color}`}>
                                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                                        {placed.length > 1 ? `Joint ${place.label}` : place.label}
                                    </p>
                                    {placed.length > 0 ? (
                                        <div className={place.rank === 3 && placed.length > 1 ? 'grid grid-cols-2 gap-2 sm:gap-3' : ''}>
                                        {placed.map(entry => (
                                        <div key={entry.id} className="mt-3">
                                            <p className="text-sm sm:text-lg font-bold text-slate-950 break-words">{entry.name}</p>
                                            {entry.members && <p className={`text-xs ${metallic ? 'text-slate-700' : 'text-slate-500'} mt-1 break-words`}>{entry.members}</p>}
                                            {entry.detail && <p className="text-xs sm:text-sm mt-2">{entry.detail}</p>}
                                        </div>
                                        ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 mt-3">Not awarded</p>
                                    )}
                                </div>
                                <div style={metalStyle(place.rank)} className={`flex items-center justify-center rounded-b-xl border border-t-0 text-2xl sm:text-3xl font-bold ${place.color} ${place.height}`}>
                                    {place.rank}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default ResultsPodium
