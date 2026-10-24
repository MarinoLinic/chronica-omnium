import { commonsFilename } from './wikimedia.mjs'
export function mediaAudit(entries, manifest, sync = {}) {
  const latest = new Map((sync.results || []).map(r=>[r.id,r]))
  const items = entries.filter(e=>e.record.image).map(({record:r})=>{
    const cached = manifest.items[r.id], result = latest.get(r.id)
    const reason = result?.imageError || result?.error || null
    const status = cached?.original === r.image ? 'cached' : !commonsFilename(r.image) ? 'external' : /license requires manual review/i.test(reason || '') ? 'license-review' : /missing/i.test(reason || '') ? 'missing' : reason ? 'failed' : 'not-cached'
    return {id:r.id, status, original:r.image, path:status==='cached'?cached.path:null, reason:status==='cached'?null:reason}
  })
  const unique = new Map(items.filter(r=>r.status==='cached').map(r=>[r.path,manifest.items[r.id].bytes]))
  return { authoredImages:items.length, counts:items.reduce((counts,r)=>({...counts,[r.status]:(counts[r.status]||0)+1}),{}), uniqueMappedFiles:unique.size, uniqueMappedBytes:[...unique.values()].reduce((a,b)=>a+b,0), latestPassCompleted:sync.completed===true, items }
}
