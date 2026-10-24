export const priorityLabels = {1:"Essential",2:"Major",3:"Significant",4:"Specialist",5:"Niche"};
export default function PriorityFilter({ value, onChange, className = "" }) {
  return <label>Priority <select aria-label="Priority" className={className} value={value} onChange={e=>onChange(Number(e.target.value))}>
    <option value={5}>All priorities (1–5)</option>{[1,2,3,4].map(n=><option key={n} value={n}>{n === 1 ? '1 · Essential' : `1–${n} · ${priorityLabels[n]} and above`}</option>)}
  </select></label>;
}
