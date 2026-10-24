// Development-only fictional examples. These never become catalog records or
// production assets. Open /tests/browser/fixtures.html through npm run dev.
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import CachedImage from '../../src/components/CachedImage'
import TimelineChart from '../../src/components/TimelineChart'
import catalog from '../../src/data'
import '../../src/styles/index.css'
const good = catalog.find(r=>r.local_image).local_image
const missing = '/media/fictional-missing-file.png'
const images = [
  ['Local success',good,missing,missing],
  ['Thumbnail fallback',missing,good,missing],
  ['Original fallback',missing,missing,good],
  ['All images missing',missing,missing,missing],
]
const example = (id,start,end,date_kind='span')=>({id:`fixture-${id}`,id_num:id,name:`Fictional example ${id}`,start,end,date_kind,type:'Event'})
function Fixtures() {
  const [changed,setChanged]=useState(false)
  return <main className="mx-auto max-w-5xl space-y-8 p-4"><h1 className="text-2xl">Fictional browser QA fixtures</h1>
    <div className="grid gap-5 sm:grid-cols-2">{images.map(([name,local_image,img_sm,image])=><section key={name} aria-label={name}><h2>{name}</h2><CachedImage event={{name,local_image,img_sm,image}} className="h-24 max-w-full object-contain" /></section>)}</div>
    <section aria-label="Changed image"><button className="underline" onClick={()=>setChanged(true)}>Change failed image source</button><CachedImage event={{name:'Changed source',local_image:changed?good:missing,img_sm:missing,image:missing}} className="h-24 max-w-full object-contain" /></section>
    <section aria-label="BCE crossing chart"><TimelineChart data={[example(1,-3,2),example(2,-1,null,'point'),example(3,-2,1,'uncertain')]} rangestart={-4} rangeend={3} markerYear={-1} type="Event" title="Fictional BCE crossing" /></section>
    <section aria-label="Empty chart"><TimelineChart data={[]} rangestart={1} rangeend={1} type="Event" title="Fictional empty equal window" /></section>
    <section aria-label="Many rows chart"><TimelineChart data={Array.from({length:180},(_,i)=>example(i+10,1+i,20+i))} rangestart={1} rangeend={220} type="Event" title="Fictional 180 rows" /></section>
  </main>
}
createRoot(document.getElementById('root')).render(<BrowserRouter><Fixtures /></BrowserRouter>)
