export default function SourceArticle({ event, content }) {
  if (!content?.text) return null;
  let text = content.text
    .replace(/^This is an old revision[^\n]*(?:\n|$)/, "")
    .trim();
  if(content.text.startsWith('This is an old revision')) {
    const paragraphs=text.split(/\n\s*\n/),begin=paragraphs.findIndex(p=>p.includes(event.name));
    if(begin>0)text=paragraphs.slice(begin).join('\n\n');
  }
  return (
    <section className="article-body" aria-label="Background">
      <h2>Background</h2>
      {text
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </section>
  );
}
export function Sources({ event, content }) {
  const revision = content?.revisionId
    ? `https://en.wikipedia.org/w/index.php?oldid=${content.revisionId}`
    : content?.source;
  const download = () => {
    const text = `# ${event.name}\n\n${content.text}\n\nSource: ${content.source}\nRevision: ${content.revisionId || "unknown"}\nRetrieved: ${content.fetchedAt || "unknown"}\n${content.license}\n`;
    const url = URL.createObjectURL(
        new Blob([text], { type: "text/markdown;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = `${event.id}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const m = event.media_credit;
  return (
    <details className="sources">
      <summary>Sources & reading copies</summary>
      <div>
        {event.source && (
          <p>
            <a href={event.source} target="_blank" rel="noreferrer">
              Record evidence ↗
            </a>
          </p>
        )}
        {content && (
          <>
            <p>
              Background:{" "}
              <a href={revision} target="_blank" rel="noreferrer">
                {content.title || "Wikipedia"} · source history and contributors
              </a>
            </p>
            <p>
              {content.license}. Retrieved{" "}
              {content.fetchedAt ||
                "at an unknown date in the original catalog"}
              ; revision {content.revisionId || "not recorded"}. Method:{" "}
              {content.method}.
            </p>
            <p>
              <button onClick={download}>Download text</button> ·{" "}
              <button onClick={() => window.print()}>
                Print / Save as PDF
              </button>
            </p>
          </>
        )}
        {m ? (
          <p>
            Image: <a href={m.source}>{m.artist || "Wikimedia Commons"}</a>.{" "}
            {m.credit} <a href={m.licenseUrl || m.source}>{m.license}</a>.{" "}
            {m.attribution}
          </p>
        ) : (
          event.image && (
            <p>
              <a href={event.image}>Original image</a>. Attribution details have
              not been recorded.
            </p>
          )
        )}
        {event.periods?.filter(p=>p.source).map(p=><p key={p.id}>{p.label}: <a href={p.source}>period evidence ↗</a></p>)}
        <p className="editorial-status">Catalog status: {event.status}. {event.date_note}</p>
      </div>
    </details>
  );
}
