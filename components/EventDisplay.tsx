import { Link } from 'react-router-dom'

const EventDisplay = ({ event }: any) => {
	return (
		<>
			<section>
				{event.id_num && (
					<Link to={`/`} className="text-xs text-blue-500 hover:text-blue-400">
						Go back
					</Link>
				)}
			</section>
			<section>
				{event.id_num && (
					<Link to={`/${event.id_num + 1}`} className="text-xs text-blue-500 hover:text-blue-400">
						Next event
					</Link>
				)}
			</section>
			<section>
				{event.id_num && (
					<Link to={`/${event.id_num - 1}`} className="text-xs text-blue-500 hover:text-blue-400">
						Previous event
					</Link>
				)}
			</section>
			<section className="my-4 grid grid-cols-3 gap-2 items-center bg-black bg-opacity-[3%] hover:bg-opacity-[9%]">
				<div className="text-sm flex-col">
					<div className="mt-4 text-orange-300 font-semibold flex items-center justify-end">
						{event.start}
						{event.end && ` - ${event.end}`}
					</div>
					<div className="mt-2 text-gray-300 flex items-center justify-end">{event.location}</div>
					<div className="mb-4 text-gray-400 mt-2 flex items-center justify-end">{event.type}</div>
				</div>

				<div className="flex-col text-center px-36">
					<p className="mt-4 font-bold text-xl text-gray-300">{event.name}</p>
					<p className="text-sm font-light text-gray-200">{event.short_desc}</p>
					<p className="mb-4">
						{event.source && (
							<a className="text-xs text-blue-500 hover:text-blue-400" href={event.source}>
								External info / Source
							</a>
						)}
					</p>
				</div>

				<div className="">
					{event.image && <img src={event.image} alt="image" className="w-[100%] rounded-lg bg-slate-100" />}
				</div>
			</section>
		</>
	)
}

export default EventDisplay
