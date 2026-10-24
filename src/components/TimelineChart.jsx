import { useEffect, useRef, useMemo, useState } from 'react'
import * as echarts from 'echarts/core'
import { CustomChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, MarkLineComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Link, useNavigate } from 'react-router-dom'
import { formatYear, ordinalYear, historicalYear, elapsedYears } from '../utils/dates'

echarts.use([CustomChart, GridComponent, TooltipComponent, TitleComponent, MarkLineComponent, CanvasRenderer])

// Draws a single Gantt bar clipped to the chart area.
function renderBar(params, api) {
	const start = api.coord([api.value(1), api.value(0)])
	const end = api.coord([api.value(2), api.value(0)])
	const barH = api.size([0, 1])[1] * 0.6
	const shape = echarts.graphic.clipRectByRect(
		{ x: end[0] === start[0] ? start[0]-1.5 : start[0], y: start[1] - barH / 2, width: Math.max(end[0] - start[0], 3), height: barH },
		{ x: params.coordSys.x, y: params.coordSys.y, width: params.coordSys.width, height: params.coordSys.height }
	)
	return shape && { type: 'rect', transition: ['shape'], shape, style: { fill: api.visual('color'), stroke: '#21306a', lineWidth: 0.5, lineDash: api.value(5) ? [4,3] : undefined } }
}

function buildOption({ rows, rangestart, rangeend, title, markerYear }) {
	const names = rows.map((r) => r.name)

	return {
		title: {
			text: title,
			textStyle: { color: '#21306a', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' },
			padding: [10, 0, 0, 8],
		},
		tooltip: {
			renderMode: 'richText',
			trigger: 'item',
			confine: true,
			formatter: (p) => {
				const [, start, end, name, dur] = p.value
				return `${name}\n${formatYear(historicalYear(start))}${end !== start ? ` – ${formatYear(historicalYear(end))}` : ''}${dur ? `\n${dur} years` : ''}`
			},
		},
		grid: { left: 2, right: 4, top: 40, bottom: 24, containLabel: true },
		xAxis: {
			type: 'value',
			min: ordinalYear(rangestart),
			max: Math.max(ordinalYear(rangestart)+1,ordinalYear(rangeend)),
			minInterval: 1,
			axisLabel: { color: '#475569', fontSize: 10, formatter: n => formatYear(historicalYear(Math.round(n))), hideOverlap: true },
			splitLine: { lineStyle: { color: '#eef2f7' } },
			axisLine: { show: false },
			axisTick: { show: false },
		},
		yAxis: {
			type: 'category',
			data: names,
			inverse: true,
			axisLabel: { color: '#475569', fontSize: 10, width: 85, overflow: 'truncate' },
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { show: false },
		},
		series: [
			{
				type: 'custom',
				renderItem: renderBar,
				encode: { x: [1, 2], y: 0 },
				itemStyle: { color: '#6172b8', borderColor: '#21306a', borderWidth: 0.5 },
				data: rows.map((r, i) => ({ value: [i, ordinalYear(r.start), ordinalYear(r.end), r.name + (r.date_kind === 'uncertain' ? ' (uncertain bounds)' : ''), r.date_kind === 'uncertain' ? null : elapsedYears(r.start,r.end), r.date_kind === 'uncertain' ? 1 : 0], itemStyle: r.date_kind === 'uncertain' ? { color: '#dbe1f2' } : undefined })),
				markLine:
					markerYear != null
						? {
								animation: false,
								silent: true,
								symbol: ['none', 'none'],
								label: { show: false },
								data: [{ xAxis: ordinalYear(markerYear) }],
								lineStyle: { color: '#5f1212', width: 2, type: 'dashed' },
						  }
						: undefined,
			},
		],
	}
}

function TimelineChart({ data, rangestart, rangeend, type, title, markerYear }) {
	const navigate = useNavigate()
	const rows = useMemo(
		() =>
			data
				.filter((r) => r.type === type && r.start != null)
				.map((r) => ({ ...r, end: r.end ?? r.start }))
				.filter((r) => r.end >= rangestart && r.start <= rangeend)
				.sort((a, b) => a.start - b.start),
		[data, type, rangestart, rangeend]
	)

	const containerRef = useRef(null)
	const chartRef = useRef(null)
	const [exported,setExported] = useState(''), [error,setError] = useState('')
	const download = () => {
		try {
			const chart=chartRef.current, width=chart.getWidth(), height=chart.getHeight()
			const url=chart.getDataURL({pixelRatio:Math.min(2,4096/width,4096/height,Math.sqrt(16e6/(width*height))),backgroundColor:'#fff'})
			setExported(url);setError('')
			const a=document.createElement('a');a.href=url;a.download=`chronica-${type}.png`;a.click()
		} catch(e) {setError(`Chart export failed: ${e.message}`)}
	}

	useEffect(() => {
		const chart = echarts.init(containerRef.current, null, { renderer: 'canvas' })
		chartRef.current = chart
		const ro = new ResizeObserver(() => chart.resize())
		ro.observe(containerRef.current)
		return () => {
			ro.disconnect()
			chart.dispose()
			chartRef.current = null
		}
	}, [])

	useEffect(() => {
		chartRef.current?.setOption(buildOption({ rows, rangestart, rangeend, title, markerYear }), {
			notMerge: true,
			lazyUpdate: true,
		})
	}, [rows, rangestart, rangeend, title, markerYear])
	useEffect(() => {
		const chart = chartRef.current
		const select = p => { const row = rows[p.dataIndex]; if (row) navigate(`/${row.id_num}`) }
		chart?.on('click', select)
		return () => chart?.off('click', select)
	}, [rows, navigate])

	return <div>
		<div className="max-h-[320px] overflow-y-auto"><div ref={containerRef} role="img" aria-label={`${title}: ${rows.length} records; dashed bars indicate uncertain dates. Text links below.`} style={{ width: '100%', height: Math.max(240, rows.length * 26 + 80) }} /></div>
		{rows.length === 0 && <p className="px-3 text-sm text-slate-500">No records in this window.</p>}
		<div className="flex flex-wrap gap-4 p-3 text-xs"><button className="underline" onClick={download}>Download chart</button>{exported && <a className="underline" href={exported} download={`chronica-${type}.png`}>Save chart PNG</a>}<details><summary className="cursor-pointer">Text list ({rows.length})</summary><ul className="space-y-2 pt-2">{rows.map(r => <li key={r.timelineKey || r.id}><Link className="underline" to={`/${r.id_num}`}>{r.name}</Link>: {formatYear(r.start)}{r.end !== r.start && ` – ${formatYear(r.end)}`}{r.date_kind === 'uncertain' && ' (uncertain bounds)'}</li>)}</ul></details></div>{error&&<p role="alert">{error}</p>}
	</div>
}

export default TimelineChart
