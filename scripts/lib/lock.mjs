import { open, readFile, unlink, rename, mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { at } from './catalog.mjs'

// Every repository writer, including Vite's complete production build, shares
// this lock. Never steal it from a live process, even after a long source sync.
export async function withCatalogLock(label, action, file = at('.local/catalog.lock')) {
  await mkdir(path.dirname(file), { recursive: true })
  let handle
  for (let attempt = 0; attempt < 2; attempt++) {
    try { handle = await open(file, 'wx'); break } catch (error) {
      if (error.code !== 'EEXIST') throw error
      let owner
      try { owner = JSON.parse(await readFile(file, 'utf8')) } catch { /* An owner may still be writing the lock. */ }
      let alive = true
      if (Number.isSafeInteger(owner?.pid) && owner.pid > 0) {
        try { process.kill(owner.pid, 0) } catch (e) { alive = e.code !== 'ESRCH' }
      }
      if (alive || attempt) {
        const busy = new Error(`Catalog is busy${owner?.label ? ` (${owner.label}, PID ${owner.pid})` : ''}. Retry when that command finishes. Lock: ${file}`)
        busy.code = 'CATALOG_BUSY'; throw busy
      }
      // Retain abandoned lock evidence instead of removing user material.
      try { await rename(file, `${file}.abandoned-${randomUUID()}`) } catch (e) { if (e.code !== 'ENOENT') throw e }
    }
  }
  try {
    await handle.writeFile(JSON.stringify({ pid: process.pid, label, startedAt: new Date().toISOString() }))
    return await action()
  } finally {
    await handle.close()
    await unlink(file) // Only this process's transient lock, never catalog data.
  }
}
