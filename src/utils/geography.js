export const continents = ["Africa", "Antarctica", "Asia", "Europe", "North America", "Oceania", "South America"];
export function matchesGeography(record, { continent = "", country = "", place = "" } = {}) {
  if (!continent && !country && !place) return true;
  return (record.geography || []).some(p =>
    (!continent || p.continents.includes(continent)) &&
    (!country || p.countryCodes.includes(country)) && (!place || p.id === place));
}
export function geographyOptions(records, selection = {}) {
  const entries = records.flatMap(r => r.geography || []);
  const countries = new Map(), places = new Map();
  for (const p of entries) {
    if (selection.continent && !p.continents.includes(selection.continent)) continue;
    p.countryCodes.forEach((code, i) => countries.set(code, p.countryNames[i]));
    if (!selection.country || p.countryCodes.includes(selection.country)) places.set(p.id, p.label);
  }
  const sort = values => [...values].sort((a,b) => a[1].localeCompare(b[1]));
  return { continents: [...new Set(entries.flatMap(p => p.continents))].sort(), countries: sort(countries), places: sort(places) };
}
