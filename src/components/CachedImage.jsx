import { useState } from 'react'
export default function CachedImage({ event, className = '', small = false }) {
  const sources = [...new Set([event.local_image, event.img_sm, event.image].filter(Boolean))]
  return <ImageAttempt key={sources.join('|')} sources={sources} name={event.name} className={className} />
}
function ImageAttempt({sources,name,className}) {
  const [index, setIndex] = useState(0)
  if (!sources[index]) return <span className="text-xs text-slate-400">Image unavailable</span>
  return <img src={sources[index]} alt={name} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setIndex(i => i + 1)} className={className} />
}
