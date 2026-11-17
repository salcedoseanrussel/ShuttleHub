// Only accept a number next to an explicit reference/transaction label.
// Do not guess using unlabeled amounts, dates, or phone numbers.
export function extractReceiptReference(text = '') {
    const lines = String(text).split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    const candidates = new Set()
    const label = /\b(?:ref(?:erence)?\.?\s*(?:(?:no|number|id)\.?)?|transaction\s*(?:no\.?|number|id)|trace\s*(?:no\.?|number|id))\s*[:#.-]?\s*/i
    const candidate = value => {
        // OCR may join the reference and the date from the same printed row.
        // Trim date/time columns before compacting spaces in the actual reference.
        const months = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
        const suffixes = [
            new RegExp('\\s+' + months + '\\.?\\s*\\d{1,2}\\b', 'i'),
            new RegExp('(?<=\\d)' + months + '\\.?\\s*\\d{1,2}(?:\\s*,\\s*|\\s+)(?:19|20)\\d{2}\\b', 'i'),
            /\s+\d{1,4}[/-]\d{1,2}[/-]\d{1,4}\b/,
            /\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\b/i
        ]
        const stops = suffixes.map(pattern => value.search(pattern)).filter(index => index >= 0)
        if (stops.length) value = value.slice(0, Math.min(...stops)).trim()
        const match = value.match(/^([A-Z0-9][A-Z0-9 -]{4,45})/i)
        if (!match) return ''
        const compact = match[1].replace(/[ -]/g, '').toUpperCase()
        if (compact.length < 6 || compact.length > 40 || !/\d/.test(compact)) return ''
        if (/^[A-Z]+$/.test(compact) || /[A-Z]{5,}/.test(compact)) return ''
        return compact
    }
    for (let index = 0; index < lines.length; index++) {
        const hit = label.exec(lines[index])
        if (!hit) continue
        const rest = lines[index].slice(hit.index + hit[0].length).trim()
        const value = candidate(rest || lines[index + 1] || '')
        if (value) candidates.add(value)
    }
    return candidates.size === 1 ? [...candidates][0] : ''
}
