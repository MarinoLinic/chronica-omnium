# Research queue

Audit snapshot: 24 October 2026. These are editorial tasks, not build failures. The completed engineering workflow validates structure and preservation; it does not establish historical truth.

The catalog has 574 records: 455 dated and 119 undated; 455 have `review` status and 119 are `stub`. None is marked `ready`. There are 417 local article snapshots, of which 415 retain the imported extraction and unknown revision/retrieval metadata. The two refreshed introductions remain awaiting review.

## Work in priority order

1. Resolve the year-zero ambiguity in `event-0179` (Christianity) from sources. The canonical date remains null; the exact imported zero survives under `legacy.originalStart` and in the original archive.
2. Review 31 uncertain date intervals before calling any of them durations. Check the 10 legacy dubious flags and 3 possible encoding-damage warnings. Preserve the original wording until evidence supports a correction.
3. Complete records gradually: 119 missing dates, 13 missing names, 154 missing sources, and 389 missing short descriptions. These categories overlap. Do not estimate completion by adding them together.
4. Review places: 362 event records reference unreviewed locations. The 169 literal place references include broad, compound, historical, and non-geographic labels; none currently supplies a reviewed map point. Add source, numeric coordinates, status, and geographic country references deliberately.
5. Source-review the four time-scale groups. Their original conventions, spellings, boundaries, and nesting are retained, including 15 ranges outside a parent and 85 unset colors. Human periods need regional scope and citations. Do not resolve gaps or overlaps by assumption.
6. Review article extraction quality before replacing batches. MediaWiki introductions may handle equations, lists, redirects, and unusual pages differently. Retrieval alone does not make a record or snapshot ready. Pinned Wikipedia revisions need explicit handling.
7. Distinguish primary dates from other biographical periods where useful. The schema and editor now support separately sourced lifespans, terms in office, and active work. Kennedy (`event-0410`) is the first example. Other imported person dates keep their existing meaning until examined; do not assume they all describe lifespans or infer active-work dates from age.

## Image attribution queue

All 419 authored image URLs are reconciled in `data/reports/media-audit.json`: 396 cached mappings, 14 external images needing manual attribution/import, 7 requiring license review, and 2 missing Commons files. The local cache contains 372 unique files totaling 115,056,847 bytes (about 109.7 MiB). Shared images can map to several records.

The missing files concern events 13 and 403. License-review records are 141, 201, 259, 348, 360, 362, and 421. Their metadata labels include GFDL, Attribution, FAL, No restrictions, and Copyrighted free use. Those labels are not a verdict that reuse is forbidden. Inspect the specific source and terms; do not broaden automatic acceptance just to clear the report. Keep the artist, independent credit, attribution, license link, source link, retrieval time, and original URL.

`data/reports/source-sync.json` describes the latest retrieval attempt and completion state. A completed pass means every selected record was attempted, not that every source succeeded. `data/reports/validation.json` is regenerated offline and currently contains 1,181 warnings and no blocking errors. Rebuild after any authored change to get current counts.

## Separate future projects

Deployment troubleshooting, visual redesign, and annual historical map layers remain deferred. Historical layers will need provenance, license, dates, extents, and their own manifest. They should not be inferred from current country codes or stored as ordinary event illustrations.
