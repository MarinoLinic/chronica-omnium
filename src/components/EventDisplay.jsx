import CachedImage from './CachedImage'
import SourceArticle from './SourceArticle'
function PeriodList({event}) {
  if(!event.periods?.length)return null
  return <section className="mt-5 rounded border border-slate-200 p-4 text-left" aria-label="Additional dated periods"><h2 className="text-lg font-bold">Other periods</h2><p className="mt-2 text-sm text-slate-600">These dates describe different parts of the same record. The timeline can show them separately or together.</p><dl className="mt-3 space-y-4">{event.periods.map(p=><div key={p.id}><dt className="font-semibold">{p.label}{event.timeline_period===p.id&&<span className="ml-2 text-xs font-normal">Preferred timeline period</span>}</dt><dd className="mt-1 text-sm">{p.time_start}{p.time_end&&` – ${p.time_end}`}{p.date_kind==='uncertain'&&' · uncertain bounds'}{p.date_note&&<p className="mt-1 text-slate-600">{p.date_note}</p>}{p.source?<a className="mt-1 inline-block underline" href={p.source} target="_blank" rel="noreferrer">Period source ↗</a>:<p className="mt-1 text-amber-800">Source not yet added; needs review.</p>}</dd></div>)}</dl></section>
}
export default function EventDisplay({ event, content }) {
  return <article className="mx-auto w-full max-w-3xl px-4">
    <header className="text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{event.name}</h1>
      {event.date_label && <p className="mt-3 text-sm text-slate-600">{event.date_label}</p>}
      <p className="mt-3 text-xl font-bold blue">{event.time_start}{event.time_end && ` – ${event.time_end}`}</p>
      {event.date_kind === 'uncertain' && <p className="mt-2 text-sm text-amber-800">Uncertain date bounds; this range may not describe a duration.</p>}
      {event.date_note && <p className="mt-2 text-sm text-slate-600">{event.date_note}</p>}
      {event.duration != null && <p className="text-sm text-slate-500">{event.duration.toLocaleString()} years{event.date_kind === 'ongoing' && ` (through ${event.referenceYear})`}</p>}
      <PeriodList event={event} />
      {event.location && <p className="mt-2 text-sm text-slate-500">{event.location}</p>}
      {event.countryNames?.length > 0 && <p className="text-xs text-slate-500">Geographic references: {event.countryNames.join(', ')}</p>}
      <div className="mt-3 flex flex-wrap justify-center gap-2">{[...new Set([event.type, event.field])].filter(t => t && t !== 'Uncategorized').map(tag => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tag}</span>)}</div>
      {event.status !== 'ready' && <p className="mt-3 text-xs text-amber-800">{event.status === 'stub' ? 'Unfinished record. Details will be added later.' : 'Imported record awaiting editorial review.'}</p>}
      {event.short_desc && <p className="mt-4 text-lg leading-relaxed text-slate-700">{event.short_desc}</p>}
      {event.long_desc && event.long_desc !== event.name && event.long_desc !== event.short_desc && <p className="mt-3 text-sm leading-relaxed text-slate-600">{event.long_desc}</p>}
      {(event.image || event.local_image) && <div className="mt-6 flex justify-center"><CachedImage key={event.id} event={event} className="max-h-[420px] max-w-full rounded-xl object-contain shadow-sm" /></div>}
      {event.media_credit && <p className="mt-2 text-xs text-slate-500"><a href={event.media_credit.source} className="underline">Image: {event.media_credit.artist || 'Wikimedia Commons'}</a>{event.media_credit.credit && ` · ${event.media_credit.credit}`} · <a className="underline" href={event.media_credit.licenseUrl || event.media_credit.source}>{event.media_credit.license}</a>{event.media_credit.attribution && ` · ${event.media_credit.attribution}`}</p>}
      {event.image && !event.media_credit && <p className="mt-2 text-xs text-slate-500"><a href={event.image} className="underline">Original image</a> · legacy attribution needs review</p>}
      {event.source && <p className="mt-4 text-sm"><a href={event.source} className="underline blue" target="_blank" rel="noreferrer">Record source ↗</a></p>}
    </header>
    {content !== undefined && <SourceArticle event={event} content={content} />}
  </article>
}
