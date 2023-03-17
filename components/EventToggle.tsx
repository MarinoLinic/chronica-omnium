import { Link } from 'react-router-dom'

const EventToggle = ({ event }: any) => {
	return (
		<div className="my-4 grid grid-cols-3 gap-2 items-center">
			<section>
				{event.id_num && (
					<Link to={`/${event.id_num - 1}`} className="text-xs text-blue-500 hover:text-blue-400">
						Previous event
					</Link>
				)}
			</section>

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
		</div>
	)
}

export default EventToggle
