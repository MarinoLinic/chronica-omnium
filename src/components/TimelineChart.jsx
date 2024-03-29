import Plot from 'react-plotly.js'

function TimelineChart({ data, rangestart, rangeend, type, title }) {
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
				marker: { color: '#C7CBDD' },
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
			title: `Timeline of ${title}`,
			xaxis: {
				title: 'Date',
				range: [rangestart, rangeend],
				showspikes: true,
				spikecolor: 'black',
				spikemode: 'across',
				spikesnap: 'cursor',
				tickfont: { color: 'black' },
			},
			yaxis: {
				title: title,
				autorange: 'reversed',
				showspikes: true,
				spikecolor: 'black',
				spikemode: 'across',
				spikesnap: 'cursor',
				tickfont: { color: 'black' },
			},
			plot_bgcolor: '#fff',
			paper_bgcolor: '#fff',
			margin: {
				l: 280, // adjust the left margin
				r: 50, // adjust the right margin
				t: 50, // adjust the top margin
				b: 50, // adjust the bottom margin
			},
			// hovermode: 'x',
		},
	}

	// style={{ width: '800px', height: '600px' }} ↓ add below after layout

	return <Plot data={fig.data} layout={fig.layout} style={{ width: '700px', height: '400px' }} />
}

export default TimelineChart
