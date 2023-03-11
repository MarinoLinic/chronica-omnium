import data from '../src/resources/World_History.json'
import { useParams } from 'react-router-dom'
import EventDisplay from './EventDisplay'

const EventDetail = () => {
	let { eventId } = useParams()
	eventId = parseInt(eventId)

	const event = data.find((item) => item.id_num === eventId)

	if (!event) {
		return <div>Event not found.</div>
	}

	return (
		<>
			<EventDisplay event={event} />
		</>
	)
}

export default EventDetail
