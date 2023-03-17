import data from '../src/resources/World_History.json'
import { useParams } from 'react-router-dom'
import EventDisplay from './EventDisplay'
import TimelineChart from './TimelineChart'
import EventMap from './EventMap'
import { EventPrevious, EventNext } from './EventToggle'
import { Link } from 'react-router-dom'

const EventDetail = () => {
	let { eventId } = useParams()

	let eventIdInt = parseInt(eventId)

	const event = data.find((item) => item.id_num === eventIdInt)

	if (!event) {
		return <div>Event not found.</div>
	}

	// const window_width = 50
	// className={`max-w-[${window_width}px]`}
	let charts = 0

	return (
		<div className="grid-temp grid-column-3 page-without-scrollbar">
			<section>
				<EventPrevious event={event} />
			</section>

			<section>
				<div className="fixed-half-v fixed-chart-1">
					<TimelineChart
						data={data}
						rangestart={event.start - 100}
						rangeend={event.start + 100 > event.curr_year ? event.curr_year : event.start + 100}
						type={'Unit'}
						title={'Units'}
					/>
				</div>

				<div className="fixed-half-v fixed-chart-2">
					<TimelineChart
						data={data}
						rangestart={event.start - 30}
						rangeend={event.start + 70 > event.curr_year ? event.curr_year : event.start + 70}
						type={'Person'}
						title={'People'}
					/>
				</div>

				<div className="fixed-half-v fixed-chart-3">
					<TimelineChart
						data={data}
						rangestart={event.start - 10}
						rangeend={event.start + 50 > event.curr_year ? event.curr_year : event.start + 30}
						type={'Event'}
						title={'Random Events'}
					/>
				</div>

				<div className="fixed-half-v fixed-chart-4">
					{event.location_info && <EventMap locationInfo={event.location_info} />}
				</div>
			</section>

			<section className="container">
				<EventDisplay event={event} />
			</section>

			<section>
				<EventNext event={event} />
			</section>
		</div>
	)
}

export default EventDetail
