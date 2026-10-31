const addressFields = [
    { name: 'venue', label: 'Venue / Badminton Center', required: true },
    { name: 'street', label: 'Street / Building' },
    { name: 'barangay', label: 'Barangay', required: true },
    { name: 'municipality', label: 'Municipality / City', required: true },
    { name: 'province', label: 'Province', required: true }
]
const inputClass = 'w-full px-4 py-3 bg-[#FAFBFC] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#34C759] transition'

export default function TournamentLocationSchedule({ form, onChange }) {
    return (
        <>
            <fieldset className="space-y-4">
                <legend className="text-sm font-medium text-slate-700 mb-3">Tournament Location</legend>
                <div className="grid md:grid-cols-2 gap-5">
                    {addressFields.map(field => (
                        <div key={field.name}>
                            <label htmlFor={`address-${field.name}`} className="block text-sm font-medium text-slate-700 mb-2">
                                {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input id={`address-${field.name}`} name={field.name} value={form[field.name]}
                                onChange={onChange} required={field.required} className={inputClass} />
                        </div>
                    ))}
                </div>
            </fieldset>
            <div>
                <div className="grid md:grid-cols-3 gap-5">
                    {[{name:'startDate',label:'Tournament Date',type:'date'},
                      {name:'startTime',label:'Start Time',type:'time'},
                      {name:'endTime',label:'End Time',type:'time'}].map(field => (
                        <div key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-medium text-slate-700 mb-2">
                                {field.label}<span className="text-red-500 ml-1">*</span>
                            </label>
                            <input id={field.name} name={field.name} type={field.type} value={form[field.name]}
                                onChange={onChange} required className={inputClass} />
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">Philippine time (UTC+8). Registration closes when all slots are taken or the tournament starts, whichever comes first.</p>
            </div>
        </>
    )
}
