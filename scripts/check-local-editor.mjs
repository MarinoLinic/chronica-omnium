import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const origin = 'http://127.0.0.1:5173', url = `${origin}/_local/catalog/event-0001`
const response = await fetch(url), original = await response.json()
assert.equal(response.status, 200)
const put = (body, source = origin) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: source }, body: JSON.stringify(body) })
assert.equal((await put({ version: original.version, record: {} }, 'https://example.org')).status, 403)
assert.equal((await put({ version: 'stale', record: {} })).status, 409)
assert.equal((await put({ version: original.version, record: { start: 0 } })).status, 422)
const saved = await put({ version: original.version, record: original.record })
const result = await saved.json()
assert.equal(saved.status, 200, JSON.stringify(result))
const after = await (await fetch(url)).json()
assert.deepEqual(after.record, original.record, 'No-op smoke save must preserve every field')
assert.equal(after.version, original.version)
assert.deepEqual(JSON.parse(await readFile(result.backup, 'utf8')), original.record)
assert.equal((await put({version:after.version,record:{unknown:'field'}})).status,422)
assert.equal((await put({version:after.version,record:{id_num:9999}})).status,422)
assert.equal((await put({version:after.version,record:{dubious:true}})).status,422)
assert.equal((await fetch(`${origin}/_local/catalog`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:'{"name":42}'})).status,400)
// Exercise a real edit, then restore the original author notes even if a later
// assertion fails. Both versions are retained in editor history.
try {
  const changed=await put({version:after.version,record:{notes:`${original.record.notes || ''}\nLocal editor integration check (temporary).`}})
  assert.equal(changed.status,200,JSON.stringify(await changed.json()))
  const current=await (await fetch(url)).json()
  assert.notEqual(current.version,original.version)
  assert.equal((await put({version:original.version,record:original.record})).status,409)
  assert.equal((await (await fetch(`${origin}/data/events/event-0001.json`,{cache:'no-store'})).json()).notes,undefined,'private notes must not be published')
} finally {
  const current=await (await fetch(url)).json()
  const restored=await put({version:current.version,record:original.record})
  assert.equal(restored.status,200,JSON.stringify(await restored.json()))
}
assert.deepEqual(await (await fetch(url)).json(),original)
console.log('PASS: local read, origin rejection, conflicts, invalid fields, immutable IDs, backup, no-op and real saves, offline rebuild, and exact restore.')
