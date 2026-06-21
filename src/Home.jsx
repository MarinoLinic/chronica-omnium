import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Virtuoso } from 'react-virtuoso'
import data from './resources/World_History.json'
import { filterData } from './utils/functions'
import Title from './components/Title'
import HomeEvent from './components/HomeEvent'
import BackToTop from './components/BackToTop'

const CheckGroup = ({ heading, options, selected, onToggle, onAll, onNone }) => (
	<section className="min-w-[200px] flex-1">
		<div className="mb-2 flex items-center justify-between">
			<p className="text-sm font-semibold text-slate-700">{heading}</p>
			<div className="flex gap-2 text-xs">
				<button onClick={onAll} className="text-[#21306a] hover:underline">
					All
				</button>
				<span className="text-slate-300">|</span>
				<button onClick={onNone} className="text-slate-500 hover:underline">
					None
				</button>
			</div>
		</div>
		<div className="flex flex-wrap gap-1.5">
			{options.map((opt) => {
				const active = selected.includes(opt)
				return (
					<button
						key={opt}
						onClick={() => onToggle(opt)}
						className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
							active
								? 'bg-[#21306a] text-white ring-[#21306a]'
								: 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
						}`}
					>
						{opt}
					</button>
				)
			})}
		</div>
	</section>
)

function Home() {
	const allData = useMemo(() => filterData(data), [])

	const types = useMemo(() => [...new Set(allData.map((item) => item.type))].sort(), [allData])
	const fields = useMemo(() => [...new Set(allData.map((item) => item.field))].sort(), [allData])

	const [selectedTypes, setSelectedTypes] = useState(types)
	const [selectedFields, setSelectedFields] = useState(fields)
	const [query, setQuery] = useState('')
	const [showFilters, setShowFilters] = useState(false)

	const displayedData = useMemo(() => {
		const q = query.trim().toLowerCase()
		return allData.filter(
			(item) =>
				selectedTypes.includes(item.type) &&
				selectedFields.includes(item.field) &&
				(q === '' ||
					item.name?.toLowerCase().includes(q) ||
					item.short_desc?.toLowerCase().includes(q) ||
					item.location?.toLowerCase().includes(q))
		)
	}, [allData, selectedTypes, selectedFields, query])

	const toggle = (setter, list, value) =>
		setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

	return (
		<div className="min-h-screen">
			<header className="bg-gradient-to-b from-slate-50 to-white pt-6">
				<Title />
				<p className="center text-sm text-slate-500">
					Explore the{' '}
					<Link to={`/timeline`} className="font-medium text-[#21306a] hover:underline">
						Timeline
					</Link>
				</p>
			</header>

			<BackToTop />

			<div className="sticky top-0 z-30 border-y border-slate-200 bg-white/85 backdrop-blur">
				<div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search events, places, descriptions..."
							className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-[#21306a] focus:bg-white focus:ring-2 focus:ring-[#21306a]/20"
						/>
					</div>
					<div className="flex items-center justify-between gap-3 sm:justify-end">
						<span className="text-sm text-slate-500">
							{displayedData.length.toLocaleString()} of {allData.length.toLocaleString()}
						</span>
						<button
							onClick={() => setShowFilters((s) => !s)}
							className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 transition ${
								showFilters
									? 'bg-[#21306a] text-white ring-[#21306a]'
									: 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
							}`}
						>
							Filters
						</button>
					</div>
				</div>

				{showFilters && (
					<div className="border-t border-slate-200 bg-white">
						<div className="mx-auto flex max-w-5xl flex-wrap gap-6 px-4 py-4">
							<CheckGroup
								heading="Type"
								options={types}
								selected={selectedTypes}
								onToggle={(v) => toggle(setSelectedTypes, selectedTypes, v)}
								onAll={() => setSelectedTypes(types)}
								onNone={() => setSelectedTypes([])}
							/>
							<CheckGroup
								heading="Field"
								options={fields}
								selected={selectedFields}
								onToggle={(v) => toggle(setSelectedFields, selectedFields, v)}
								onAll={() => setSelectedFields(fields)}
								onNone={() => setSelectedFields([])}
							/>
						</div>
					</div>
				)}
			</div>

			<main className="mx-auto max-w-4xl px-4 py-2">
				{displayedData.length > 0 ? (
					<Virtuoso
						useWindowScroll
						increaseViewportBy={400}
						data={displayedData}
						itemContent={(index, item) => (
							<div className={index > 0 ? 'border-t border-slate-200' : ''}>
								<HomeEvent data={item} />
							</div>
						)}
					/>
				) : (
					<h2 className="py-20 text-center text-xl text-slate-300">There is nothing here.</h2>
				)}
			</main>
		</div>
	)
}

export default Home
