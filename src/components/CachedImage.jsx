import { useState } from "react";
import { imageSources } from "../utils/images";
export default function CachedImage({ event, className = "", small = false }) {
  const sources = event.image_failed
    ? []
    : event.prepared_image
      ? [event.prepared_image, ...imageSources(event, small)]
      : imageSources(event, small);
  return (
    <ImageAttempt
      key={sources.join("|")}
      sources={sources}
      name={event.name}
      className={className}
    />
  );
}
function ImageAttempt({ sources, name, className }) {
  const [index, setIndex] = useState(0);
  if (!sources[index])
    return <span className="text-xs text-slate-400">Image unavailable</span>;
  return (
    <img
      src={sources[index]}
      alt={name}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIndex((i) => i + 1)}
      className={className}
    />
  );
}
