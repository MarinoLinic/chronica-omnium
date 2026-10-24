export const WIKI = 'https://en.wikipedia.org/w/api.php'
export const COMMONS = 'https://commons.wikimedia.org/w/api.php'
export function wikipediaTitle(source) {
  try {
    const u = new URL(source)
    if (u.hostname !== 'en.wikipedia.org' || u.protocol !== 'https:') return null
    if (u.searchParams.has('oldid')) throw new Error('Pinned oldid source requires manual revision review; it will not be replaced with current text.')
    return u.pathname.startsWith('/wiki/') ? decodeURIComponent(u.pathname.slice(6)).replaceAll('_', ' ') : u.searchParams.get('title')
  } catch (e) { if (e.message.startsWith('Pinned')) throw e; return null }
}
export function commonsFilename(source) {
  try {
    const u = new URL(source)
    if (u.hostname !== 'upload.wikimedia.org' || !u.pathname.startsWith('/wikipedia/commons/')) return null
    const parts = u.pathname.split('/')
    return decodeURIComponent(parts[3] === 'thumb' ? parts[6] : parts[5])
  } catch { return null }
}
export const plain = text => String(text || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim()
export const reusableLicense = license => /^(CC BY(?:-SA)?(?: |$)|CC0(?: |$)|Public domain$|PD$)/i.test(license)
export function imageExtension(bytes) {
  if (bytes.length >= 12 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png'
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg'
  if (['GIF87a','GIF89a'].includes(bytes.subarray(0,6).toString())) return 'gif'
  if (bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP') return 'webp'
  return null
}
async function retry(operation, { attempts = 3, sleep = ms => new Promise(resolve => setTimeout(resolve,ms)) } = {}) {
  for (let n = 0; n < attempts; n++) {
    try { return await operation() } catch (error) {
      if (!error.transient || n === attempts - 1 || error.retryAfter > 60000) throw error
      await sleep(Math.max(error.retryAfter || 0, 1000 * 2 ** n))
    }
  }
}
export function apiUrl(endpoint, params) {
  const u = new URL(endpoint)
  u.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', maxlag: '5', ...params })
  return u.href
}
async function requestOnce(url, { fetcher = fetch, maxBytes = 4 * 1024 * 1024, userAgent = process.env.CHRONICA_USER_AGENT || 'ChronicaOmnium/2.0 (local research catalog; https://linic.net)' } = {}) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || !['en.wikipedia.org','commons.wikimedia.org','upload.wikimedia.org','thumb.wikimedia.org'].includes(parsed.hostname)) throw new Error('Source host is not allowed')
  // Manual redirects prevent a remote response from sending requests elsewhere.
  const response = await fetcher(url, { headers: { 'User-Agent': userAgent }, signal: AbortSignal.timeout(20000), redirect: 'error' })
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} ${response.statusText}`)
    error.transient = [429,502,503,504].includes(response.status)
    const after = response.headers.get('retry-after')
    error.retryAfter = after ? Math.max(0, /^\d+$/.test(after) ? Number(after)*1000 : Date.parse(after)-Date.now()) : 0
    await response.body?.cancel().catch(() => {})
    throw error
  }
  if (Number(response.headers.get('content-length')) > maxBytes) throw new Error('Response exceeds size limit')
  let size = 0
  const chunks = []
  for await (const chunk of response.body) {
    size += chunk.length
    if (size > maxBytes) { await response.body.cancel?.().catch(() => {}); throw new Error('Response exceeds size limit') }
    chunks.push(chunk)
  }
  return { bytes: Buffer.concat(chunks), type: response.headers.get('content-type') || '' }
}
export async function request(url, options = {}) { return retry(() => requestOnce(url, options), options) }
export async function api(endpoint, params, options) {
  return retry(async () => {
  const { bytes } = await requestOnce(apiUrl(endpoint, params), options)
  const data = JSON.parse(bytes)
  if (data.error) { const error = new Error(`${data.error.code}: ${data.error.info}`); error.transient = ['maxlag','ratelimited','readonly'].includes(data.error.code); throw error }
  const page = data.query?.pages?.[0]
  if (!page || page.missing || page.invalid) throw new Error('Wikipedia page or file is missing')
  return page
  }, options)
}
