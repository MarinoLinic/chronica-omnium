import data from '../src/resources/World_History.json'
import { useParams } from 'react-router-dom'
import EventDisplay from './EventDisplay'
import TimelineChart from './TimelineChart'
import EventMap from './EventMap'
import EventToggle from './EventToggle'
import { Link } from 'react-router-dom'

const EventDetail = () => {
	let { eventId } = useParams()
	eventId = parseInt(eventId)

	const event = data.find((item) => item.id_num === eventId)

	if (!event) {
		return <div>Event not found.</div>
	}

	// const window_width = 50
	// className={`max-w-[${window_width}px]`}
	let close = 0

	return (
		<div className="container">
			<EventToggle event={event} />

			{close == 1 && (
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
				</>
			)}

			<EventDisplay event={event} />

			{/* <EventMap locationInfo={event.location_info} /> */}

			<EventToggle event={event} />
		</div>
	)
}

export default EventDetail
