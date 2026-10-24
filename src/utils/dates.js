// Historical signed years: -1 is 1 BCE, +1 is 1 CE. Never store year zero.
export const ordinalYear = year => year < 0 ? year + 1 : year
export const historicalYear = ordinal => ordinal <= 0 ? ordinal - 1 : ordinal
export const elapsedYears = (start, end) => ordinalYear(end) - ordinalYear(start)
export function formatYear(year) {
  if (!Number.isFinite(year)) return 'Undated'
  const n = Math.abs(year)
  const scaled = n >= 1e9 ? `${Number((n / 1e9).toPrecision(5))} billion` : n >= 1e6 ? `${Number((n / 1e6).toPrecision(5))} million` : n.toLocaleString('en-US')
  return `${scaled} ${year < 0 ? 'BCE' : 'CE'}`
}
export const formatRange = r => r.start === null ? 'Date not yet added' : `${formatYear(r.start)}${r.date_kind === 'ongoing' ? ' – ongoing' : r.end !== null ? ` – ${formatYear(r.end)}` : ''}${r.date_kind === 'uncertain' ? ' (uncertain bounds)' : ''}`
