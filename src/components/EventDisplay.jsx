import { useState } from 'react'

// Separate component so React resets `visible` state on navigation via key={event.id_num}.
// This avoids the useEffect race condition where onLoad fires before the effect resets state.
function EventImage({ src, alt }) {
	const [visible, setVisible] = useState(false)
	const [broken, setBroken] = useState(false)
	if (broken) return null
	return (
		<div className="mt-6 flex justify-center">
			<a href={src} target="_blank" rel="noopener noreferrer" className="group">
				<img
					src={src}
					alt={alt}
					onLoad={() => setVisible(true)}
					onError={() => setBroken(true)}
					className={`max-h-[420px] w-auto rounded-xl shadow-md ring-1 ring-slate-200 transition-opacity duration-300 group-hover:shadow-lg ${visible ? 'opacity-100' : 'opacity-0'}`}
				/>
			</a>
		</div>
	)
}

const EventDisplay = ({ event, showWiki = true }) => {
	const tags = [event.type, event.field].filter((t) => t && t !== 'Uncategorized')

	return (
		<article className="mx-auto w-full max-w-3xl px-4">
			<header className="text-center">
				<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{event.name}</h1>

				<div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
					<span className="text-xl sm:text-2xl font-bold blue">
						{event.time_start}
						{event.time_end && ` – ${event.time_end}`}
					</span>
					{event.end && event.range_type === null && (
						<span className="text-sm text-slate-500">({event.duration} years)</span>
					)}
				</div>

				<div className="mt-2 space-y-0.5 text-sm text-slate-500">
					{event.time_bp_start != null && (
						<p>
							{`${event.time_bp_start.toLocaleString()}`}
							{event.time_bp_end !== null && event.time_bp_end !== 0 && ` – ${event.time_bp_end.toLocaleString()}`}
							{event.time_bp_end === 0 ? ` years ago – present` : ` years ago`}
						</p>
					)}
					{event.generations_start !== null && event.generations_start > 1 && (
						<p>{event.generations_start.toLocaleString()} generations ago</p>
					)}
					{event.location !== null && <p>{event.location}</p>}
				</div>

				{tags.length > 0 && (
					<div className="mt-3 flex flex-wrap items-center justify-center gap-2">
						{tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
							>
								{tag}
							</span>
						))}
					</div>
				)}

				{event.short_desc && (
					<p className="mt-4 text-lg font-normal leading-relaxed text-slate-700">{event.short_desc}</p>
				)}

				{event.image && <EventImage key={event.id_num} src={event.image} alt={event.name} />}
			</header>

			{showWiki && event.wiki && (
				<section className="mt-10">
					<h2 className="text-xl font-bold text-slate-900">
						From{' '}
						<a className="hypertext-underline" href={event.source} target="_blank" rel="noopener noreferrer">
							Wikipedia
						</a>
					</h2>

					<div className="mt-4 space-y-4">
						{event.wiki
							.split('\n')
							.filter((line) => line.trim() !== '')
							.map((line, index) => (
								<p className="text-base font-normal leading-relaxed text-slate-700" key={index}>
									{line}
								</p>
							))}
					</div>
				</section>
			)}
		</article>
	)
}

export default EventDisplay
