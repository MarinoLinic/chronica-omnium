const numbers = (values, length) => Array.isArray(values) && values.length === length && values.every(v => typeof v === 'number' && Number.isFinite(v))
export function parseCoordinates(info) {
  const c = info?.coordinates
  return info?.reviewed === true && numbers(c,2) && Math.abs(c[0]) <= 90 && Math.abs(c[1]) <= 180 ? c : null
}
export function parseBounds(info) {
  const b = info?.boundingbox
  if (info?.reviewed !== true || !numbers(b,4)) return null
  const [south,north,west,east] = b
  if (Math.abs(south)>90 || Math.abs(north)>90 || Math.abs(west)>180 || Math.abs(east)>180 || south>=north || west>=east) return null
  return [[south,west],[north,east]]
}
export const canShowMap = info => Boolean(parseCoordinates(info) || parseBounds(info))
