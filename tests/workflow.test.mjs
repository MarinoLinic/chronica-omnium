import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { withCatalogLock } from '../scripts/lib/lock.mjs'
import { at } from '../scripts/lib/catalog.mjs'
import { parseCoordinates, parseBounds } from '../src/utils/coordinates.js'
import { mediaAudit } from '../scripts/lib/media-audit.mjs'

test('writers cannot overlap and the lock releases after failure', async () => {
  const file=at('.local/qa',`${randomUUID()}.lock`)
  await withCatalogLock('test owner',async()=>{
    await assert.rejects(withCatalogLock('second writer',async()=>assert.fail('overlap'),file),/Catalog is busy/)
  },file)
  await assert.rejects(withCatalogLock('throwing writer',async()=>{throw new Error('test failure')},file),/test failure/)
  assert.equal(await withCatalogLock('later writer',async()=>42,file),42)
})
test('maps accept reviewed numeric coordinates only and reject reversed/outside bounds', () => {
  for(const coordinates of [[null,null],['1','2'],[NaN,1],[-91,2],[1,181]])assert.equal(parseCoordinates({reviewed:true,coordinates}),null)
  assert.equal(parseCoordinates({coordinates:[45,16]}),null)
  assert.deepEqual(parseCoordinates({reviewed:true,coordinates:[0,0]}),[0,0])
  for(const boundingbox of [[-91,20,1,2],[20,10,1,2],[1,2,5,4],[1,2,3,null]])assert.equal(parseBounds({reviewed:true,boundingbox}),null)
  assert.deepEqual(parseBounds({reviewed:true,boundingbox:[-40,-30,10,20]}),[[-40,10],[-30,20]])
})
test('media reconciliation accounts for shared cached files and every remote image', () => {
  const original='https://upload.wikimedia.org/wikipedia/commons/a/ab/Test.jpg'
  const entries=[1,2,3,4].map(n=>({record:{id:`e${n}`,image:n===4?'https://example.org/a.jpg':original}}))
  const m={path:'/media/shared.png',original,bytes:25}
  const report=mediaAudit(entries,{items:{e1:m,e2:m}},{completed:true,results:[{id:'e3',imageError:'Image license requires manual review: unknown'}]})
  assert.equal(report.authoredImages,4); assert.equal(report.uniqueMappedBytes,25)
  assert.deepEqual(report.counts,{cached:2,'license-review':1,external:1})
})
