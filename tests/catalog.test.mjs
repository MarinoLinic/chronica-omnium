import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { at, json, loadCatalog, loadReferences, audit, hash, compileRecord, validateRecord, validateContent, eventKeys, requiredEventKeys, newRecord } from '../scripts/lib/catalog.mjs'
import { elapsedYears, formatYear } from '../src/utils/dates.js'
const entries = await loadCatalog(), refs = await loadReferences()
const original = await json(at('src/resources/World_History.json'))
test('original archive is unchanged and every migrated stable ID remains present', async () => {
  const migration = await json(at('data/migration.json'))
  // Git may check text out as CRLF on Windows and LF on Linux.
  // Check both the complete normalized file and every archived record below.
  const archive = await readFile(at(migration.source), 'utf8')
  assert.equal(hash(archive.replaceAll('\r\n', '\n')), migration.sourceLfSha256)
  assert.ok([migration.sourceSha256, migration.sourceLfSha256].includes(hash(archive)))
  assert.equal(migration.count, 574)
  for (const before of original) {
    const after = entries.find(e => e.record.id_num === before.id_num)?.record
    assert.ok(after, `missing record ${before.id_num}`)
    assert.equal(hash(JSON.stringify(before)), migration.records.find(r => r.id === after.id).originalSha256)
    // Authored fields may legitimately change later. Preservation means the
    // exact original archive and its checksums survive, not freezing edits.
    if (before.wiki) assert.ok((await json(at('data/content', `${after.id}.json`))).text)
  }
})
test('catalog is valid; incomplete records are warnings, not deleted rows', () => {
  const report = audit(entries, refs)
  assert.deepEqual(report.errors, [])
  assert.ok(report.total >= original.length)
  assert.equal(report.undated, entries.filter(e => e.record.start === null).length)
  assert.ok(report.warnings.some(w => w.code === 'missing-date'))
})
test('year-zero ambiguity stays unresolved, while BCE/CE durations omit year zero', () => {
  assert.equal(elapsedYears(-1, 1), 1)
  assert.equal(elapsedYears(-10, 10), 19)
  assert.equal(formatYear(-1), '1 BCE')
  assert.equal(formatYear(-13800000000), '13.8 billion BCE')
  const ambiguous = entries.find(e => e.record.id_num === 179).record
  assert.ok(validateRecord({ ...ambiguous, start: 0 }).length)
  assert.equal(compileRecord({...ambiguous, start: null, end: null}, refs).time_start, 'Date not yet added')
})
test('legacy geocodes never become reviewed map coordinates', () => {
  assert.ok(entries.some(e => e.record.legacy.location_info?.coordinates))
  for (const e of entries) {
    const mapped = compileRecord(e.record, refs).location_info
    if (mapped) assert.ok(e.record.places.some(id => refs.places.places.find(p => p.id === id)?.status === 'reviewed'))
  }
  const example = entries.find(e => e.record.places.length).record
  const custom = structuredClone(refs)
  const p = custom.places.places.find(p => p.id === example.places[0])
  p.status = 'reviewed'; p.coordinates = [45.81, 15.98]; p.source = 'https://example.org/source'
  assert.deepEqual(compileRecord(example, custom).location_info.coordinates, [45.81,15.98])
})
test('ready records, source URLs, and date meanings are validated', () => {
  const base = entries[0].record
  assert.ok(validateRecord({ ...base, status: 'ready', source: null }).length)
  assert.ok(validateRecord({ ...base, end: -14000000000 }).length)
  assert.ok(validateRecord({ ...base, source: 'javascript:alert(1)' }).length)
  assert.ok(validateRecord({ ...base, date_kind: 'point', end: 1 }).length)
  assert.ok(validateRecord({ ...base, places: 'invalid' }).length)
  assert.ok(audit([{file: `${base.id}.json`, record: {...base, places: ['missing']}}], refs).errors.length)
})
test('public index omits full article text, legacy geocodes, and author notes', async () => {
  const index = await json(at('src/generated/catalog.json'))
  assert.equal(index.length, entries.length)
  for (const r of index) for (const key of ['legacy','wiki','notes']) assert.equal(Object.hasOwn(r,key),false)
  assert.ok((await json(at('public/data/events/event-0001.json'))).content.text)
})

test('schema and runtime agree on authored fields; malformed research fields fail', async () => {
  const schema = await json(at('data/schema/event.schema.json'))
  assert.deepEqual([...schema.required].sort(), [...requiredEventKeys].sort())
  assert.deepEqual(Object.keys(schema.properties).sort(), [...eventKeys].sort())
  const base = entries[0].record
  for (const patch of [{dubious:1},{casualties_low:-1},{casualties_low:10,casualties_high:5},{relevance:'1'},{places:['a','a']},{unexpected:true},{legacy:[]}]) assert.ok(validateRecord({...base,...patch}).length,JSON.stringify(patch))
  assert.deepEqual(validateRecord(newRecord([{record:{id_num:9}},{record:{id_num:52}}],null)),[])
  assert.equal(newRecord([{record:{id_num:52}}]).id,'event-0053')
})
test('broken reference containers and source snapshots produce useful validation errors', async () => {
  for (const patch of [{places:{}},{countries:{countries:null}},{scales:{}},{config:{referenceYear:0}},{media:{items:[]}}]) assert.ok(audit(entries,{...refs,...patch}).errors.length)
  const content = await json(at('data/content/event-0001.json'))
  assert.deepEqual(validateContent(content,'event-0001'),[])
  for (const patch of [{text:[]},{eventId:'event-0002'},{revisionId:0},{source:'javascript:x'},{fetchedAt:'unknown'}]) assert.ok(validateContent({...content,...patch},'event-0001').length)
})
test('changed image URL cannot retain a stale local image or legacy thumbnail', () => {
  const base=entries[0].record
  const result=compileRecord({...base,image:'https://example.org/new.jpg'},refs)
  assert.equal(result.local_image,null)
  assert.equal(result.img_sm,'https://example.org/new.jpg')
})
