import { useEffect, useRef, useMemo } from 'react'
import * as echarts from 'echarts/core'
import { CustomChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, MarkLineComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([CustomChart, GridComponent, TooltipComponent, TitleComponent, MarkLineComponent, CanvasRenderer])

// Draws a single Gantt bar clipped to the chart area.
function renderBar(params, api) {
	const start = api.coord([api.value(1), api.value(0)])
	const end = api.coord([api.value(2), api.value(0)])
	const barH = api.size([0, 1])[1] * 0.6
	const shape = echarts.graphic.clipRectByRect(
		{ x: start[0], y: start[1] - barH / 2, width: Math.max(end[0] - start[0], 2), height: barH },
		{ x: params.coordSys.x, y: params.coordSys.y, width: params.coordSys.width, height: params.coordSys.height }
	)
	return shape && { type: 'rect', transition: ['shape'], shape, style: api.style() }
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
			trigger: 'item',
			confine: true,
			formatter: (p) => {
				const [, start, end, name, dur] = p.value
				return `<b>${name}</b><br/>${start} – ${end}${dur ? `<br/>${dur}\u202fyrs` : ''}`
			},
		},
		grid: { left: 8, right: 16, top: 40, bottom: 24, containLabel: true },
		xAxis: {
			type: 'value',
			min: rangestart,
			max: rangeend,
			axisLabel: { color: '#475569', fontSize: 10 },
			splitLine: { lineStyle: { color: '#eef2f7' } },
			axisLine: { show: false },
			axisTick: { show: false },
		},
		yAxis: {
			type: 'category',
			data: names,
			inverse: true,
			axisLabel: { color: '#475569', fontSize: 10, width: 110, overflow: 'truncate' },
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
				data: rows.map((r, i) => ({ value: [i, r.start, r.end, r.name, r.duration] })),
				markLine:
					markerYear != null
						? {
								animation: false,
								silent: true,
								symbol: ['none', 'none'],
								label: { show: false },
								data: [{ xAxis: markerYear }],
								lineStyle: { color: '#5f1212', width: 2, type: 'dashed' },
						  }
						: undefined,
			},
		],
	}
}

function TimelineChart({ data, rangestart, rangeend, type, title, markerYear }) {
	const rows = useMemo(
		() =>
			data
				.filter((r) => r.type === type && r.start != null && r.end != null)
				.filter((r) => r.end >= rangestart && r.start <= rangeend)
				.sort((a, b) => a.start - b.start),
		[data, type, rangestart, rangeend]
	)

	const containerRef = useRef(null)
	const chartRef = useRef(null)

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

	return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default TimelineChart
