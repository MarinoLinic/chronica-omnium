export default function TimeScaleBands({columns,height}) {
  return <g aria-label="Time-scale guide">
    {columns.map((column,i)=><g key={column.label}>
      <text x={i*66+40} y={77} textAnchor="middle" fontSize="10" fill="var(--muted, #637570)">{column.label}</text>
      {column.bands.map(n=><g key={n.key}>
        <title>{n.name} · approximate guide</title>
        <rect x={i*66+10+n.lane*58/column.laneCount} y={n.position+100} width={58/column.laneCount} height={n.length} fill={column.kind==='earth'?'var(--age-earth, #e4eeec)':column.kind==='ages'?'var(--age-tools, #f0e9db)':'var(--age-human, #ebedf1)'} stroke="var(--line, #cbd5cc)"/>
        <text transform={`translate(${i*66+10+(n.lane+.5)*58/column.laneCount+4},${n.position+100+n.length/2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill="var(--ink, #203536)">{n.name.length*6<n.length-10?n.name:n.name.slice(0,Math.max(2,Math.floor(n.length/6)-3))+'…'}</text>
      </g>)}
    </g>)}
    <line x1={columns.length*66+5} x2={columns.length*66+5} y1="90" y2={height-40} stroke="var(--line, #dce2da)"/>
  </g>;
}
