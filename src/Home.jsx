import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import data from './resources/World_History.json'
import { filterData, filterDataTypes, filterDataFields } from './utils/functions'
import Title from './components/Title'
import Border from './components/Border'
import BackToTop from './components/BackToTop'

function Home() {
	let filteredData = filterData(data)

	// Get all unique types from the data
	const types = [...new Set(filteredData.map((item) => item.type))]
	const fields = [...new Set(filteredData.map((item) => item.field))]

	// Create a state to store selected types
	const [selectedTypes, setSelectedTypes] = useState(types)
	const [selectedFields, setSelectedFields] = useState(fields)
	const [settings, setSettings] = useState(false)
	const [filteredDataState, setfilteredDataState] = useState(filteredData)

	const handleButtonClick = () => {
		setSettings((settings) => !settings)
	}

	// Handler for checkbox change
	const handleCheckboxChangeTypes = (event) => {
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

	// Handler for checkbox change
	const handleCheckboxChangeFields = (event) => {
		const { value, checked } = event.target

		if (checked) {
			// Add selected type to the array
			setSelectedFields([...selectedFields, value])
			setfilteredDataState(() => filterDataFields(filteredData, [...selectedFields, value]))
		} else {
			// Remove selected type from the array
			setSelectedFields(selectedFields.filter((field) => field !== value))
			setfilteredDataState(() =>
				filterDataFields(
					filteredData,
					selectedFields.filter((field) => field !== value)
				)
			)
		}
	}

	return (
		<div className="scrollbar-top">
			<div className={`container flex flex-column-2 gap-4 bg-b fixed white ${settings ? '' : 'invisible'}`}>
				<section>
					<p>Filter by type:</p>
					{types.map((type) => (
						<div className="flex-row">
							<label key={type}>
								<input
									type="checkbox"
									value={type}
									checked={selectedTypes.includes(type)}
									onChange={handleCheckboxChangeTypes}
								/>
								{' ' + type}
							</label>
						</div>
					))}
					<button
						onClick={() => {
							setSelectedTypes(types)
							setfilteredDataState(() => filterDataTypes(filteredData, types))
						}}
					>
						Select all
					</button>
					<br />
					<button
						onClick={() => {
							setSelectedTypes([])
							setfilteredDataState(() => filterDataTypes(filteredData, []))
						}}
					>
						Deselect all
					</button>
				</section>

				<section>
					<p>Filter by field:</p>
					{fields.map((field) => (
						<div className="flex-row">
							<label key={field}>
								<input
									type="checkbox"
									value={field}
									checked={selectedFields.includes(field)}
									onChange={handleCheckboxChangeFields}
								/>
								{' ' + field}
							</label>
						</div>
					))}
					<button
						onClick={() => {
							setSelectedFields(fields)
							setfilteredDataState(() => filterDataFields(filteredData, fields))
						}}
					>
						Select all
					</button>
					<br />
					<button
						onClick={() => {
							setSelectedFields([])
							setfilteredDataState(() => filterDataFields(filteredData, []))
						}}
					>
						Deselect all
					</button>
				</section>

				<button onClick={handleButtonClick}>Close</button>
			</div>

			<section className="text-right mx-4">
				<p>Number of events: {filteredDataState.length}</p>
				<button onClick={handleButtonClick}>Settings</button>
			</section>

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

			{filteredDataState.length > 0 ? (
				filteredDataState.map((data) => {
					return (
						<>
							<Border />

							<section className="margin-y grid grid-cols-3 gap-2 items-center bg-black bg-opacity-[1%]">
								<div className="text-sm flex-col">
									<div className="mt-4 red font-semibold flex items-center justify-end">
										{data.time_start}
										{data.time_end && ` - ${data.time_end}`}
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
				})
			) : (
				<h2 className="container center opacity-25 gray">There is nothing here.</h2>
			)}
		</div>
	)
}

export default Home

// #242424
// #000
// #fff
// #1143
