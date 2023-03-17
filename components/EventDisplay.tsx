const EventDisplay = ({ event }: any) => {
	return (
		<>
			<section className="center">
				<h1>{event.name}</h1>
				<div className="flex-row margin-y flex-center">
					<h1 className="blue">
						{event.start}
						{event.end && ` - ${event.end}`}
					</h1>
					{event.end && event.range_type === null && <h3 className="gray padding-x">({event.duration} years)</h3>}
				</div>

				<div className="margin-y blue">
					<p>
						{`${event.time_bp_start.toLocaleString()}`}
						{event.time_bp_end !== null && event.time_bp_end !== 0 && ` - ` + `${event.time_bp_end.toLocaleString()}`}
						{event.time_bp_end === 0 ? ` years ago - ` + `present` : ` years ago`}
					</p>
					{event.generations !== null && event.generations > 1 && (
						<p>{event.generations.toLocaleString()} generations ago</p>
					)}
				</div>

				<div className="center">
					<h3 className="font-normal margin-y">{event.short_desc}</h3>
				</div>

				<div className="parent-image">
					{event.image && <img src={event.image} alt="image" className="detail-image" />}
				</div>

				<div className="margin-y blue">
					<p>Field: {event.field}</p>
					<p>Type: {event.type}</p>
					{event.anthropologic && <p>Anthropologic period: {event.anthropologic}</p>}
					{event.archeological && <p>Archeological period: {event.archeological}</p>}
					{event.geologic_eon && <p>Geologic eon: {event.geologic_eon}</p>}
					{event.geologic_epoch && <p>Geologic epoch: {event.geologic_epoch}</p>}
					{event.geologic_era && <p>Geologic era: {event.geologic_era}</p>}
					{event.geologic_period && <p>Geologic period: {event.geologic_period}</p>}
				</div>
			</section>

			<br />

			<section>
				{event.wiki && (
					<>
						<h2>
							From{' '}
							<a className="hypertext-underline" href={event.source}>
								Wikipedia
							</a>
							:
						</h2>

						{event.wiki.split('\n').map((line: any, index: any) => (
							<p className="margin-y text-sm font-normal" key={index}>
								{line}
							</p>
						))}
					</>
				)}
			</section>
		</>
	)
}

export default EventDisplay
