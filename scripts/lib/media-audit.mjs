import { commonsFilename } from "./wikimedia.mjs";
export function mediaAudit(entries, manifest, sync = {}, enrichment = {}) {
  const latest = new Map((sync.results || []).map((r) => [r.id, r]));
  const selected = entries.map((e) => ({
    record: {
      ...e.record,
      image: e.record.image || enrichment[e.record.id]?.image?.original,
    },
  }));
  const items = selected
    .filter((e) => e.record.image)
    .map(({ record: r }) => {
      const cached = manifest.items[r.id],
        result = latest.get(r.id);
      const reason = result?.imageError || result?.error || null;
      const status =
        cached?.original === r.image
          ? "cached"
          : !commonsFilename(r.image)
            ? "external"
            : /license requires manual review/i.test(reason || "")
              ? "license-review"
              : /missing/i.test(reason || "")
                ? "missing"
                : reason
                  ? "failed"
                  : "not-cached";
      return {
        id: r.id,
        status,
        original: r.image,
        path: status === "cached" ? cached.path : null,
        reason: status === "cached" ? null : reason,
      };
    });
  const unique = new Map(
    items
      .filter((r) => r.status === "cached")
      .map((r) => [r.path, manifest.items[r.id].bytes]),
  );
  return {
    authoredImages: entries.filter((e) => e.record.image).length,
    selectedImages: items.length,
    wikipediaLeadImages:
      items.length - entries.filter((e) => e.record.image).length,
    counts: items.reduce(
      (counts, r) => ({ ...counts, [r.status]: (counts[r.status] || 0) + 1 }),
      {},
    ),
    uniqueMappedFiles: unique.size,
    uniqueMappedBytes: [...unique.values()].reduce((a, b) => a + b, 0),
    latestPassCompleted: sync.completed === true,
    items,
  };
}
