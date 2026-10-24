import test from 'node:test'
import assert from 'node:assert/strict'
import { timelinePeriods, dateDetails } from '../src/utils/periods.js'
import { selectEvents, layoutTimeline } from '../src/utils/timeline.js'
import { newRecord, validateRecord, validatePeriod } from '../scripts/lib/catalog.mjs'
const life={id:'life',label:'Lifespan',kind:'life',start:1900,end:1970,date_kind:'span',source:'https://example.org/life',date_note:null}
const office={id:'term-1',label:'First term',kind:'office',start:1940,end:1945,date_kind:'span',source:'https://example.org/office',date_note:null}
const record={...newRecord([], 'Fictional person'),start:1900,end:1970,date_kind:'span',periods:[office],timeline_period:'term-1'}
test('named periods validate independently and preferred IDs cannot point elsewhere',()=>{
  assert.deepEqual(validateRecord(record),[])
  for(const patch of [{timeline_period:'missing'},{periods:[office,office]},{periods:[{...life,start:0}]},{periods:[{...office,end:1939}]},{periods:[{...office,source:'javascript:bad'}]},{periods:'bad'}])assert.ok(validateRecord({...record,...patch}).length,JSON.stringify(patch))
  assert.deepEqual(validatePeriod({...life,start:null,end:null,date_kind:'point',source:null}),[])
})
test('preferred and lifespan modes use explicit periods and preserve event identity',()=>{
  const preferred=timelinePeriods([record])[0]
  assert.equal(preferred.start,1940);assert.equal(preferred.id,record.id);assert.equal(preferred.id_num,record.id_num)
  assert.equal(preferred.period_source,office.source)
  assert.equal(timelinePeriods([record],'recorded')[0].start,1900)
  assert.equal(timelinePeriods([record],'life')[0].start,1900,'no guessed lifespan')
  assert.equal(timelinePeriods([{...record,periods:[office,life]}],'life')[0].end,1970)
  assert.equal(timelinePeriods([{...record,periods:[{...office,start:null,end:null,date_kind:'point'}]}])[0].start,1900,'unfinished preferred period falls back')
})
test('all periods remain distinct bars with the same record URL and independent filtering',()=>{
  const all=timelinePeriods([{...record,periods:[office,life]}],'all')
  assert.equal(all.length,3);assert.equal(new Set(all.map(r=>r.timelineKey)).size,3)
  assert.ok(all.every(r=>r.id_num===record.id_num))
  assert.equal(selectEvents(all,{start:1910,end:1920}).length,2)
  const layout=layoutTimeline(all,{start:1890,end:1980})
  assert.equal(layout.items.length,3)
})
test('each period retains uncertainty and ongoing semantics across BCE/CE',()=>{
  assert.equal(dateDetails({...life,start:-1,end:1},2026).duration,1)
  assert.equal(dateDetails({...life,date_kind:'uncertain'},2026).duration,null)
  assert.equal(dateDetails({...life,start:2000,end:null,date_kind:'ongoing'},2026).end,2026)
})
