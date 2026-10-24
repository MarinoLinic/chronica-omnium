import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { withCatalogLock } from './lib/lock.mjs'
import { validateContent } from './lib/catalog.mjs'
import { imageExtension } from './lib/wikimedia.mjs'
import { mediaAudit } from './lib/media-audit.mjs'
import { at, json, writeJson, loadCatalog, loadReferences, compileRecord, audit, hash } from './lib/catalog.mjs'

export async function buildData() {
const entries = await loadCatalog(), refs = await loadReferences()
const report = audit(entries, refs)
const contents = new Map()
for (const file of await readdir(at('data/content'))) {
  if (!file.endsWith('.json')) continue
  const content = await json(at('data/content', file))
  const id = file.slice(0, -5)
  for (const message of validateContent(content, id)) report.errors.push({ id, message })
  if (!entries.some(e => e.record.id === id)) report.errors.push({ id, message: 'snapshot references an unknown event' })
  contents.set(id, content)
}
for (const [id, media] of Object.entries(refs.media?.items || {})) {
  if (!media || typeof media !== 'object') continue
  if (!/^\/media\/[a-f0-9]{64}\.(png|jpg|webp|gif)$/.test(media.path)) { report.errors.push({ id, message: 'Invalid local media path' }); continue }
  try {
    const bytes = await readFile(at('public', media.path.slice(1)))
    if (hash(bytes) !== media.sha256 || bytes.length !== media.bytes) report.errors.push({ id, message: 'Local media checksum/size mismatch' })
    if (imageExtension(bytes) !== media.path.split('.').at(-1)) report.errors.push({ id, message: 'Local media signature does not match extension' })
  } catch { report.errors.push({ id, message: 'Local media file missing' }) }
}
await writeJson(at('data/reports/validation.json'), report)
if (report.errors.length) throw new Error(`Catalog validation failed:\n${report.errors.map(e => `${e.id}: ${e.message}`).join('\n')}`)
let sync = {}
try { sync = await json(at('data/reports/source-sync.json')) } catch(e) {if(e.code !== 'ENOENT')throw e}
await writeJson(at('data/reports/media-audit.json'),mediaAudit(entries,refs.media,sync,refs.enrichment))
const compiled = entries.map(({ record }) => compileRecord(record, refs))
// Keep long source extracts out of the first page's JavaScript payload.
const publicRecords = compiled.map(({ legacy, notes, ...r }) => r)
const summaryKeys = ['id','id_num','name','status','start','end','date_kind','date_label','periods','timeline_period','type','field','short_desc','location','countryCodes','countryNames','local_image','img_sm','image']
const index = publicRecords.map(r => Object.fromEntries(summaryKeys.map(key => [key, r[key]]).filter(([key,value])=>
  !(['date_label','timeline_period'].includes(key)&&value===null)&&!(Array.isArray(value)&&value.length===0)
)))
await writeJson(at('public/data/catalog.json'), index)
await writeJson(at('public/data/time-scales.json'), refs.scales)
await writeJson(at('public/data/countries.json'), refs.countries)
await writeJson(at('public/data/places.json'), refs.places)
for (const r of publicRecords) {
  const content = contents.get(r.id) || null
  await writeJson(at('public/data/events', `${r.id}.json`), { ...r, content })
}
// Publish imported modules last so Vite refreshes only after detail files exist.
await writeJson(at('src/generated/time-scales.json'), refs.scales)
await writeJson(at('src/generated/catalog.json'), index)
console.log(`Built ${index.length} records (${report.dated} dated; ${report.undated} unfinished dates). ${report.warnings.length} review notes in data/reports/validation.json.`)
return report
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await withCatalogLock('data build', buildData)
