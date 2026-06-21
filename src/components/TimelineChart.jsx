import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'

const Plot = createPlotlyComponent(Plotly)

function TimelineChart({ data, rangestart, rangeend, type, title, markerYear }) {
	// Filter rows with "Unit" in the "type" column
	const df_filtered = data.filter((row) => row.type === type)

	// Drop rows where either the start or end year is missing
	const df_sorted = df_filtered.filter((row) => row.start && row.end).sort((a, b) => a.start - b.start)

	// Filter rows by range
	const df_sortfiltered = df_sorted.filter((row) => row.end >= rangestart && row.start <= rangeend)

	// Create a horizontal bar chart of the units
	const fig = {
		data: [
			{
				y: df_sortfiltered.map((row) => row.name),
				x: df_sortfiltered.map((row) => row.end - row.start),
				base: df_sortfiltered.map((row) => row.start),
				orientation: 'h',
				marker: { color: '#6172b8', line: { color: '#21306a', width: 0.5 } },
				type: 'bar',
				text: df_sortfiltered.map((row) => `${row.duration}`), // add text to each bar
				textfont: { color: '#21306a', size: 1 }, // set the color of the text to white
				hovertemplate: '%{y}<br>%{base}-%{x}<br>%{text} years<extra></extra>',
				// text: df_sortfiltered.map((row) => `${row.start}-${row.end}`),
				// text: df_sortfiltered.map((row) => `${row.name}`), // add text to each bar
				// text: df_sortfiltered.map((row) => `${row.name}<br>${row.start}-${row.end}<br>${row.duration} years`), // add text to each bar
				// hoverinfo: 'text', // specify that hoverinfo should display the text property
			},
		],
		layout: {
			title: { text: title, font: { color: '#21306a', size: 15 } },
			autosize: true,
			font: { family: 'Poppins, sans-serif', size: 11, color: '#334155' },
			xaxis: {
				range: [rangestart, rangeend],
				showspikes: true,
				spikecolor: '#94a3b8',
				spikemode: 'across',
				spikesnap: 'cursor',
				spikethickness: 1,
				gridcolor: '#eef2f7',
				zeroline: false,
				tickfont: { color: '#475569' },
			},
			yaxis: {
				autorange: 'reversed',
				automargin: true,
				showspikes: true,
				spikecolor: '#94a3b8',
				spikemode: 'across',
				spikesnap: 'cursor',
				spikethickness: 1,
				gridcolor: '#eef2f7',
				tickfont: { color: '#475569', size: 10 },
			},
			plot_bgcolor: '#ffffff',
			paper_bgcolor: '#ffffff',
			margin: { l: 8, r: 16, t: 40, b: 36 },
			shapes:
				markerYear != null && markerYear >= rangestart && markerYear <= rangeend
					? [
							{
								type: 'line',
								xref: 'x',
								yref: 'paper',
								x0: markerYear,
								x1: markerYear,
								y0: 0,
								y1: 1,
								line: { color: '#5f1212', width: 2, dash: 'dot' },
							},
					  ]
					: [],
			annotations:
				markerYear != null && markerYear >= rangestart && markerYear <= rangeend
					? [
							{
								x: markerYear,
								xref: 'x',
								yref: 'paper',
								y: 1.04,
								text: 'this event',
								showarrow: false,
								font: { color: '#5f1212', size: 10 },
								xanchor: 'center',
							},
					  ]
					: [],
		},
	}

	return (
		<Plot
			data={fig.data}
			layout={fig.layout}
			useResizeHandler={true}
			config={{ responsive: true, displayModeBar: false }}
			style={{ width: '100%', height: '100%' }}
		/>
	)
}

export default TimelineChart
