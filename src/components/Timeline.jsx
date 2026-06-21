import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toPng } from 'html-to-image'
import data from '../resources/World_History.json'

// Vertical position is proportional to the year, so the visual distance between
// events reflects the real time between them. Only Common Era (year > 0) events
// are shown.
const PX_PER_YEAR = 6
const AXIS_WIDTH = 64
const LANE_WIDTH = 240
const LANE_GAP = 8
const BAR_WIDTH = 6
const LINE_HEIGHT = 16 // px per wrapped line of the title
const DATE_HEIGHT = 16 // px for the date line under the title
const CHARS_PER_LINE = 34 // rough title characters that fit in LANE_WIDTH

// Estimate the rendered height of an event's label so the packer can reserve
// enough vertical room for the full (wrapping) title without overlaps.
function estimateLabelHeight(name) {
	const lines = Math.max(1, Math.ceil((name?.length || 0) / CHARS_PER_LINE))
	return lines * LINE_HEIGHT + DATE_HEIGHT + 6
}

const TYPE_STYLES = {
	Unit: { bar: '#6172b8', text: 'text-[#21306a]', dot: 'bg-[#6172b8]' },
	Person: { bar: '#0d9488', text: 'text-teal-700', dot: 'bg-teal-600' },
	Event: { bar: '#d97706', text: 'text-amber-700', dot: 'bg-amber-500' },
}
const DEFAULT_STYLE = { bar: '#64748b', text: 'text-slate-600', dot: 'bg-slate-500' }

function styleFor(type) {
	return TYPE_STYLES[type] || DEFAULT_STYLE
}

const Timeline = () => {
	const { events, minYear, maxYear, laneCount } = useMemo(() => {
		const ce = data
			.filter((item) => item.start > 0)
			.map((item) => ({
				id_num: item.id_num,
				name: item.name,
				type: item.type,
				start: item.start,
				end: item.end && item.end >= item.start ? item.end : item.start,
			}))
			.sort((a, b) => a.start - b.start || a.end - b.end)

		const minYear = ce.length ? Math.min(...ce.map((e) => e.start)) : 0
		const maxYear = ce.length ? Math.max(...ce.map((e) => e.end)) : 0

		// Greedy lane packing: place each event in the first lane whose previous
		// event has finished (including the space its full label needs) before
		// this one starts.
		const laneEnds = []
		for (const e of ce) {
			const labelYears = estimateLabelHeight(e.name) / PX_PER_YEAR
			const reservedEnd = Math.max(e.end, e.start + labelYears)
			let lane = laneEnds.findIndex((end) => end <= e.start)
			if (lane === -1) {
				lane = laneEnds.length
				laneEnds.push(reservedEnd)
			} else {
				laneEnds[lane] = reservedEnd
			}
			e.lane = lane
		}

		return { events: ce, minYear, maxYear, laneCount: laneEnds.length }
	}, [])

	const totalHeight = (maxYear - minYear) * PX_PER_YEAR + 60
	const totalWidth = AXIS_WIDTH + laneCount * (LANE_WIDTH + LANE_GAP) + 40

	// Century gridlines.
	const firstCentury = Math.ceil(minYear / 100) * 100
	const ticks = []
	for (let y = firstCentury; y <= maxYear; y += 100) ticks.push(y)

	const canvasRef = useRef(null)
	const [downloading, setDownloading] = useState(false)

	const handleDownload = async () => {
		if (!canvasRef.current) return
		setDownloading(true)
		try {
			const dataUrl = await toPng(canvasRef.current, {
				backgroundColor: '#ffffff',
				width: totalWidth,
				height: totalHeight,
				pixelRatio: 2,
			})
			const link = document.createElement('a')
			link.download = 'chronica-omnium-timeline.png'
			link.href = dataUrl
			link.click()
		} catch (err) {
			console.error('Timeline export failed:', err)
		} finally {
			setDownloading(false)
		}
	}

	return (
		<div className="min-h-screen bg-slate-50/40">
			<header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur">
				<div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
					<Link
						to="/"
						className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-[#21306a]"
					>
						All events
					</Link>
					<div>
						<h1 className="text-lg font-bold text-slate-900">Timeline</h1>
						<p className="text-xs text-slate-500">Common Era · vertical distance = real elapsed time</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="hidden items-center gap-3 text-xs text-slate-500 sm:flex">
							{Object.entries(TYPE_STYLES).map(([type, s]) => (
								<span key={type} className="inline-flex items-center gap-1">
									<span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
									{type}
								</span>
							))}
						</div>
						<button
							onClick={handleDownload}
							disabled={downloading}
							className="rounded-lg bg-[#21306a] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2c3f8a] disabled:opacity-60"
						>
							{downloading ? 'Rendering…' : 'Download image'}
						</button>
					</div>
				</div>
			</header>

			<div className="overflow-x-auto">
				<div ref={canvasRef} className="relative bg-white" style={{ height: totalHeight, width: totalWidth }}>
					{/* Century gridlines + year labels */}
					{ticks.map((year) => {
						const top = (year - minYear) * PX_PER_YEAR + 30
						return (
							<div key={year}>
								<div
									className="absolute left-0 right-0 border-t border-dashed border-slate-200"
									style={{ top }}
								/>
								<div
									className="absolute left-0 -translate-y-1/2 text-xs font-medium text-slate-400"
									style={{ top, width: AXIS_WIDTH }}
								>
									{year}
								</div>
							</div>
						)
					})}

					{/* Events */}
					{events.map((e) => {
						const top = (e.start - minYear) * PX_PER_YEAR + 30
						const barHeight = Math.max((e.end - e.start) * PX_PER_YEAR, 4)
						const left = AXIS_WIDTH + e.lane * (LANE_WIDTH + LANE_GAP)
						const style = styleFor(e.type)
						const isSpan = e.end > e.start
						return (
							<Link
								key={e.id_num}
								to={`/${e.id_num}`}
								className="group absolute flex items-start gap-2"
								style={{ top, left, width: LANE_WIDTH }}
							>
								<span
									className="mt-0.5 shrink-0 rounded-full"
									style={{ width: BAR_WIDTH, height: barHeight, backgroundColor: style.bar }}
								/>
								<span className="min-w-0 leading-tight">
									<span className={`block break-words text-sm font-semibold ${style.text} group-hover:underline`}>
										{e.name}
									</span>
									<span className="block text-[11px] text-slate-400">
										{e.start}
										{isSpan && ` – ${e.end}`}
									</span>
								</span>
							</Link>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default Timeline
