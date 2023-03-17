import { Link } from 'react-router-dom'
import ArrowIcon from './ArrowIcon'

export const EventPrevious = ({ event }: any) => {
	return (
		<div className="flex justify-content-center fixed-half-v fixed-left">
			{event.id_num && (
				<Link to={`/${event.id_num - 1}`} className="arrow-icon">
					<ArrowIcon direction="left" />
				</Link>
			)}
		</div>
	)
}

export const EventNext = ({ event }: any) => {
	return (
		<div className="flex justify-content-center fixed-half-v fixed-right">
			{event.id_num && (
				<Link to={`/${event.id_num + 1}`} className="arrow-icon">
					<ArrowIcon direction="right" />
				</Link>
			)}
		</div>
	)
}
