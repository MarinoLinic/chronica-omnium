import data from './resources/World_History.json'

function App() {
	console.log(data)
	console.log(data[1].image)

	return (
		<div>
			<p className="text-orange-400">Test</p>
			{data.map((data) => {
				return (
					<div className="grid grid-cols-4 gap-2">
						<div className="text-orange-400 text-xs">
							{data.start}
							{data.end && ` - ${data.end}`}
						</div>
						<div className="flex-col">
							<p className="font-bold">{data.name}</p>
							<p className="text-xs font-thin">{data.short_desc}</p>
							<p className="text-blue-500 text-[10px]">
								<a href={data.source}>Read more</a>
							</p>
						</div>
						<img src={data.image} alt="image" className="w-1/2" />
					</div>
				)
			})}
		</div>
	)
}

export default App
