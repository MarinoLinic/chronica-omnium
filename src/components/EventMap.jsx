import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { parseCoordinates, parseBounds } from '../utils/coordinates'
export { parseCoordinates, canShowMap } from '../utils/coordinates'

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

// Returns the larger of the bbox's lat/lon spans in degrees (a rough proxy for
// how precise the geocode is: a building is tiny, a country is huge).
function boundsSpanDegrees(bounds) {
	if (!bounds) return null
	const latSpan = Math.abs(bounds[1][0] - bounds[0][0])
	const lonSpan = Math.abs(bounds[1][1] - bounds[0][1])
	return Math.max(latSpan, lonSpan)
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
