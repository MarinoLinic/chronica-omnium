import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises'
import { at, loadCatalog, loadReferences, json, writeJson, hash } from './lib/catalog.mjs'
import { wikipediaTitle, commonsFilename, WIKI, COMMONS, api, request, plain, reusableLicense, imageExtension } from './lib/wikimedia.mjs'
import { withCatalogLock } from './lib/lock.mjs'
const args = process.argv.slice(2)
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : null
const ids = option('--id')?.split(',')
const limit = args.includes('--all') ? Infinity : Number(option('--limit') || 10)
if (!(limit > 0)) throw new Error('--limit must be positive')
const refresh = args.includes('--refresh'), images = args.includes('--images')
await withCatalogLock('source sync', async () => {
const entries = await loadCatalog(), refs = await loadReferences()
const selected = entries.filter(({ record: r }) => !ids || ids.includes(r.id) || ids.includes(String(r.id_num))).slice(0, limit)
if (ids && selected.length !== ids.length) throw new Error('One or more requested IDs were not found (or exceed --limit).')
const report = { startedAt: new Date().toISOString(), mode: { images, refresh, imagesOnly:args.includes('--images-only') }, selected:selected.length, completed:false, results: [] }
let downloaded = 0, failures = 0
const pause = () => new Promise(resolve => setTimeout(resolve, 1100))
async function backup(file, id) {
  try { await mkdir(at('.local/source-history', id), { recursive: true }); await copyFile(file, at('.local/source-history', id, `${Date.now()}.json`)) } catch (e) { if (e.code !== 'ENOENT') throw e }
}
for (const { record: r } of selected) {
  const result = { id: r.id, text: 'unchanged', image: 'unchanged' }
  const selectedImage=r.image || refs.enrichment?.[r.id]?.image?.original
  try {
    const file = at('data/content', `${r.id}.json`)
    let old = null
    try { old = await json(file) } catch (e) { if (e.code !== 'ENOENT') throw e }
    if (!args.includes('--images-only') && (refresh || !old || old.method === 'legacy-html-scrape')) {
      const title = wikipediaTitle(r.source)
      if (title) {
        await pause()
        const page = await api(WIKI, { titles: title, redirects: '1', prop: 'extracts|info|revisions', exintro: '1', explaintext: '1', inprop: 'url', rvprop: 'ids|timestamp' })
        if (!page.extract?.trim()) throw new Error('Empty extract; retained existing text')
        const revision = page.revisions?.[0]
        await backup(file, r.id)
        await writeJson(file, { schemaVersion: 1, eventId: r.id, title: page.title, source: page.fullurl || r.source, revisionId: revision?.revid || null, revisionTimestamp: revision?.timestamp || null, fetchedAt: new Date().toISOString(), method: 'mediawiki-intro-extract', license: 'CC BY-SA 4.0; see source page for attribution and revision history', status: 'review', text: page.extract })
        result.text = 'cached'
      } else result.text = 'not a supported Wikipedia source'
    }
  } catch (error) { result.text = 'failed'; result.textError = error.message }
  try {
    if (images && selectedImage && (!refs.media.items[r.id]?.path || refs.media.items[r.id]?.original !== selectedImage || refresh)) {
      const filename = commonsFilename(selectedImage)
      if (!filename) result.image = 'external image retained; local import needs manual attribution'
      else {
        await pause()
        const page = await api(COMMONS, { titles: `File:${filename}`, prop: 'imageinfo', iiprop: 'url|extmetadata|mime', iiurlwidth: '640' })
        const info = page.imageinfo?.[0], meta = info?.extmetadata || {}
        const credit = { source: info?.descriptionurl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`, artist: plain(meta.Artist?.value), credit: plain(meta.Credit?.value), license: plain(meta.LicenseShortName?.value), licenseUrl: plain(meta.LicenseUrl?.value), attribution: plain(meta.Attribution?.value) }
        if (!reusableLicense(credit.license)) throw new Error(`Image license requires manual review: ${credit.license || 'unknown'}`)
        const remote = info.thumburl || info.url
        await pause()
        const asset = await request(remote, { maxBytes: 4 * 1024 * 1024 })
        const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[asset.type.split(';')[0]]
        if (!extension) throw new Error(`Unsupported image format ${asset.type}; retained remote image`)
        if (imageExtension(asset.bytes) !== extension) throw new Error('Image byte signature does not match its MIME type; retained existing image')
        if (downloaded + asset.bytes.length > 80 * 1024 * 1024) throw new Error('80 MB download budget reached; rerun to resume')
        const sha256 = hash(asset.bytes), relative = `/media/${sha256}.${extension}`
        await mkdir(at('public/media'), { recursive: true })
        await writeFile(at('public', relative.slice(1)), asset.bytes)
        refs.media.items[r.id] = { path: relative, sha256, bytes: asset.bytes.length, original: selectedImage, remoteThumbnail: remote, fetchedAt: new Date().toISOString(), credit }
        downloaded += asset.bytes.length
        await writeJson(at('data/media/manifest.json'), refs.media)
        result.image = 'cached'
      }
    }
  } catch (error) { result.image = 'failed'; result.imageError = error.message }
  const failed = result.textError || result.imageError
  failures = failed ? failures + 1 : 0
  report.results.push(result)
  await writeJson(at('data/reports/source-sync.json'), report)
  console.log(JSON.stringify(result))
  if (failures >= 3) { report.stoppedReason = 'three consecutive record failures'; console.error('Stopped after three consecutive failures. Existing content was retained.'); break }
}
report.completed = report.results.length === selected.length
report.finishedAt = new Date().toISOString()
report.downloadedBytes = downloaded
await writeJson(at('data/reports/source-sync.json'), report)
console.log(`Downloaded ${(downloaded / 1024 / 1024).toFixed(2)} MB. Run npm run data:build to publish the local snapshots.`)
if (report.results.some(r => r.textError || r.imageError)) process.exitCode = 1
})
