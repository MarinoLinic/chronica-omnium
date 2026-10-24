import { mkdir, writeFile } from 'node:fs/promises'
import { at, loadCatalog, json } from './lib/catalog.mjs'
import { formatRange } from '../src/utils/dates.js'
const args = process.argv.slice(2), id = args[args.indexOf('--id') + 1]
const format = args.includes('--html') ? 'html' : 'md'
const r = (await loadCatalog()).find(e => e.record.id === id || String(e.record.id_num) === id)?.record
if (!r) throw new Error('Use --id event-0001 (or a numeric ID). Add --html for a printable copy.')
let content = null
try { content = await json(at('data/content', `${r.id}.json`)) } catch (e) { if (e.code !== 'ENOENT') throw e }
const text = content?.text || '(No cached article text.)'
const attribution = `Source: ${content?.source || r.source || 'not supplied'}\nRevision: ${content?.revisionId || 'unknown legacy revision'}\nFetched: ${content?.fetchedAt || 'unknown legacy retrieval date'}\n${content?.license || ''}`
const periods=(r.periods || []).map(p=>`${p.label}: ${formatRange(p)}${p.date_note?`\n${p.date_note}`:''}\nPeriod source: ${p.source || 'not yet added'}`).join('\n\n')
const esc = value => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const dates=`${r.date_label ? `${r.date_label}: ` : ''}${formatRange(r)}`
const output = format === 'md' ? `# ${r.name || r.id}\n\n${dates}\n\n${periods}\n\n${r.short_desc || ''}\n\n${text}\n\n---\n${attribution}\n` : `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(r.name)}</title><style>body{max-width:48rem;margin:3rem auto;padding:1rem;font:17px/1.6 system-ui;color:#172033}h1{line-height:1.2}pre{white-space:pre-wrap;font:inherit;font-size:12px}p{white-space:pre-line}@media print{body{margin:0;max-width:none}button{display:none}}</style><button onclick="window.print()">Print / Save as PDF</button><h1>${esc(r.name || r.id)}</h1><p>${esc(dates)}</p>${periods?`<h2>Other periods</h2><pre>${esc(periods)}</pre>`:''}<p>${esc(r.short_desc)}</p>${text.split(/\n\s*\n/).map(p => `<p>${esc(p)}</p>`).join('')}<hr><pre>${esc(attribution)}</pre></html>`
await mkdir(at('.local/exports'), { recursive: true })
const file = at('.local/exports', `${r.id}.${format}`)
await writeFile(file, output)
console.log(file)
