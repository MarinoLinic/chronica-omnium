import { Link } from 'react-router-dom'

const HomeEvent = ({ data }) => {
	return (
		<div className="margin-y grid md:grid-cols-3 gap-2 items-center bg-black md:bg-opacity-[1%] bg-opacity-[10%]">
			<section className="text-sm md:flex-col">
				<div className="mt-4 red font-semibold flex items-center md:justify-end justify-center">
					{data.time_start}
					{data.time_end && ` - ${data.time_end}`}
				</div>
				<div className="mt-2 gray flex items-center md:justify-end justify-center">{data.location}</div>
				<div className="mb-4 text-gray-400 mt-2 flex items-center md:justify-end justify-center">{data.type}</div>
			</section>

			<section className="flex-col text-center md:px-36">
				<p className="mt-4 font-bold text-xl blue">{data.name}</p>
				<p className="text-sm font-light blue">{data.short_desc}</p>
				<p className="mb-4">
					{data.id_num && (
						<Link to={`/${data.id_num}`} className="text-xs text-blue-500 hover:text-blue-400">
							Read more
						</Link>
					)}
				</p>
			</section>

			<section className="">
				{data.image && (
					<img src={data.img_sm ? data.img_sm : data.image} alt="image" className="md:w-[25%] w-[100%] rounded-lg" />
				)}
			</section>
		</div>
	)
}

export default HomeEvent
