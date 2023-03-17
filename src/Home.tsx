import { Link } from 'react-router-dom'
import data from './resources/World_History.json'
import Title from '../components/Title'
import Border from '../components/Border'

function Home() {
	return (
		<div className="bg-[#27252F]">
			<Title />

			{data.map((data) => {
				return (
					<>
						<Border />

						<section className="my-4 grid grid-cols-3 gap-2 items-center bg-black bg-opacity-[3%] hover:bg-opacity-[9%]">
							<div className="text-sm flex-col">
								<div className="mt-4 text-orange-300 font-semibold flex items-center justify-end">
									{data.start}
									{data.end && ` - ${data.end}`}
								</div>
								<div className="mt-2 text-gray-300 flex items-center justify-end">{data.location}</div>
								<div className="mb-4 text-gray-400 mt-2 flex items-center justify-end">{data.type}</div>
							</div>

							<div className="flex-col text-center px-36">
								<p className="mt-4 font-bold text-xl text-gray-300">{data.name}</p>
								<p className="text-sm font-light text-gray-200">{data.short_desc}</p>
								<p className="mb-4">
									{data.id_num && (
										<Link to={`/${data.id_num}`} className="text-xs text-blue-500 hover:text-blue-400">
											Read more
										</Link>
									)}
								</p>
							</div>

							<div className="">
								{data.image && <img src={data.image} alt="image" className="w-[25%] rounded-lg bg-slate-100" />}
							</div>
						</section>
					</>
				)
			})}
		</div>
	)
}

export default Home

// #242424
// #000
// #fff
// #1143
