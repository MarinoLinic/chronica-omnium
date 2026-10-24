import { geographyOptions } from "../utils/geography";
export default function GeographyFilters({ records, value, onChange, className = "" }) {
  const options = geographyOptions(records, value);
  return <>
    <label>Continent <select className={className} aria-label="Continent" value={value.continent || ""} onChange={e => onChange({continent:e.target.value,country:"",place:""})}>
      <option value="">All continents</option>{options.continents.map(name => <option key={name}>{name}</option>)}
    </select></label>
    <label>Country <select className={className} aria-label="Country" value={value.country || ""} onChange={e => onChange({country:e.target.value,place:""})}>
      <option value="">All countries</option>{options.countries.map(([code,name]) => <option key={code} value={code}>{name}</option>)}
    </select></label>
    <label>Place / region <select className={className} aria-label="Place or region" value={value.place || ""} onChange={e => onChange({place:e.target.value})}>
      <option value="">All places</option>{options.places.map(([id,name]) => <option key={id} value={id}>{name}</option>)}
    </select></label>
  </>;
}
