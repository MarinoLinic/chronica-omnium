import data from '../src/resources/World_History.json'
import { useParams } from 'react-router-dom'
import EventDisplay from './EventDisplay'
import TimelineChart from './TimelineChart'

const EventDetail = () => {
	let { eventId } = useParams()
	eventId = parseInt(eventId)

	const event = data.find((item) => item.id_num === eventId)

	if (!event) {
		return <div>Event not found.</div>
	}

	return (
		<>
			<TimelineChart
				data={data}
				rangestart={event.start - 100}
				rangeend={event.start + 100 > event.curr_year ? event.curr_year : event.start + 100}
				type={'Unit'}
				title={'Units'}
			/>
			<TimelineChart
				data={data}
				rangestart={event.start - 30}
				rangeend={event.start + 70 > event.curr_year ? event.curr_year : event.start + 70}
				type={'Person'}
				title={'People'}
			/>
			<TimelineChart
				data={data}
				rangestart={event.start - 10}
				rangeend={event.start + 50 > event.curr_year ? event.curr_year : event.start + 30}
				type={'Event'}
				title={'Random Events'}
			/>

			<EventDisplay event={event} />
		</>
	)
}

export default EventDetail
