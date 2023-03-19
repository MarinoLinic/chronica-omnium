import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import data from './resources/World_History.json'
import { filterData, filterDataTypes } from './utils/functions'
import Title from './components/Title'
import Border from './components/Border'
import BackToTop from './components/BackToTop'

function Home() {
	let filteredData = filterData(data)

	// Get all unique types from the data
	const types = [...new Set(filteredData.map((item) => item.type))]

	// Create a state to store selected types
	const [selectedTypes, setSelectedTypes] = useState([])

	const [filteredDataState, setfilteredDataState] = useState(filteredData)

	// Handler for checkbox change
	const handleCheckboxChange = (event) => {
		const { value, checked } = event.target

		if (checked) {
			// Add selected type to the array
			setSelectedTypes([...selectedTypes, value])
			setfilteredDataState(() => filterDataTypes(filteredData, [...selectedTypes, value]))
		} else {
			// Remove selected type from the array
			setSelectedTypes(selectedTypes.filter((type) => type !== value))
			setfilteredDataState(() =>
				filterDataTypes(
					filteredData,
					selectedTypes.filter((type) => type !== value)
				)
			)
		}
	}

	return (
		<div className="scrollbar-top">
			<div>
				<p>Filter by type:</p>
				{types.map((type) => (
					<div clasName="flex-row">
						<label key={type}>
							<input
								type="checkbox"
								value={type}
								checked={selectedTypes.includes(type)}
								onChange={handleCheckboxChange}
							/>
							{type}
						</label>
					</div>
				))}
			</div>

			<p>Number of events: {filteredDataState.length}</p>

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

			{filteredDataState.map((data) => {
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
								{data.image && (
									<img src={data.img_sm ? data.img_sm : data.image} alt="image" className="w-[25%] rounded-lg" />
								)}
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
