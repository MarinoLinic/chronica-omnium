// One-time, non-destructive import. Refuses to overwrite an existing catalog.
import { access, readFile, mkdir, writeFile } from 'node:fs/promises'
import { at, json, hash, writeJson } from './lib/catalog.mjs'
try { await access(at('data/events')); throw new Error('Catalog already exists. Migration refuses to overwrite it.') } catch (e) { if (e.code !== 'ENOENT') throw e }
const raw = await readFile(at('src/resources/World_History.json'))
const records = JSON.parse(raw)
const places = new Map()
const nonGeographic = /^(universe|milky way|world|earth|solar system|moon|global|space)$/i
const core = ['name','short_desc','long_desc','start','end','location','type','field','relevance','source','image','casualties_low','casualties_high','dubious']
const migration = []
for (const original of records) {
  const id = `event-${String(original.id_num).padStart(4, '0')}`
  let placeId = null
  if (original.location?.trim()) {
    const label = original.location.trim()
    placeId = `place-${hash(label).slice(0, 12)}`
    if (!places.has(placeId)) places.set(placeId, { id: placeId, label, aliases: [], status: nonGeographic.test(label) ? 'non-geographic' : 'review', countryCodes: [], coordinates: null, source: null, notes: 'Imported literal label. Do not infer modern countries or coordinates from this text.' })
  }
  const record = {
    schemaVersion: 1, id, id_num: original.id_num, slug: original.id || null,
    status: original.start === null || !original.name ? 'stub' : 'review',
    ...Object.fromEntries(core.map(key => [key, original[key] ?? null])),
    date_kind: original.range_type === 1 ? 'uncertain' : original.end === null ? 'point' : 'span',
    date_note: original.range_type === 1 ? 'Legacy range_type=1. Review whether these are uncertain bounds rather than a duration.' : '',
    places: placeId ? [placeId] : [], notes: '',
    legacy: Object.fromEntries(Object.entries(original).filter(([key]) => !core.includes(key) && key !== 'wiki')),
  }
  if (record.start === 0) {
    record.legacy.originalStart = 0
    record.start = null
    record.status = 'stub'
    record.date_note = 'Legacy year zero is ambiguous in BCE/CE notation. Review the source before choosing a year.'
    if (record.end !== null) { record.legacy.originalEnd = record.end; record.end = null; record.date_kind = 'point' }
  }
  await writeJson(at('data/events', `${id}.json`), record)
  if (original.wiki) await writeJson(at('data/content', `${id}.json`), {
    schemaVersion: 1, eventId: id, text: original.wiki, source: original.source,
    title: null, revisionId: null, fetchedAt: null, method: 'legacy-html-scrape',
    license: 'Wikipedia text; verify original page and applicable attribution. Import date is not a retrieval date.',
    status: 'review',
  })
  migration.push({ id, originalSha256: hash(JSON.stringify(original)) })
}
await writeJson(at('data/config.json'), { schemaVersion: 1, referenceYear: 2026, generationYears: 25 })
await writeJson(at('data/reference/places.json'), { schemaVersion: 1, notes: 'Literal legacy labels, including compound places. Reviewed coordinates are opt-in. Historical polities are not modern countries.', places: [...places.values()] })
const scales = await json(at('src/resources/time_scales.json'))
if (!Array.isArray(scales.time_scale.climatic)) scales.time_scale.climatic = [scales.time_scale.climatic]
await writeJson(at('data/reference/time-scales.json'), { schemaVersion: 1, metadata: { status: 'legacy-needs-review', yearConvention: 'Historical signed years, BCE negative, no year zero. Legacy deep time boundaries are retained.', scope: 'Human period labels are regional conventions, not universal boundaries.', sources: [], notes: 'Original numbers and spelling retained. Colors and some nesting/boundaries need source review.' }, ...scales })
const codes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ')
const names = new Intl.DisplayNames(['en'], { type: 'region' })
await writeJson(at('data/reference/countries.json'), { schemaVersion: 1, notes: 'ISO 3166-1 alpha-2 identifiers. Labels from Node Intl English display names at migration. A code is a geographic reference, not a claim about historic sovereignty.', countries: codes.map(code => ({ code, name: names.of(code) })) })
await writeJson(at('data/media/manifest.json'), { schemaVersion: 1, items: {} })
await writeJson(at('data/migration.json'), { schemaVersion: 1, source: 'src/resources/World_History.json', sourceSha256: hash(raw), count: records.length, records: migration })
console.log(`Preserved ${records.length} records and ${places.size} literal place labels. Legacy files were not changed.`)
