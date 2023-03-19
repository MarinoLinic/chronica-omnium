import { Link } from 'react-router-dom'
import data from './resources/World_History.json'
import Title from '../components/Title'
import Border from '../components/Border'
import BackToTop from '../components/BackToTop'

function Home() {
	return (
		<div className="scrollbar-top">
			<Title />
			<BackToTop />
			<div>
				<p className="center">
					Check out the{' '}
					<Link to={`/timeline`} className="red">
						Canvas Timeline
					</Link>
					!
				</p>
			</div>

			{data.map((data) => {
				return (
					<>
						<Border />

						<section className="margin-y grid grid-cols-3 gap-2 items-center bg-black bg-opacity-[1%]">
							<div className="text-sm flex-col">
								<div className="mt-4 red font-semibold flex items-center justify-end">
									{data.start}
									{data.end && ` - ${data.end}`}
								</div>
								<div className="mt-2 gray flex items-center justify-end">{data.location}</div>
								<div className="mb-4 text-gray-400 mt-2 flex items-center justify-end">{data.type}</div>
							</div>

							<div className="flex-col text-center px-36">
								<p className="mt-4 font-bold text-xl blue">{data.name}</p>
								<p className="text-sm font-light blue">{data.short_desc}</p>
								<p className="mb-4">
									{data.id_num && (
										<Link to={`/${data.id_num}`} className="text-xs text-blue-500 hover:text-blue-400">
											Read more
										</Link>
									)}
								</p>
							</div>

							<div className="">
								{data.img_sm && <img src={data.img_sm} alt="image" className="w-[25%] rounded-lg" />}
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
