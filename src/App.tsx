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
					<>
						<section className="grid grid-cols-3 justify-center">
							<div />
							<div className="px-[25%]">
								<div className="border-b border-gray-300 border-solid border-opacity-[5%]" />
							</div>
							<div />
						</section>

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
									<a className="text-xs text-blue-500 hover:text-blue-400" href={data.source}>
										Read more
									</a>
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

export default App

// #242424
// #000
// #fff
// #1143
