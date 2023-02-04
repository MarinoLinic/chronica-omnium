import data from './resources/World_History.json'

function App() {
	console.log(data)
	console.log(data[1].image)

	return (
		<div className="bg-[#27252F]">
			<div className="p-16 flex-col">
				<p className="text-center text-4xl font-extrabold uppercase">Curated History of the World</p>
				<p className="mt-4 text-center font-normal">
					By{' '}
					<a className="hover:text-orange-400" href="https://linic.net">
						Marino Linić
					</a>
				</p>
			</div>
			{data.map((data) => {
				return (
					<div className="mb-4 grid grid-cols-3 gap-2 bg-black bg-opacity-[3%] hover:bg-opacity-[9%]">
						<div className="text-sm flex-col">
							<div className="mt-4 text-orange-300 font-semibold flex items-center justify-end">
								{data.start}
								{data.end && ` - ${data.end}`}
							</div>
							<div className="mt-2 text-gray-300 flex items-center justify-end">{data.location}</div>
							<div className="mb-4 text-gray-400 mt-2 flex items-center justify-end">{data.type}</div>
						</div>
						<div className="flex-col text-center">
							<p className="mt-4 font-bold text-2xl">{data.name}</p>
							<p className="text-xs font-thin">{data.short_desc}</p>
							<p className="mb-4 text-blue-500 text-[10px]">
								<a href={data.source}>Read more</a>
							</p>
						</div>
						<div className="">
							{data.image && <img src={data.image} alt="image" className="w-1/3 rounded-lg bg-slate-100" />}
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default App

// #242424
// #000
// #fff
// #1143
