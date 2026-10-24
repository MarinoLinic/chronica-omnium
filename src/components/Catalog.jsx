import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import data from '../data'
import { periodKinds } from '../utils/periods'
import EventLink from './EventLink'
import { loadEvent } from '../utils/event-loader'
const dev = import.meta.env.DEV
const inputClass = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm'
function Editor({ id, places, onSaved, onDirty }) {
  const [record, setRecord] = useState(null), [version, setVersion] = useState(null), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false)
  const draftKey = `chronica-draft-${id}`
  const load = async (recover = false) => {
    setMessage(''); const response = await fetch(`/_local/catalog/${id}`); const result = await response.json()
    if (!response.ok) throw new Error(result.error)
    setRecord(result.record); setVersion(result.version); setDirty(false)
    try {
      const draft = recover && JSON.parse(sessionStorage.getItem(draftKey) || 'null')
      if (draft?.record?.id === id && draft.version) {setRecord(draft.record);setVersion(draft.version);setDirty(true);setMessage('Recovered unsaved changes from this tab. Saving still checks the file version; Reload from disk discards this draft.')}
      else sessionStorage.removeItem(draftKey)
    } catch { /* Draft recovery is optional when browser storage is unavailable. */ }
  }
  useEffect(() => { load(true).catch(e => setMessage(e.message)) }, [id])
  useEffect(() => {if(record && dirty)try {sessionStorage.setItem(draftKey,JSON.stringify({record,version}))}catch{}},[record,version,dirty,draftKey])
  useEffect(() => {
    onDirty(dirty)
    const prevent = e => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', prevent); return () => window.removeEventListener('beforeunload', prevent)
  }, [dirty,onDirty])
  const change = (key, value) => { setRecord(r => ({ ...r, [key]: value })); setDirty(true) }
  const save = async e => {
    e.preventDefault(); setBusy(true); setMessage('Saving…')
    try {
      const response = await fetch(`/_local/catalog/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version, record }) })
      const result = await response.json()
      if (result.version) setVersion(result.version)
      if (!response.ok) throw new Error(result.error)
      try {sessionStorage.removeItem(draftKey)}catch{}
      loadEvent.clear(); setDirty(false); setMessage('Saved, backed up, and rebuilt. The catalog and preview are up to date.'); onSaved()
    } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }
  if (!record) return <p role="status">{message || 'Loading record…'}</p>
  return <form onSubmit={save} className="space-y-4 border border-slate-200 bg-slate-50 p-5">
    <h2 className="text-xl">Edit {id}</h2><p className="text-sm text-slate-600">Saves update the local source file and create a backup in .local/history. Stable IDs and imported legacy fields are preserved.</p>
    <div className="grid gap-4 sm:grid-cols-2">{['name','type','field','location','source','image','date_label'].map(key => <label key={key} className="text-sm">{key === 'date_label' ? 'Recorded dates label (for example, Lifespan or In office)' : key}<input className={inputClass} value={record[key] || ''} onChange={e => change(key, e.target.value || null)} /></label>)}
    {['start','end'].map(key => <label key={key} className="text-sm">{key} year (negative = BCE)<input type="number" step="1" className={inputClass} value={record[key] ?? ''} onChange={e => change(key, e.target.value === '' ? null : Number(e.target.value))} /></label>)}
    <label className="text-sm">Priority (1 highest, 5 lowest)<select className={inputClass} value={record.priority ?? ''} onChange={e=>change('priority',e.target.value === '' ? null : Number(e.target.value))}><option value="">Unassigned</option>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label>
    <label className="text-sm">Date meaning<select className={inputClass} value={record.date_kind} onChange={e => change('date_kind', e.target.value)}>{['point','span','uncertain','ongoing'].map(s => <option key={s}>{s}</option>)}</select></label>
    <label className="text-sm">Editorial status<select className={inputClass} value={record.status} onChange={e => change('status', e.target.value)}>{['stub','review','ready'].map(s => <option key={s}>{s}</option>)}</select></label></div>
    {['short_desc','long_desc','date_note','notes','dubious'].map(key => <label key={key} className="block text-sm">{key}<textarea rows={key === 'long_desc' ? 4 : 2} className={inputClass} value={record[key] || ''} onChange={e => change(key, e.target.value)} /></label>)}
    <div className="grid gap-4 sm:grid-cols-3">{['casualties_low','casualties_high','relevance'].map(key => <label key={key} className="text-sm">{key}<input type="number" min="0" step={key === 'relevance' ? 'any' : '1'} className={inputClass} value={record[key] ?? ''} onChange={e=>change(key,e.target.value === '' ? null : Number(e.target.value))} /></label>)}</div>
    <fieldset className="space-y-4 border border-slate-300 p-3"><legend className="px-2 font-semibold">Additional periods</legend><p className="text-sm">Keep lifespan, terms in office, and active work as separate periods. Each has its own source and date meaning. An unknown active period should stay undated.</p>
      {(record.periods || []).map((period,index)=>{
        const patch=(key,value)=>change('periods',record.periods.map(p=>p.id===period.id?{...p,[key]:value}:p))
        return <fieldset key={period.id} className="grid gap-3 border border-slate-200 p-3 sm:grid-cols-2"><legend className="px-2 text-sm">Period {index+1}</legend>
          {['label','source','date_note'].map(key=><label key={key} className="text-sm">{key}<input aria-label={`Period ${index+1} ${key}`} className={inputClass} value={period[key] || ''} onChange={e=>patch(key,e.target.value || null)} /></label>)}
          <label className="text-sm">Kind<select aria-label={`Period ${index+1} kind`} className={inputClass} value={period.kind} onChange={e=>patch('kind',e.target.value)}>{periodKinds.map(k=><option key={k}>{k}</option>)}</select></label>
          {['start','end'].map(key=><label key={key} className="text-sm">{key} year<input aria-label={`Period ${index+1} ${key} year`} type="number" step="1" className={inputClass} value={period[key] ?? ''} onChange={e=>patch(key,e.target.value===''?null:Number(e.target.value))} /></label>)}
          <label className="text-sm">Date meaning<select aria-label={`Period ${index+1} date meaning`} className={inputClass} value={period.date_kind} onChange={e=>patch('date_kind',e.target.value)}>{['point','span','uncertain','ongoing'].map(k=><option key={k}>{k}</option>)}</select></label>
          <button type="button" className="text-sm underline" onClick={()=>{if(window.confirm(`Remove ${period.label || 'this period'} from the form? Saving retains the previous file in history.`)){change('periods',record.periods.filter(p=>p.id!==period.id));if(record.timeline_period===period.id)change('timeline_period',null)}}}>Remove period</button>
        </fieldset>
      })}
      <button type="button" className="text-sm underline" onClick={()=>change('periods',[...(record.periods || []),{id:`period-${crypto.randomUUID()}`,label:'Additional period',kind:'other',start:null,end:null,date_kind:'point',date_note:null,source:null}])}>Add period</button>
      <label className="block text-sm">Preferred timeline period<select aria-label="Preferred timeline period" className={inputClass} value={record.timeline_period || ''} onChange={e=>change('timeline_period',e.target.value || null)}><option value="">{record.date_label || 'Recorded dates'}</option>{(record.periods || []).map(p=><option key={p.id} value={p.id}>{p.label || p.id}</option>)}</select></label>
    </fieldset>
    <label className="block text-sm">Places (Ctrl/Cmd to select several)<select multiple className={inputClass} size={5} value={record.places} onChange={e => change('places', [...e.target.selectedOptions].map(o => o.value))}>{places.map(p => <option key={p.id} value={p.id}>{p.label} · {p.status}</option>)}</select></label>
    <div className="flex flex-wrap gap-4"><button disabled={busy || !dirty} className="rounded bg-[#21306a] px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save record'}</button><button type="button" className="text-sm underline" onClick={() => { if (!dirty || window.confirm('Discard unsaved form changes and reload the file?')) load().catch(e => setMessage(e.message)) }}>Reload from disk</button><a className="text-sm underline" href={`/${record.id_num}`} target="_blank" rel="noreferrer">Preview record ↗</a></div>
    <p role="status" className="whitespace-pre-wrap text-sm">{message}</p>
  </form>
}
export default function Catalog() {
  const [params, setParams] = useSearchParams(), [query, setQuery] = useState(''), [status, setStatus] = useState('all'), [places, setPlaces] = useState([]), [catalog,setCatalog] = useState(data), [dirty,setDirty] = useState(false), [name,setName] = useState(''), [creating,setCreating] = useState(false), [message,setMessage] = useState('')
  const editing = params.get('edit')
  const refresh = async () => { try { const response = await fetch('/data/catalog.json',{cache:'no-store'}); if (!response.ok) throw new Error('Could not reload catalog'); setCatalog(await response.json()) } catch(e) {setMessage(e.message)} }
  useEffect(() => { if (dev) { refresh(); fetch('/_local/catalog').then(r => r.json()).then(r => setPlaces(r.places || [])).catch(e=>setMessage(e.message)) } }, [])
  const mayLeave = () => !dirty || window.confirm('Discard unsaved form changes?')
  const create = async e => {
    e.preventDefault(); if (!mayLeave()) return
    setCreating(true); setMessage('Creating…')
    try {
      const response = await fetch('/_local/catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name || null})}), result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setDirty(false); setName(''); await refresh(); setParams({edit:result.record.id}); setMessage(`Created ${result.record.id}. It is an undated stub until researched.`)
    } catch(e) {setMessage(e.message)} finally {setCreating(false)}
  }
  const records = catalog.filter(r => (status === 'all' || (status === 'undated' ? r.start === null : r.status === status)) && `${r.name} ${r.id} ${r.location || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <main className="mx-auto max-w-5xl px-4 py-8"><nav className="mb-6 flex gap-5 text-sm underline"><Link to="/" onClick={e=>{if(!mayLeave())e.preventDefault()}}>All dated events</Link><Link to="/timeline" onClick={e=>{if(!mayLeave())e.preventDefault()}}>Timeline</Link></nav><h1 className="text-3xl">Catalog</h1><p className="my-4 text-sm text-slate-600">All {catalog.length} records, including {catalog.filter(r => r.start === null).length} without dates. Unfinished work stays here until it can be researched.</p>
    {dev && <form onSubmit={create} className="my-4 flex flex-wrap gap-3"><input aria-label="New record title" className={`${inputClass} min-w-0 flex-1`} value={name} onChange={e=>setName(e.target.value)} placeholder="New record title (optional)" /><button className="rounded border border-slate-300 px-3 py-2 text-sm" disabled={creating}>{creating ? 'Creating…' : 'Create record'}</button></form>}
    <p role="status" className="text-sm">{message}</p>
    {dev && editing && <div className="my-6"><Editor key={editing} id={editing} places={places} onSaved={refresh} onDirty={setDirty} /></div>}
    <div className="my-4 flex flex-wrap gap-3"><input aria-label="Search catalog" className="flex-1 rounded border border-slate-300 p-2" placeholder="Search all records" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filter by status" className="rounded border border-slate-300 p-2" value={status} onChange={e => setStatus(e.target.value)}>{['all','undated','stub','review','ready'].map(s => <option key={s}>{s}</option>)}</select></div><p role="status" className="text-sm text-slate-500">{records.length} records</p>
    <ul className="divide-y divide-slate-200">{records.map(r => <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><EventLink event={r} onClick={e=>{if(!mayLeave())e.preventDefault()}} className="font-semibold blue hover:underline">{r.name}</EventLink><p className="text-xs text-slate-500">{r.id} · {r.status} · {r.time_start}</p></div>{dev && <button className="text-sm underline" onClick={() => { if (mayLeave()) { setDirty(false); setParams({ edit: r.id }); window.scrollTo({ top: 0 }) } }}>Edit locally</button>}</li>)}</ul>
  </main>
}
