import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function EventMap({ locationInfo }: any) {
	let coordinates = locationInfo.coordinates
	console.log(coordinates)
	const position = [51.505, -0.09]

	return (
		<>
			<MapContainer center={coordinates} zoom={1} scrollWheelZoom={false}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={coordinates}>
					<Popup>{locationInfo.display_name}</Popup>
				</Marker>
			</MapContainer>
		</>
	)
}

export default EventMap
