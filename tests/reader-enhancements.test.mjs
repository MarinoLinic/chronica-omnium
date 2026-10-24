import test from 'node:test';
import assert from 'node:assert/strict';
import { createEventLoader } from '../src/utils/event-loader.js';
import { matchesGeography, geographyOptions } from '../src/utils/geography.js';
import { selectEvents, trackFor } from '../src/utils/timeline.js';
import { audit, compileRecord, loadCatalog, loadReferences, validateRecord } from '../scripts/lib/catalog.mjs';

test('intent preloads and navigation share an in-flight request and prepared image', async()=>{
 let release,calls=0,prepares=0;
 const wait=new Promise(resolve=>release=resolve);
 const load=createEventLoader({fetcher:async()=>{calls++;await wait;return {ok:true,json:async()=>({start:-1,end:null,date_kind:'point',content:{text:'Source'}})}},prepare:async r=>{prepares++;return {...r,prepared_image:'/chosen.jpg'}}});
 const hover=load('event-1'), click=load('event-1');
 assert.equal(hover,click);release();
 const result=await click;
 assert.equal(calls,1);assert.equal(prepares,1);
 assert.equal(result.event.prepared_image,'/chosen.jpg');assert.equal(result.content.text,'Source');
 assert.equal(await load('event-1'),result);
});
test('failed preloads can retry and the detail cache has a bounded history',async()=>{
 let calls=0;
 const load=createEventLoader({limit:2,prepare:async r=>r,fetcher:async()=>({ok:++calls!==1,json:async()=>({start:null,end:null})})});
 await assert.rejects(load('a'),/could not be loaded/);
 await load('a');await load('b');await load('c');await load('a');assert.equal(calls,5);
 load.clear();await load('a');assert.equal(calls,6);
});
const place=(id,continent,code)=>({id,label:id,continents:[continent],countryCodes:[code],countryNames:[code]});
const records=[
 {id:'a',id_num:1,start:-1,end:null,name:'A',type:'Polity',priority:1,geography:[place('rome','Europe','IT'),place('cairo','Africa','EG')]},
 {id:'b',id_num:2,start:1,end:50,name:'B',type:'Battle',priority:4,geography:[place('rome','Europe','IT')]},
 {id:'c',id_num:3,start:1,end:null,name:'C',type:'Event',priority:null,geography:[]},
];
test('geographic facets match the same association and retain explicit unknowns',()=>{
 assert.ok(matchesGeography(records[0],{continent:'Africa',country:'EG'}));
 assert.ok(!matchesGeography(records[0],{continent:'Africa',country:'IT'}));
 assert.ok(!matchesGeography(records[2],{country:'IT'}));
 assert.ok(matchesGeography(records[2],{}));
 assert.deepEqual(geographyOptions(records,{continent:'Europe'}).countries,[['IT','IT']]);
 const options={start:-10,end:100,country:'IT',priority:2};
 assert.deepEqual(selectEvents(records,options).map(r=>r.id),['a']);
 assert.equal(selectEvents(records,{start:-10,end:100}).length,3);
 assert.equal(selectEvents(records,{start:-10,end:100,priority:4}).length,2);
 assert.equal(trackFor(records[0]),'Polities & organizations');
 assert.equal(trackFor({type:'Natural event'}),'Earth & life');
});
test('priority validates independently of legacy relevance, and sourced geography never approves a map',async()=>{
 const entries=await loadCatalog(),refs=await loadReferences(),r=entries[0].record;
 for(const priority of [0,6,1.5,'1'])assert.ok(validateRecord({...r,priority}).length);
 for(const priority of [null,1,5])assert.deepEqual(validateRecord({...r,priority}),[]);
 const custom=structuredClone(refs),p=custom.places.places[0];
 p.status='review';p.countryCodes=['IT'];p.continents=['Europe'];p.geographySource='https://example.org/place';
 const compiled=compileRecord({...r,places:[p.id],priority:2},custom);
 assert.equal(compiled.location_info,null);assert.equal(compiled.priority,2);
 assert.deepEqual(compiled.countryCodes,['IT']);assert.deepEqual(compiled.continents,['Europe']);
 p.continents=['Atlantis'];assert.ok(audit(entries,custom).errors.some(e=>e.message==='invalid continent list'));
 p.continents=['Europe'];p.geographySource=null;p.source=null;
 assert.ok(audit(entries,custom).errors.some(e=>e.message.includes('geographic source')));
});
