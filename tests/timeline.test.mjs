import test from 'node:test'
import assert from 'node:assert/strict'
import { layoutTimeline, selectEvents } from '../src/utils/timeline.js'
const records = [
  { id:'a', id_num:1, name:'A span', start:-10, end:10, type:'Unit' },
  { id:'b', id_num:2, name:'A point', start:1, end:null, type:'Event' },
  { id:'c', id_num:3, name:'Undated', start:null, end:null },
  { id:'d', id_num:4, name:'Outside', start:100, end:null },
]
test('window includes overlapping spans and points, excludes undated/outside', () => {
  assert.deepEqual(selectEvents(records,{start:-2,end:2}).map(r=>r.id),['a','b'])
  assert.deepEqual(selectEvents(records,{start:-2,end:2,type:'Event'}).map(r=>r.id),['b'])
  assert.deepEqual(selectEvents(records,{start:-2,end:2,query:'SPAN'}).map(r=>r.id),['a'])
})
for (const orientation of ['horizontal','vertical']) test(`${orientation} uses a linear scale and keeps overlapping labels in separate lanes`, () => {
  const range = {start:-2,end:2,orientation,pixels:1200}
  const {items,ticks} = layoutTimeline(selectEvents(records,range),range)
  assert.equal(items[0].position,0)
  assert.equal(items[0].length,1200)
  assert.equal(items[1].position,800)
  assert.notEqual(items[0].lane,items[1].lane)
  assert.ok(items[0].clippedStart && items[0].clippedEnd)
  assert.ok(ticks.every(t=>t.year!==0))
})
test('empty and deep-time ranges are bounded and well-defined', () => {
  assert.equal(layoutTimeline([],{start:1,end:2}).items.length,0)
  const layout=layoutTimeline([{...records[1],start:-13800000000}],{start:-13800000000,end:2026})
  assert.ok(layout.ticks.length <= 12)
  assert.throws(()=>layoutTimeline([],{start:2,end:1}))
})
test('a point at the right edge leaves room for its exported label',()=>{
  const layout=layoutTimeline([{...records[1],start:100,end:null}],{start:1,end:100})
  assert.ok(layout.width>=40+layout.items[0].position+242)
})
