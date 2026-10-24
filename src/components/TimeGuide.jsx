import { useState } from 'react';
import { formatYear } from '../utils/dates';
import { guideForYear } from '../utils/time-scales';

export default function TimeGuide({year,scales,records,onJump}) {
  const [open,setOpen]=useState(()=>window.innerWidth>760);
  const groups=guideForYear(year,scales);
  if (!groups.length) return null;
  return <details className="time-guide" open={open} onToggle={e=>setOpen(e.currentTarget.open)}>
    <summary>Time guide <span>{formatYear(year)}</span></summary>
    <div className="time-guide-body">
      {groups.map(group=>{
        const compact = year >= -10000;
        const ancestors = compact && group.label==='Earth' ? group.nodes.slice(0,-1) : [];
        const nodes = compact && group.label==='Earth' ? group.nodes.slice(-1)
          : compact && group.label==='Human periods' ? group.nodes.filter(n=>n.name!=='Recorded history') : group.nodes;
        return <section key={group.label} aria-label={group.label}>
        <h2>{group.label}</h2>
        {ancestors.length>0 && <div className="time-guide-lineage">{ancestors.map((n,i)=>{
          const index=records.findIndex(r=>r.start>=n.start && r.start<=n.end);
          return <span key={n.key}>{i>0 && ' › '}<button disabled={index<0} onClick={()=>onJump(index)}>{n.name}</button></span>;
        })}</div>}
        {nodes.map(n=>{
          const index=records.findIndex(r=>r.start>=n.start && r.start<=n.end);
          const depth=compact ? group.label==='Earth' ? 0 : Math.max(0,n.depth-1) : n.depth;
          return <div key={n.key} className="time-guide-level" style={{'--depth':Math.min(depth,3)}}>
            {n.start===undefined ? <strong>{n.name}</strong> : <button disabled={index<0} onClick={()=>onJump(index)} title={`${n.name}: approximately ${formatYear(n.start)} to ${n.ongoing?'present':formatYear(n.end)}`}>
              <small>{n.type || 'Age'}</small><strong>{n.name}</strong>
            </button>}
          </div>;
        })}
      </section>;})}
      <p className="time-guide-note">Approximate ages. Human periods are a broad guide; transitions vary by region.</p>
      <details className="time-guide-sources"><summary>About these ages</summary>
        <p>Geological ages follow a rounded scheme checked against the ICS chart. Medieval and modern labels follow the familiar European convention.</p>
        {scales.metadata?.sources?.[0]?.url && <a href={scales.metadata.sources[0].url} target="_blank" rel="noreferrer">Geological reference ↗</a>}
      </details>
    </div>
  </details>;
}
