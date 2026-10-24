import test from 'node:test';
import assert from 'node:assert/strict';
import {json,at} from '../scripts/lib/catalog.mjs';
import {guideForYear,periodLabel,timeBands,centuryLabel,scaleNodes} from '../src/utils/time-scales.js';
import {trackFor,layoutTimeline} from '../src/utils/timeline.js';
const scales=await json(at('data/reference/time-scales.json'));
test('geological guide places Cenozoic epochs in their own parents and keeps a rounded scheme',()=>{
 const eocene=guideForYear(-40000000,scales,2026).find(x=>x.label==='Earth').nodes;
 assert.deepEqual(eocene.map(n=>n.name),['Phanerozoic','Cenozoic','Paleogene','Eocene']);
 const recent=guideForYear(2026,scales,2026).find(x=>x.label==='Earth').nodes;
 assert.equal(recent.at(-1).name,'Holocene');
 assert.equal(recent.at(-1).end,2026);
 for(const n of scaleNodes(scales,'geologic',2026)){
  assert.ok(n.start<n.end,n.name);
  assert.ok(n.source.startsWith('https://'),n.name);
 }
});
test('metal ages are peers of Stone Age and human guide retains overlapping broad conventions',()=>{
 const ages=scales.time_scale.archeological;
 assert.ok(ages.some(n=>n.name==='Iron Age'));
 assert.ok(ages.some(n=>n.name==='Bronze Age'));
 assert.ok(!ages.find(n=>n.name==='Stone Age').sub.some(n=>n.name==='Iron Age'));
 const human=guideForYear(1200,scales,2026).find(g=>g.label==='Human periods');
 assert.ok(human.nodes.some(n=>n.name==='Middle Ages'));
 assert.equal(centuryLabel(-1),'1st century BCE');
 assert.equal(centuryLabel(1),'1st century');
 assert.equal(centuryLabel(-100),'1st century BCE');
 assert.equal(centuryLabel(-101),'2nd century BCE');
 assert.equal(periodLabel(-40000000,scales),'Eocene');
 assert.equal(periodLabel(null,scales),'Undated');
 assert.equal(periodLabel(0,scales),'Undated');
 assert.deepEqual(guideForYear(null,scales),[]);
});
test('vertical guide clips bands to the displayed range and crosses BCE/CE without year zero',()=>{
 const cols=timeBands(scales,-100,100,2000,2026);
 const centuries=cols.find(x=>x.label==='Centuries').bands;
 assert.deepEqual(centuries.map(n=>n.name),['1st century BCE','1st century']);
 for(const c of cols)for(const n of c.bands){
  assert.ok(n.position>=0);
  assert.ok(n.position+n.length<=2001);
  assert.notEqual(n.start,0);assert.notEqual(n.end,0);
 }
 assert.ok(!timeBands(scales,-13800000000,2026,1500,2026).some(c=>c.label==='Centuries'));
 const ages=timeBands(scales,-6000,-1000,2000,2026).find(c=>c.label==='Ages');
 for(const a of ages.bands)for(const b of ages.bands){
  if(a!==b && a.lane===b.lane)assert.ok(a.position+a.length<=b.position || b.position+b.length<=a.position);
 }
 assert.equal(trackFor({type:'Battle'}),'Society & conflict');
 assert.equal(trackFor({type:'Rebellion'}),'Society & conflict');
 assert.equal(trackFor({type:'Polity'}),'Polities & organizations');
});
test('vertical subject headings share the first event column instead of adding an empty lane',()=>{
 const records=[{id:'a',name:'A',id_num:1,start:1,end:10,type:'Battle'}];
 const grouped=layoutTimeline(records,{start:1,end:100,orientation:'vertical',grouped:true});
 assert.equal(grouped.items[0].lane,grouped.groups[0].lane);
 assert.equal(grouped.lanes,1);
});
