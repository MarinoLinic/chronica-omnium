import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix the default marker icon paths when bundling with Vite.
const DefaultIcon = L.icon({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
})

// Validate a [lat, lon] pair. Rejects nulls, NaNs, out-of-range values and the
// null-island (0,0) coordinate that usually signals a failed geocode.
export function parseCoordinates(locationInfo) {
	const coords = locationInfo?.coordinates
	if (!Array.isArray(coords) || coords.length !== 2) return null
	const lat = Number(coords[0])
	const lon = Number(coords[1])
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
	if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null
	if (lat === 0 && lon === 0) return null
	return [lat, lon]
}

// Nominatim bounding boxes are [south, north, west, east] (as strings).
// Convert to a Leaflet bounds object: [[south, west], [north, east]].
function parseBounds(locationInfo) {
	const bb = locationInfo?.boundingbox
	if (!Array.isArray(bb) || bb.length !== 4) return null
	const [south, north, west, east] = bb.map(Number)
	if ([south, north, west, east].some((v) => !Number.isFinite(v))) return null
	if (south > 90 || north > 90 || Math.abs(west) > 180 || Math.abs(east) > 180) return null
	return [
		[south, west],
		[north, east],
	]
}

// Returns the larger of the bbox's lat/lon spans in degrees (a rough proxy for
// how precise the geocode is: a building is tiny, a country is huge).
function boundsSpanDegrees(bounds) {
	if (!bounds) return null
	const latSpan = Math.abs(bounds[1][0] - bounds[0][0])
	const lonSpan = Math.abs(bounds[1][1] - bounds[0][1])
	return Math.max(latSpan, lonSpan)
}

// Returns true only when locationInfo carries usable coordinates or a bounding box.
// Use this to decide whether to render the map card at all.
export function canShowMap(locationInfo) {
	if (!locationInfo) return false
	return !!(parseCoordinates(locationInfo) || parseBounds(locationInfo))
}

// Imperatively fit the view whenever the target location changes. Using the
// geocoder's bounding box means the zoom level always matches the precision of
// the match (a city zooms further out than a single address).
function FitView({ bounds, center }) {
	const map = useMap()
	useEffect(() => {
		if (bounds) {
			map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 })
		} else if (center) {
			map.setView(center, 6)
		}
		// Leaflet sometimes needs a nudge after layout settles in a flex card.
		const t = setTimeout(() => map.invalidateSize(), 200)
		return () => clearTimeout(t)
	}, [map, bounds, center])
	return null
}

function EventMap({ locationInfo }) {
	const center = parseCoordinates(locationInfo)
	const bounds = parseBounds(locationInfo)

	if (!center && !bounds) {
		return (
			<div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
				Location data unavailable or imprecise.
			</div>
		)
	}

	const span = boundsSpanDegrees(bounds)
	// A small bounding box (< ~25km) means a precise point worth pinning.
	// Anything larger (a city, region or country) is shown by fitting the view
	// to its extent rather than dropping a misleading pin.
	const isPrecise = center && (span == null || span <= 0.25)
	const initialCenter = center || [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]

	return (
		<MapContainer
			center={initialCenter}
			zoom={4}
			scrollWheelZoom={false}
			style={{ width: '100%', height: '100%' }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{isPrecise && (
				<Marker position={center} icon={DefaultIcon}>
					<Popup>{locationInfo.display_name}</Popup>
				</Marker>
			)}

			<FitView bounds={bounds} center={center} />
		</MapContainer>
	)
}

export default EventMap
