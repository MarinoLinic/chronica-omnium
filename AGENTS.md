# Working on Chronica Omnium

Read `README.md`, `data/README.md`, and `docs/HANDOFF.md` before changing the workflow. This is a local-first historical research catalog and a static React website. Keep it understandable without this chat.

## Source of truth

- Edit `data/events/event-NNNN.json`. IDs are permanent. Never derive them from row order, titles, sorting, or array positions. Existing numeric URLs must keep working.
- `data/content/` holds cached Wikipedia text with its provenance. `data/enrichment/` holds attributed lead-image choices and sizes; these never override an authored image. `data/reference/` holds independently reusable places, countries, and time scales. `data/media/manifest.json` connects attributed local assets in `public/media/` to events.
- Never edit `src/generated/` or `public/data/`; `npm run data:build` regenerates them offline. Do not put original spreadsheet exports back into the publishing path.
- Preserve all legacy files in `src/resources/`, including CSV, XLSX, JSON, backup, scripts, and images. `data/migration.json` records the original JSON checksum. Legacy Python scripts are archival and are not the current build pipeline.
- `.local/` is ignored working storage: editor backups, source history, exports, and QA evidence. It must never become a public asset directory. Do not delete user material to tidy the repository.

## Data rules

- Missing information is `null` or an explicit empty list. Keep unnamed, undated, and unfinished records. Do not invent dates, descriptions, countries, or citations to satisfy validation.
- `stub` means unfinished; `review` means imported or needing checks; `ready` means a human/agent has reviewed the sources. Importing or fetching content does not make a record ready.
- Signed historical years: `-1` is 1 BCE, `1` is 1 CE, no year zero. Use shared date helpers. The original year-zero value in event 179 is retained in `legacy.originalStart`; its authored first-century origins window is explicitly approximate.
- `date_kind` distinguishes points, spans, uncertain bounds, and ongoing spans. Never describe an uncertainty interval as an event's duration. `null` end is not automatically present-day. Ongoing spans keep a null end in authored/generated files and resolve to the viewer's current year in the reader. Scientific BP ages retain their fixed reference; date tooltips are separate viewer-relative comparisons.
- A record may have optional named `periods` for lifespan, office terms, active work, or another sourced interval. Keep the original primary dates and their meaning; use `date_label` and `timeline_period` deliberately. Period IDs are stable within the record. Never infer career dates or silently turn an imported office term into a lifespan. All-period charts must count periods separately from unique records and retain the original event links.
- Legacy geocodes are untrusted evidence. Only reviewed place references with a source can supply map coordinates. Do not geocode vague labels or split compound historical labels into modern countries automatically.
- A Wikipedia infobox, redirect, introductory extract, or lead image is research material, not automatic factual approval. Review article identity, date precision, qualifiers and scope. Keep speculative scenarios and concepts undated when no defensible absolute date exists.
- Write `short_desc` as one short, plain explanation of what happened or what the subject is. Rewrite source-card suggestions; do not paste encyclopedia openings with pronunciation guides, alternate names or biographical dates. Keep meaningful uncertainty, and retain attributed article background separately.
- Keep time scales simple and approximate, close to the original broad scheme. Source-backed accuracy corrections are welcome; do not add a proliferation of region-specific medieval or archaeological schemes. Explain that human ages vary by region, retain meaningful overlaps, and preserve the untouched original time scales in `src/resources/`. Geological numbers are rounded orientation bounds, not exact calendar dates.
- Use `Polity` for states, empires, civilizations and territorial dynastic entities. Use `Organization` for parties, movements, factions and institutions. The `War` field contains `War` and `Battle` types: armed rebellions and revolutions use War; campaigns and sieges use Battle. A political or social campaign such as the Cultural Revolution is not automatically a war because of its name. Geological and climatic events use `Natural event` / `Natural history`; historical and cultural periods can remain Period. Keep a subject's identity, date meaning, interruptions and overlaps even when its filter category is simplified. Do not classify famine or genocide as war merely because it has casualties.
- `priority` is an editorial survey prominence level, 1 highest through 5 lowest, independent of legacy `relevance`, moral value and factual confidence. All levels are shown by default. Follow `docs/PRIORITY.md`; new records may remain null until reviewed.
- Place references can have sourced `continents`, `countryCodes`, `geographyLevel` and `geographySource` independently of map approval. Modern-country associations locate places; they do not reconstruct historical borders or certify an exhaustive footprint. Never infer a precise site from nationality. Unknown geography stays empty. Country and continent assignments need a source, while map coordinates still require separate reviewed status.
- The Discord intake is for events, people and historical states. Exclude country-history surveys, lists, timelines, calendar divisions, book titles, generic weapons and social categories from its active TODO. Keep uncertain cases separately for review. Its private provenance and exclusions stay under ignored `.local/discord-wikipedia/`; never publish Discord messages or account identifiers.
- Keep authored source URLs separate from cached article provenance. Respect pinned Wikipedia `oldid` URLs. Never replace a pinned source with today's text silently.
- Network enrichment is explicit: use `research` for attributed source cards/lead images and `sources:sync` for source or image-byte caching. Ordinary development, tests, and production builds must not fetch Wikipedia or run geocoders.
- Retain image license, artist, credit, attribution, source, retrieval time, and checksum. Cache only supported reusable licenses automatically; keep failures visible in reports. The public reader hotlinks sized remote images first and retains attributed local fallbacks. An authored image is a deliberate choice; a fetched Wikipedia lead image supplies only a missing choice. Never replace custom images in bulk.

## Changes and checks

1. Inspect `git status` and preserve unrelated changes. Make a narrow, reviewable edit.
2. Use `npm run catalog -- find ...` or the local `/catalog` editor to find a record. Use `npm run catalog -- add "Title"` to allocate a new stable ID. Do not reuse an old ID.
3. Run `npm run data:build`, then `npm test` and `npm run build` for changes affecting data or behavior. Avoid starting simultaneous data builds/editor saves while a production build copies public assets.
4. Review desktop and 390px mobile behavior when touching interactions or chart layout. Check BCE/CE boundaries, undated records, point events, uncertain bounds, overlapping spans, empty searches, direct URLs, and both timeline exports.
5. Tests must permit intentional edits and new records. Assert archive preservation and invariants, not frozen counts of incomplete work.
6. Update the nearest README or `docs/HANDOFF.md` with meaningful workflow changes, evidence, remaining problems, and exact commands. Do not put transient logs or unverified claims into durable guidance.

Deployment troubleshooting and annual historical map layers remain separate future work. Do not deploy, change accounts, or add a backend as an incidental part of maintenance.

Public-reader conventions: keep authoring/review status and retrieval metadata in Tools or closed Sources disclosures. Keep historically meaningful uncertainty visible beside the dates. Use shared system-font/theme tokens in `src/styles/reader.css`, shared date helpers, and native SVG charts/export helpers. Reserve list-image space and preload a detail image before replacing an already displayed story. Test period navigation and Back to top with the virtual list; do not issue competing native and virtualizer scroll commands.

Reader links share the bounded intent cache in `src/utils/event-loader.js`: pointer hover, keyboard focus and touch can prepare the route, article and image. Navigation ignores stale completions without cancelling a shared preload. Geography filters must match one place association, and priority filters must propagate through all dated-period modes and exports. Test Go to bottom with the virtualizer's final item rather than the current document height.

Keep era colors on the chronicle line and time guide; chronicle event backgrounds use the shared paper theme without an era tint.
