export function imageSources(event, small = false) {
  return [
    ...new Set(
      [
        small ? event.img_sm : event.display_image || event.img_sm,
        event.image,
        event.local_image,
      ].filter(Boolean),
    ),
  ];
}
// Resolve a route's image before committing its text. Aborted navigation never
// replaces a newer page. A bounded wait permits useful offline fallback.
export async function prepareImage(event, signal) {
  const sources = imageSources(event);
  for (const source of sources) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const ok = await new Promise((resolve) => {
      const img = new Image();
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener("abort", abort);
        img.onload = null;
        img.onerror = null;
        resolve(ok);
      };
      const abort = () => finish(false),
        timer = setTimeout(() => finish(false), 5000);
      signal.addEventListener("abort", abort, { once: true });
      img.onload = () => {
        img
          .decode()
          .catch(() => {})
          .then(() => finish(true));
      };
      img.onerror = () => finish(false);
      img.referrerPolicy = "no-referrer";
      img.src = source;
    });
    if (ok) return { ...event, prepared_image: source };
  }
  return { ...event, prepared_image: null, image_failed: true };
}
