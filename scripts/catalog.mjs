import { recordFile, loadCatalog, writeJson, validateRecord, newRecord } from './lib/catalog.mjs'
import { withCatalogLock } from './lib/lock.mjs'
const [command = 'help', ...args] = process.argv.slice(2)
const entries = await loadCatalog()
if (command === 'find' || command === 'list') {
  const q = args.join(' ').toLowerCase()
  for (const { record: r } of entries) if (!q || JSON.stringify([r.name, r.location, r.notes]).toLowerCase().includes(q)) console.log(`${r.id}  ${r.status.padEnd(6)}  ${r.start ?? 'undated'}  ${r.name || '(untitled)'}`)
} else if (command === 'show') {
  const r = entries.find(e => e.record.id === args[0] || String(e.record.id_num) === args[0])
  if (!r) throw new Error('Unknown event ID')
  console.log(JSON.stringify(r.record, null, 2))
} else if (command === 'add') {
  await withCatalogLock('catalog add', async () => {
  const r = newRecord(await loadCatalog(),args.join(' ') || null)
  const errors = validateRecord(r)
  if (errors.length) throw new Error(errors.join('\n'))
  await writeJson(recordFile(r.id), r)
  console.log(`Created data/events/${r.id}.json. Fill it in, then run npm run data:build.`)
  })
} else console.log('npm run catalog -- find <text> | show <ID> | add <title> | list')
