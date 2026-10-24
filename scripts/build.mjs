import { build } from 'vite'
import { buildData } from './build-data.mjs'
import { withCatalogLock } from './lib/lock.mjs'

await withCatalogLock('production build', async () => {
  await buildData()
  await build()
})
