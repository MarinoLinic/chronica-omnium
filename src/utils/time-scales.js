import { ordinalYear, historicalYear } from './dates.js';

export function ordinal(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${({1:'st',2:'nd',3:'rd'})[n % 10] || 'th'}`;
}
export const centuryLabel = year => !Number.isFinite(year) || year === 0 ? 'Undated' : `${ordinal(Math.ceil(Math.abs(year) / 100))} century${year < 0 ? ' BCE' : ''}`;
export function scaleNodes(scales, kind, viewerYear = new Date().getFullYear()) {
  const result = [];
  const visit = (nodes, depth = 0) => {
    for (const node of nodes || []) {
      if (node.speculative) continue;
      const end = node.ongoing ? viewerYear : node.end;
      result.push({...node, end, depth, kind, key:`${kind}:${node.name}`});
      visit(node.sub, depth + 1);
    }
  };
  visit(scales.time_scale?.[kind]);
  return result;
}
export function guideForYear(year, scales, viewerYear) {
  if (!Number.isFinite(year) || year === 0) return [];
  const contains = n => n.start <= year && n.end >= year;
  const geological = scaleNodes(scales, 'geologic', viewerYear).filter(contains);
  // Regional examples remain in the reference file; the guide uses one broad scheme.
  const archaeological = scaleNodes(scales, 'archeological', viewerYear)
    .filter(n => contains(n) && !['Asia','Europe','Western Europe','Scandinavia'].includes(n.type));
  const human = scaleNodes(scales, 'anthropologic', viewerYear).filter(contains);
  const groups = [];
  if (geological.length) groups.push({label:'Earth',nodes:geological});
  else groups.push({label:year > (viewerYear ?? new Date().getFullYear()) ? 'Future' : 'Before Earth',nodes:[]});
  if (archaeological.length) groups.push({label:'Archaeological ages',nodes:archaeological});
  if (human.length) groups.push({label:'Human periods',nodes:human});
  if (year >= -10000) groups.push({label:'Century',nodes:[{name:centuryLabel(year),key:`century:${year < 0 ? '-' : ''}${Math.ceil(Math.abs(year)/100)}`,depth:0}]});
  return groups;
}
export function periodLabel(year, scales) {
  if (!Number.isFinite(year) || year === 0) return 'Undated';
  if (year >= 1) return centuryLabel(year);
  if (year >= -4999) return `${ordinal(Math.ceil(-year / 1000))} millennium BCE`;
  const groups = guideForYear(year, scales);
  return groups.find(g=>g.label==='Archaeological ages')?.nodes.at(-1)?.name
    || groups.find(g=>g.label==='Earth')?.nodes.at(-1)?.name || groups[0]?.label || 'Undated';
}
// Human periods take precedence for the reader tint, with archaeology/geology
// supplying deep-time context. Overlaps retain their independent guide labels.
export function eraForYear(year, scales) {
  const groups = guideForYear(year, scales);
  return groups.find(g=>g.label==='Human periods')?.nodes.at(-1)
    || groups.find(g=>g.label==='Archaeological ages')?.nodes.at(-1)
    || groups.find(g=>g.label==='Earth')?.nodes.at(-1);
}
export function timeBands(scales, start, end, pixels, viewerYear) {
  const columns = [];
  const min = ordinalYear(start), span = ordinalYear(end) - min;
  const add = (label,nodes,kind) => {
    const bands = nodes.filter(n=>n.start <= end && n.end >= start).map(n=>{
      const from = Math.max(start,n.start), to = Math.min(end,n.end);
      return {...n,position:(ordinalYear(from)-min)/span*pixels,length:Math.max(1,(ordinalYear(to)-ordinalYear(from))/span*pixels)};
    }).filter(n=>n.length>=24);
    const ends=[];
    for(const band of bands.sort((a,b)=>a.position-b.position || b.length-a.length)) {
      let lane=ends.findIndex(end=>end<=band.position);
      if(lane<0)lane=ends.length;
      ends[lane]=band.position+band.length;
      band.lane=lane;
    }
    if (bands.length) columns.push({label,kind,bands,laneCount:ends.length});
  };
  const geology=scaleNodes(scales,'geologic',viewerYear);
  for (const rank of start < -2580000 ? ['Eon','Era','Period','Epoch'] : ['Epoch'])
    add(rank,geology.filter(n=>n.type===rank),'earth');
  add('Ages',scaleNodes(scales,'archeological',viewerYear).filter(n=>n.depth===0),'ages');
  add('Human',scaleNodes(scales,'anthropologic',viewerYear).filter(n=>n.depth===1),'human');
  if (span<=5000) {
    const centuries=[];
    for(let n=Math.floor((min-1)/100)*100;n<=ordinalYear(end);n+=100){
      const s=historicalYear(n+1),e=historicalYear(n+100);
      centuries.push({name:centuryLabel(s),start:s,end:e,key:`century:${n}`});
    }
    add('Centuries',centuries,'century');
  }
  return columns;
}
