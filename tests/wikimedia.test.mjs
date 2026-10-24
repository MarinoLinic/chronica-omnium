import test from 'node:test'
import assert from 'node:assert/strict'
import { wikipediaTitle, commonsFilename, request, api, reusableLicense, imageExtension } from '../scripts/lib/wikimedia.mjs'
test('source parsing handles encoded titles and rejects unrelated or pinned pages', () => {
  assert.equal(wikipediaTitle('https://en.wikipedia.org/wiki/Thirty_Years%27_War#Lead'),"Thirty Years' War")
  assert.equal(wikipediaTitle('https://en.wikipedia.org/w/index.php?title=Big_Bang'),'Big_Bang')
  assert.equal(wikipediaTitle('https://en.wikipedia.org.evil.test/wiki/Title'),null)
  assert.throws(()=>wikipediaTitle('https://en.wikipedia.org/w/index.php?title=A&oldid=2'),/Pinned/)
  assert.equal(commonsFilename('https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/A%20file.svg/640px-A_file.svg.png'),'A file.svg')
  assert.equal(commonsFilename('https://upload.wikimedia.org/wikipedia/commons/a/ab/Test.jpg'),'Test.jpg')
})
test('only documented reusable licenses are automatically cached', () => {
  for(const s of ['CC BY-SA 4.0','CC BY 3.0','CC0','Public domain']) assert.ok(reusableLicense(s))
  for(const s of ['Fair use','CC BY-NC 4.0','unknown','']) assert.equal(reusableLicense(s),false)
})
test('network failures, empty API pages, hosts, and size limits are handled', async () => {
  await assert.rejects(request('https://evil.test/x'),/host/)
  await assert.rejects(request('https://en.wikipedia.org/x',{sleep:async()=>{},fetcher:async()=>new Response('oops',{status:503})}),/503/)
  await assert.rejects(request('https://en.wikipedia.org/x',{maxBytes:2,fetcher:async()=>new Response('too large')}),/size/)
  await assert.rejects(api('https://en.wikipedia.org/w/api.php',{}, {fetcher:async()=>new Response(JSON.stringify({query:{pages:[{missing:true}]}}))}),/missing/)
  const page=await api('https://en.wikipedia.org/w/api.php',{}, {fetcher:async()=>new Response(JSON.stringify({query:{pages:[{title:'A',extract:'Text',revisions:[{revid:123}]}]}}))})
  assert.equal(page.revisions[0].revid,123)
})
test('transient status and maxlag retries are bounded and respect Retry-After',async()=>{
  const waits=[]; let calls=0
  const result=await request('https://en.wikipedia.org/x',{sleep:async n=>waits.push(n),fetcher:async()=>++calls===1?new Response('slow',{status:429,headers:{'Retry-After':'4'}}):new Response('okay')})
  assert.equal(result.bytes.toString(),'okay'); assert.deepEqual(waits,[4000])
  calls=0
  await assert.rejects(api('https://en.wikipedia.org/w/api.php',{}, {sleep:async()=>{},fetcher:async()=>{calls++;return new Response(JSON.stringify({error:{code:'maxlag',info:'busy'}}))}}),/maxlag/)
  assert.equal(calls,3)
  calls=0
  await assert.rejects(request('https://en.wikipedia.org/x',{sleep:async()=>assert.fail('must leave long cooldown to user'),fetcher:async()=>{calls++;return new Response('',{status:503,headers:{'Retry-After':'120'}})}}),/503/)
  assert.equal(calls,1)
})
test('image signatures reject an HTML error with an image MIME label',()=>{
  assert.equal(imageExtension(Buffer.from('<html>Error</html>')),null)
  assert.equal(imageExtension(Buffer.from([255,216,255,1])),'jpg')
  assert.equal(imageExtension(Buffer.from('GIF89a123456')),'gif')
  assert.equal(imageExtension(Buffer.from('RIFF1234WEBP')),'webp')
})
