import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { at, loadCatalog, loadReferences, recordFile, hash, writeJson, audit, newRecord, eventKeys } from './lib/catalog.mjs'
import { buildData } from './build-data.mjs'
import { withCatalogLock } from './lib/lock.mjs'
const editable = eventKeys.filter(k => !['schemaVersion','id','id_num','legacy','slug'].includes(k))
const loopback = address => ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(address)
export function localEditor() {
  return {
    name: 'chronica-local-editor',
    configureServer(server) {
      server.middlewares.use('/_local/catalog', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        const send = (status, value) => { res.statusCode = status; res.end(JSON.stringify(value)) }
        try {
          const host = new URL(`http://${req.headers.host}`)
          if (!loopback(req.socket.remoteAddress) || !['localhost','127.0.0.1','[::1]'].includes(host.hostname)) return send(403, { error: 'Local editor accepts loopback requests only.' })
          const id = req.url.split('?')[0].replace(/^\//, '')
          if (req.method === 'GET') {
            const refs = await loadReferences()
            if (!id) return send(200, { records: (await loadCatalog()).map(e => e.record), places: refs.places.places })
            const raw = await readFile(recordFile(id), 'utf8')
            return send(200, { record: JSON.parse(raw), version: hash(raw) })
          }
          if (!['PUT','POST'].includes(req.method)) return send(405, { error: 'Use GET, PUT, or POST.' })
          // The browser must be on this exact local origin; no cross-site writes.
          if (req.headers.origin !== `http://${req.headers.host}` || !req.headers['content-type']?.startsWith('application/json')) return send(403, { error: 'Same-origin JSON request required.' })
          await withCatalogLock('local editor save', async () => {
            let body = ''
            let bytes = 0
            for await (const chunk of req) { bytes += chunk.length; if (bytes > 1024 * 1024) return send(413, { error: 'Record exceeds 1 MB.' }); body += chunk }
            const payload = JSON.parse(body)
            if (req.method === 'POST') {
              if (id || (payload.name !== null && typeof payload.name !== 'string')) return send(400, {error:'Create accepts a title or null at the collection URL.'})
              const entries = await loadCatalog(), refs = await loadReferences(), record = newRecord(entries, payload.name?.trim() || null)
              const report = audit([...entries,{file:`${record.id}.json`,record}],refs)
              if (report.errors.length) return send(422,{error:report.errors.map(e=>`${e.id}: ${e.message}`).join('\n')})
              await writeJson(recordFile(record.id),record)
              try { await buildData() } catch (error) { return send(500,{error:`Created ${record.id}, but rebuild failed: ${error.message}. Reload the catalog; do not create it again.`}) }
              server.moduleGraph.invalidateAll()
              return send(201,{record,version:hash(await readFile(recordFile(record.id),'utf8'))})
            }
            if (!payload.record || typeof payload.record !== 'object' || Array.isArray(payload.record)) return send(400,{error:'record must be an object.'})
            for (const key of Object.keys(payload.record)) if (!eventKeys.includes(key)) return send(422,{error:`Unknown field ${key}.`})
            const target = recordFile(id)
            const raw = await readFile(target, 'utf8')
            if (payload.version !== hash(raw)) return send(409, { error: 'This record changed on disk. Reload it before saving.' })
            const original = JSON.parse(raw)
            for (const key of ['schemaVersion','id','id_num','legacy','slug']) if (Object.hasOwn(payload.record,key) && JSON.stringify(payload.record[key]) !== JSON.stringify(original[key])) return send(422,{error:`${key} is preserved and cannot be changed by the editor.`})
            const record = { ...original, ...Object.fromEntries(editable.filter(k => Object.hasOwn(payload.record, k)).map(k => [k, payload.record[k]])) }
            const entries = await loadCatalog(), refs = await loadReferences()
            const report = audit(entries.map(e => e.record.id === id ? { ...e, record } : e), refs)
            if (report.errors.length) return send(422, { error: report.errors.map(e => `${e.id}: ${e.message}`).join('\n') })
            const backup = at('.local/history', id, `${Date.now()}-${hash(raw).slice(0, 12)}.json`)
            await mkdir(at('.local/history', id), { recursive: true })
            await writeFile(backup, raw, { flag: 'wx' })
            await writeJson(target, record)
            try { await buildData() }
            catch (error) { return send(500, { error: `Record saved and backed up, but data build failed: ${error.message}`, version:hash(await readFile(target,'utf8')) }) }
            server.moduleGraph.invalidateAll()
            return send(200, { saved: true, backup, version: hash(await readFile(target, 'utf8')) })
          })
        } catch (error) { send(error.code === 'CATALOG_BUSY' ? 409 : error.code === 'ENOENT' ? 404 : 400, { error: error.message }) }
      })
    },
  }
}
