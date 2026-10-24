import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { at, hash } from '../scripts/lib/catalog.mjs'
import { buildData } from '../scripts/build-data.mjs'
import { withCatalogLock } from '../scripts/lib/lock.mjs'

async function fingerprints(directory) {
  const result={}
  for(const item of await readdir(directory,{withFileTypes:true})) {
    const file=path.join(directory,item.name)
    if(item.isDirectory())Object.assign(result,await fingerprints(file))
    else result[path.relative(at(),file)]=hash(await readFile(file))
  }
  return result
}
test('data builds are offline and byte-reproducible, including public detail and reports',async()=>{
  const previous=globalThis.fetch
  globalThis.fetch=()=>{throw new Error('Offline build tried to use the network')}
  try {
    await withCatalogLock('reproducibility test',async()=>{
      await buildData()
      const before={...await fingerprints(at('public/data')),...await fingerprints(at('src/generated')),...await fingerprints(at('data/reports'))}
      await buildData()
      assert.deepEqual({...await fingerprints(at('public/data')),...await fingerprints(at('src/generated')),...await fingerprints(at('data/reports'))},before)
    })
  } finally {globalThis.fetch=previous}
})
