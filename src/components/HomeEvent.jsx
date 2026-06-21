import { Link } from 'react-router-dom'

const HomeEvent = ({ data }) => {
	return (
		<div className="grid grid-cols-1 items-center gap-3 py-6 md:grid-cols-[1fr_2fr_1fr] md:gap-6">
			<section className="order-2 text-center text-sm md:order-1 md:text-right">
				<div className="font-semibold text-[#5f1212]">
					{data.time_start}
					{data.time_end && ` – ${data.time_end}`}
				</div>
				{data.location && <div className="mt-1 text-slate-500">{data.location}</div>}
				{data.type && data.type !== 'Uncategorized' && (
					<div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{data.type}</div>
				)}
			</section>

			<section className="order-1 text-center md:order-2">
				<Link to={`/${data.id_num}`} className="group">
					<p className="text-xl font-bold blue transition group-hover:text-[#3a4da3]">{data.name}</p>
				</Link>
				{data.short_desc && <p className="mx-auto mt-1 max-w-prose text-sm font-light text-slate-600">{data.short_desc}</p>}
				<Link
					to={`/${data.id_num}`}
					className="mt-2 inline-block text-xs font-medium text-[#21306a] hover:underline"
				>
					Read more →
				</Link>
			</section>

			<section className="order-3 flex justify-center md:justify-start">
				{data.image && (
					<Link to={`/${data.id_num}`} className="block w-1/2 md:w-full">
						<img
							src={data.img_sm ? data.img_sm : data.image}
							alt={data.name}
							loading="lazy"
							className="w-full rounded-lg object-cover shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
						/>
					</Link>
				)}
			</section>
		</div>
	)
}

export default HomeEvent
