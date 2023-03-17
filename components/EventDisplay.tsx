const EventDisplay = ({ event }: any) => {
	return (
		<>
			<section className="my-4 grid-cols-3 gap-2 items-center">
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
					<div className="text-sm font-light text-gray-200">
						{event.wiki &&
							event.wiki.split('\n').map((line, index) => (
								<>
									<p className="my-4" key={index}>
										{line}
									</p>
								</>
							))}
					</div>
				</div>

				<div className="">
					{event.image && <img src={event.image} alt="image" width="100%" className="rounded-lg bg-slate-100" />}
				</div>
			</section>
		</>
	)
}

export default EventDisplay
