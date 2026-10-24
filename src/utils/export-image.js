export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export async function exportTimeline(svg, format) {
  const standalone = svg.cloneNode(true), theme = getComputedStyle(svg)
  // Keep the shared reader colours when an SVG is opened without the site's CSS.
  for (const token of ['--age-earth','--age-tools','--age-human','--ink','--muted','--line']) {
    const value = theme.getPropertyValue(token).trim()
    if (value) standalone.style.setProperty(token,value)
  }
  const source = new XMLSerializer().serializeToString(standalone)
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  if (format === 'svg') { downloadBlob(blob, 'chronica-timeline.svg'); return blob }
  const url = URL.createObjectURL(blob)
  try {
    const picture = new Image()
    picture.src = url
    await picture.decode()
    const width = svg.viewBox.baseVal.width, height = svg.viewBox.baseVal.height
    // Bound both dimension and area; a giant vertical chart must not exhaust memory.
    const scale = Math.min(2, 4096 / width, 4096 / height, Math.sqrt(16e6 / (width * height)))
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(width * scale); canvas.height = Math.ceil(height * scale)
    const context = canvas.getContext('2d'); if (!context) throw new Error('Image export is unavailable in this browser.')
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(picture, 0, 0, canvas.width, canvas.height)
    const png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!png) throw new Error('PNG export failed. Try SVG or a smaller date range.')
    downloadBlob(png, 'chronica-timeline.png')
    return png
  } finally { URL.revokeObjectURL(url) }
}
