# Working on Chronica Omnium

Read `README.md`, `data/README.md`, and `docs/HANDOFF.md` before changing the workflow. This is a local-first historical research catalog and a static React website. Keep it understandable without this chat.

## Source of truth

- Edit `data/events/event-NNNN.json`. IDs are permanent. Never derive them from row order, titles, sorting, or array positions. Existing numeric URLs must keep working.
- `data/content/` holds cached Wikipedia text with its provenance. `data/reference/` holds independently reusable places, countries, and time scales. `data/media/manifest.json` connects attributed local assets in `public/media/` to events.
- Never edit `src/generated/` or `public/data/`; `npm run data:build` regenerates them offline. Do not put original spreadsheet exports back into the publishing path.
- Preserve all legacy files in `src/resources/`, including CSV, XLSX, JSON, backup, scripts, and images. `data/migration.json` records the original JSON checksum. Legacy Python scripts are archival and are not the current build pipeline.
- `.local/` is ignored working storage: editor backups, source history, exports, and QA evidence. It must never become a public asset directory. Do not delete user material to tidy the repository.

## Data rules

- Missing information is `null` or an explicit empty list. Keep unnamed, undated, and unfinished records. Do not invent dates, descriptions, countries, or citations to satisfy validation.
- `stub` means unfinished; `review` means imported or needing checks; `ready` means a human/agent has reviewed the sources. Importing or fetching content does not make a record ready.
- Signed historical years: `-1` is 1 BCE, `1` is 1 CE, no year zero. Use shared date helpers. The original year-zero value in event 179 is retained in `legacy.originalStart`; its authored date awaits review.
- `date_kind` distinguishes points, spans, uncertain bounds, and ongoing spans. Never describe an uncertainty interval as an event's duration. `null` end is not automatically present-day.
- A record may have optional named `periods` for lifespan, office terms, active work, or another sourced interval. Keep the original primary dates and their meaning; use `date_label` and `timeline_period` deliberately. Period IDs are stable within the record. Never infer career dates or silently turn an imported office term into a lifespan. All-period charts must count periods separately from unique records and retain the original event links.
- Legacy geocodes are untrusted evidence. Only reviewed place references with a source can supply map coordinates. Do not geocode vague labels or split compound historical labels into modern countries automatically.
- Time scales retain legacy boundaries pending source review. Human periods are regional conventions. Do not quietly rewrite scientific or historical boundaries, resolve overlaps, or claim the lists are authoritative.
- Keep authored source URLs separate from cached article provenance. Respect pinned Wikipedia `oldid` URLs. Never replace a pinned source with today's text silently.
- Network enrichment is explicit: use `sources:sync`. Ordinary development, tests, and production builds must not fetch Wikipedia or run geocoders.
- Retain image license, artist, credit, attribution, source, retrieval time, and checksum. Cache only supported reusable licenses automatically; keep failures visible in reports. Prefer small local assets and preserve remote fallbacks.

## Changes and checks

1. Inspect `git status` and preserve unrelated changes. Make a narrow, reviewable edit.
2. Use `npm run catalog -- find ...` or the local `/catalog` editor to find a record. Use `npm run catalog -- add "Title"` to allocate a new stable ID. Do not reuse an old ID.
3. Run `npm run data:build`, then `npm test` and `npm run build` for changes affecting data or behavior. Avoid starting simultaneous data builds/editor saves while a production build copies public assets.
4. Review desktop and 390px mobile behavior when touching interactions or chart layout. Check BCE/CE boundaries, undated records, point events, uncertain bounds, overlapping spans, empty searches, direct URLs, and both timeline exports.
5. Tests must permit intentional edits and new records. Assert archive preservation and invariants, not frozen counts of incomplete work.
6. Update the nearest README or `docs/HANDOFF.md` with meaningful workflow changes, evidence, remaining problems, and exact commands. Do not put transient logs or unverified claims into durable guidance.

Deployment troubleshooting and annual historical map layers remain separate future work. Do not deploy, change accounts, or add a backend as an incidental part of maintenance.
