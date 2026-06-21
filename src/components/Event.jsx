import data from '../resources/World_History.json'
import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import EventDisplay from './EventDisplay'
import TimelineChart from './TimelineChart'
import EventMap, { canShowMap } from './EventMap'

// Only show the surrounding "In context" timelines for events recent enough to
// have meaningful neighbours. Before the Holocene (~10,000 BCE) the dataset is
// sparse (geological/evolutionary events), so the charts would be empty.
const CONTEXT_MIN_START = -10000

// Locations that describe the whole world or have no meaningful point to pin.
const GLOBAL_LOCATION = /^(world|global|worldwide|earth|international|universal|everywhere)$/i

const ChartCard = ({ label, children }) => (
	<div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		<div className="border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{label}</div>
		<div className="h-[260px] w-full">{children}</div>
	</div>
)

const NavButton = ({ to, direction, disabled }) => {
	const base =
		'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ring-1 ring-slate-200'
	if (disabled) {
		return <span className={`${base} cursor-not-allowed text-slate-300`} aria-hidden="true" />
	}
	return (
		<Link
			to={to}
			className={`${base} text-slate-700 hover:bg-slate-50 hover:text-[#21306a]`}
			aria-label={direction === 'left' ? 'Previous event' : 'Next event'}
		>
			{direction === 'left' ? '← Previous' : 'Next →'}
		</Link>
	)
}

const Event = () => {
	const { eventId } = useParams()
	const eventIdInt = parseInt(eventId)
	const event = data.find((item) => item.id_num === eventIdInt)

	useEffect(() => {
		window.scrollTo({ top: 0 })
	}, [eventId])

	if (!event) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
				<h1 className="text-2xl font-bold text-slate-800">Event not found.</h1>
				<Link to="/" className="hypertext-underline blue">
					Back to all events
				</Link>
			</div>
		)
	}

	const maxId = data.reduce((m, i) => (i.id_num > m ? i.id_num : m), 0)

	const showContext = event.start >= CONTEXT_MIN_START
	const showMap =
		!!(event.location_info && event.location && !GLOBAL_LOCATION.test(event.location.trim()) && canShowMap(event.location_info))
	const hasVisuals = showContext || showMap

	return (
		<div className="min-h-screen bg-slate-50/40">
			<header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-[#21306a]"
					>
						All events
					</Link>
					<nav className="flex items-center gap-2">
						<NavButton to={`/${event.id_num - 1}`} direction="left" disabled={event.id_num <= 1} />
						<NavButton to={`/${event.id_num + 1}`} direction="right" disabled={event.id_num >= maxId} />
					</nav>
				</div>
			</header>

			<div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:flex lg:items-start lg:gap-8">
				<main className="min-w-0 flex-1">
					<EventDisplay event={event} />
				</main>

				{hasVisuals && (
					<aside className="mt-10 w-full shrink-0 space-y-4 lg:mt-0 lg:w-[340px] xl:w-[380px]">
						<div>
							<h2 className="text-lg font-bold text-slate-900">In context</h2>
							<p className="mt-0.5 text-sm text-slate-500">
								{showContext ? 'What else was happening around this time.' : 'Where this took place.'}
							</p>
						</div>
						{showContext && (
							<>
								<ChartCard label="Civilizations &amp; units">
									<TimelineChart
										data={data}
										rangestart={event.start - 100}
										rangeend={event.start + 100 > event.curr_year ? event.curr_year : event.start + 100}
										type={'Unit'}
										title={'Units'}
										markerYear={event.start}
									/>
								</ChartCard>
								<ChartCard label="Notable people">
									<TimelineChart
										data={data}
										rangestart={event.start - 30}
										rangeend={event.start + 70 > event.curr_year ? event.curr_year : event.start + 70}
										type={'Person'}
										title={'People'}
										markerYear={event.start}
									/>
								</ChartCard>
								<ChartCard label="Events">
									<TimelineChart
										data={data}
										rangestart={event.start - 10}
										rangeend={event.start + 50 > event.curr_year ? event.curr_year : event.start + 30}
										type={'Event'}
										title={'Events'}
										markerYear={event.start}
									/>
								</ChartCard>
							</>
						)}
						{showMap && (
							<ChartCard label="Location">
								<EventMap locationInfo={event.location_info} />
							</ChartCard>
						)}
					</aside>
				)}
			</div>
		</div>
	)
}

export default Event
