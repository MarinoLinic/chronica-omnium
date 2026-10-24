export default function SourceArticle({ event, content }) {
  if (!content?.text) return <p className="mt-6 text-sm text-slate-500">Article text has not been cached yet.{event.source && <> <a className="underline" href={event.source} target="_blank" rel="noreferrer">Read the source</a>.</>}</p>
  const source = content.source || event.source
  const revision = content.revisionId ? `https://en.wikipedia.org/w/index.php?oldid=${content.revisionId}` : source
  const markdown = `# ${event.name}\n\n${content.text}\n\nSource: ${source}\nRevision: ${content.revisionId || 'unknown (legacy snapshot)'}\nRetrieved: ${content.fetchedAt || 'unknown (legacy snapshot)'}\nMethod: ${content.method}\n${content.license || ''}\n`
  const download = () => {
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `${event.id}.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <section className="mt-10" aria-label="Cached source article">
    <h2 className="text-xl font-bold">From Wikipedia</h2>
    <p className="mt-3 text-xs text-slate-500">Local snapshot · {content.fetchedAt ? `retrieved ${new Date(content.fetchedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'legacy retrieval date unknown'} · <a href={revision} className="underline" target="_blank" rel="noreferrer">{content.revisionId ? `revision ${content.revisionId}` : 'source and contributors'}</a>.{content.method === 'legacy-html-scrape' && ' Imported extraction needs review.'}</p>
    <div className="my-4 flex gap-4 text-sm print:hidden"><button onClick={download} className="underline">Download text</button><button onClick={() => window.print()} className="underline">Print / Save as PDF</button></div>
    <div className="space-y-4">{content.text.split(/\n\s*\n/).filter(p => p.trim()).map((p, i) => <p className="whitespace-pre-line text-base leading-relaxed text-slate-700" key={i}>{p}</p>)}</div>
    <p className="mt-5 text-xs text-slate-500">{content.license || 'See the source for license and attribution.'} Text may have changed since this snapshot. <a href={source} className="underline">Source history and contributors</a>.</p>
  </section>
}
