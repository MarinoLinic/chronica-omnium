import { formatYear, elapsedYears } from './dates.js'

export const periodKinds = ['life','office','active','other']
export const dateModes = {
  preferred: 'Preferred period, otherwise recorded dates',
  recorded: 'Recorded dates',
  life: 'Lifespan where available, otherwise recorded dates',
  all: 'All recorded periods',
}
export function dateDetails(period, referenceYear) {
  const end = period.date_kind === 'ongoing' ? referenceYear : period.end
  return {
    start:period.start, end, date_kind:period.date_kind, date_note:period.date_note || null,
    time_start:period.start === null ? 'Date not yet added' : formatYear(period.start),
    time_end:period.date_kind === 'ongoing' ? `ongoing (through ${referenceYear})` : end === null ? null : formatYear(end),
    duration:period.start !== null && end !== null && period.date_kind !== 'uncertain' ? elapsedYears(period.start,end) : null,
  }
}
export function timelinePeriods(records, mode = 'preferred') {
  return records.flatMap(record=>{
    const primary={...record,timelineKey:`${record.id}:recorded`,period_label:record.date_label || 'Recorded dates',name:mode==='all'?`${record.name} · ${record.date_label || 'Recorded dates'}`:record.name}
    const project=p=>({...record,...dateDetails(p,record.referenceYear),timelineKey:`${record.id}:${p.id}`,period_label:p.label,period_source:p.source,name:`${record.name} · ${p.label}`})
    const periods=record.periods || []
    if(mode === 'all')return [primary,...periods.map(project)]
    const selected=mode === 'life' ? periods.find(p=>p.kind==='life' && p.start!==null) : mode === 'preferred' ? periods.find(p=>p.id===record.timeline_period && p.start!==null) : null
    return [selected ? project(selected) : primary]
  })
}
