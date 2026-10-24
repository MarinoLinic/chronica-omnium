# Chronica Omnium handoff

Updated 24 October 2026. **The local engineering overhaul is complete and verified. Historical research and the explicitly deferred projects remain open.** This file supersedes the interrupted-session handoff, preserved in [archive/HANDOFF-2026-10-23.md](archive/HANDOFF-2026-10-23.md).

Workspace: `C:\Users\marin\OneDrive\Documents\My Programs\chronica-omnium`

Starting commit: `89bfd7e`. All overhaul work remains uncommitted, including the prior session's migration and media cache. No reset, reimport, renumbering, commit, push, deployment, account change, or backend was performed. Preserve this working tree.

## Current workflow

Read `AGENTS.md`, root `README.md`, and `data/README.md`. The source of truth is one JSON file per permanent event ID under `data/events/`. The local catalog form and CLI edit those files; the offline compiler produces the static React reader. Do not edit generated output or use the archived Python pipeline.

```powershell
npm ci
npm run dev
# Open the printed loopback URL, then Catalog & unfinished records.

npm run catalog -- find "Rome"
npm run catalog -- show event-0410
npm run catalog -- add "Title"
npm run data:build
npm run check

# Against a dev server running on port 5173:
npm run editor:check

# Explicit network enrichment only:
npm run sources:sync -- --id 1 --images
npm run sources:sync -- --all --images --images-only
npm run data:build

# Offline reading copies:
npm run content:export -- --id 410
npm run content:export -- --id 410 --html
```

The catalog can create an undated stub, edit an existing record, validate it, retain a backup, check for conflicts, and rebuild. The catalog refreshes after saving; Preview opens a new tab. Refresh other already-open reader pages after edits. Unsaved forms retain a tab-local session-storage draft. Reload from disk discards it. A stale draft cannot bypass the source hash check.

All supplied writer commands share `.local/catalog.lock`, including the full production build. Conflicts fail with a busy message. Live locks are not stolen because they are old. A valid lock whose process has exited is archived before recovery; an unreadable/partial lock requires inspection rather than an unsafe automatic override. Finish writers before manual source edits or Git operations. Use `npm run build`, not a direct `vite build`.

## Engineering completed in this continuation

- Re-established the baseline without restarting migration or discarding uncommitted work.
- Added shared writer locking, unique temporary filenames, bounded retries for short OneDrive/Windows file holds, and explicit saved-but-rebuild-failed responses. Temporary evidence is retained on persistent failure.
- Finished local creation and editing forms, research fields, immutable-ID checks, malformed/unknown-field rejection, optimistic concurrency, backups, draft recovery, and catalog refresh.
- Aligned schema field coverage with runtime validation. Added validation for duplicate place IDs, dubious/relevance/casualty types, malformed reference containers, snapshots, media metadata, and supported byte signatures. Missing facts remain warnings. Fresh source extracts require revision/retrieval metadata; legacy unknowns remain valid.
- Completed the interrupted image-only pass without replacing article text. Added deterministic reconciliation of all authored images, including unique mapped file/byte counts.
- Added bounded HTTP/API retries and Retry-After handling. Long cooldowns fail for a later manual retry. Text and image failures are reported independently. Reports explicitly distinguish a completed selection from successful sources.
- Fixed local/thumbnail/original fallback and reset after an authored image change. Artist, independent credit, attribution, and license remain available on event pages. Some source credit metadata contains Commons maintenance wording; this remains visible rather than silently curated.
- Fixed rapid timeline URL updates, browser Back synchronization, range-slider alignment, right-edge label space, and an exact-millennium BCE divider error. Linear scale and uncertain bounds remain explicit.
- Updated ECharts custom rendering, BCE/CE coordinates without a zero year, point visibility at chart boundaries, context windows, and bounded PNG export. Added reusable fictional browser fixtures for fallback, empty/equal windows, BCE crossing, uncertainty, and large row counts.
- Split catalog data and chart rendering into deliberate chunks. Article text remains per-event; chart/map modules remain lazy. The production catalog has no editing controls or local write endpoint.
- Replaced the obsolete root README, updated the data guide and AGENTS contract, and added architecture decisions and a research queue. No generated Codex memories were edited.

## Multiple periods for one record

The user raised the distinction between a person's lifespan, office terms, and active work. This is implemented through optional `date_label`, `periods`, and `timeline_period` fields. Each additional period has a stable local ID, kind (`life`, `office`, `active`, or `other`), label, its own dates/date meaning, source, and note. The original primary date pair remains intact.

The editor can add several periods and select a preferred timeline period. Event pages show the other periods near the primary dates. The timeline and context charts support preferred dates, primary recorded dates, lifespan where recorded, and all periods together. Fallbacks are explicit. All-period mode counts periods separately from distinct records and retains the same numeric event links. Home/catalog keep the primary chronology. An undefined active period is never derived from an age assumption.

`event-0410` is the first sourced example. Its name is now John F. Kennedy; the original 1961–1963 interval is labeled U.S. presidency. A separate 1917–1963 lifespan cites the Library of Congress resource guide and records the checked exact birth/death dates in its note. The original name and information remain in the untouched original JSON and pre-edit backup. The record is still `review`. No other biographical intervals were inferred in bulk.

## Final verification

Verified on Windows with Node 26.7.0, Vite 6.4.5, and ECharts 6.1.0:

- `npm run check`: **27 tests passed**, then production build passed without oversized-chunk warnings. `npm test` now prepares ignored generated data automatically, so it also works after a clean install.
- Repeated data builds with network access disabled produced identical public summaries, details, reference exports, generated imports, and reports.
- `npm run editor:check`: passed local reads, same-origin rejection, stale conflicts, malformed/immutable fields, backups, no-op save, a real temporary note edit, public-note exclusion, and exact restoration in a finally block. Test backups remain local.
- Browser editor check: loaded Kennedy and its period fields, rejected year zero within the additional lifespan, then saved the restored original value successfully with backup and rebuild.
- `npm audit`: **zero known vulnerabilities** at this check. No dependency changes were made during this continuation.
- `git diff --check`: clean. The original resources and archived Python files have no diff; tests also verify the original JSON checksum and every original row hash.
- Reading-copy commands produced Markdown and standalone printable HTML for events 1 and 410. Kennedy's copy includes both periods and independent period attribution. The HTML needs no external resources. PDF support is browser Print / Save as PDF; no separate PDF engine was added.
- Production write request to `/_local/catalog/event-0001`: HTTP 404. Production catalog exposes neither Create nor Edit controls.

Browser QA used Chromium through the in-app browser at desktop 1280px and mobile 390px. Checked home empty searches and filters, virtualized jump to the 21st century, read-only production catalog and undated filter, numeric/string event URLs, chronological noncontiguous previous/next links, the unresolved year-zero page, and an unnamed record. Checked timeline presets, pan, filters, rapid orientation changes, Back restoring range inputs, empty results, keyboard chart scrolling, BCE/deep-time layouts, and multiple periods sharing one event link. Reviewed both orientations and exports; narrow windows and SVG remain available when full-range PNG text becomes small.

Fictional fixtures confirmed decoded local success, local-to-thumbnail fallback, thumbnail-to-original fallback, all-failed messaging, and recovery after a changed source. Context charts rendered a point, span, uncertain range, BCE/CE crossing, an empty equal window, and 180 rows. PNGs were inspected or checked by decoded dimensions; the large chart export is bounded to 4096px high.

Local QA evidence is ignored under `.local/qa/`, including:

- `kennedy-desktop-final.jpg`, `kennedy-mobile-final.jpg`, `editor-saved.jpg`.
- `kennedy-both-periods.png`: 3640 × 680, both periods on a linear timeline.
- `timeline-horizontal-1900.png` and `.svg`; `timeline-vertical-ancient.png` and `.svg`.
- `context-bce.png`: 696 × 480; `context-empty.png`: 1984 × 480; `context-180-rows.png`: 845 × 4096.

The checked browser fixtures are reproducible at `/tests/browser/fixtures.html` through `npm run dev`; their fictional examples are never catalog records or production assets. Valid record creation is covered by allocator/schema tests and the implemented local POST path; no disposable test record was added to the real permanent catalog merely for QA.

Verification limits: CI targets Node 22/Linux but has not run on GitHub. Firefox/Safari, physical touch hardware, and the operating-system PDF save dialog were not automated. No real map was opened because no place reference is reviewed; strict map parsers and gating are tested. These limits do not turn the retained data into verified research.

## Current data and research boundaries

- 574 original records remain: **455 dated primary records, 119 undated**. There are 455 `review`, 119 `stub`, and zero `ready` records.
- 417 article snapshots remain. Two have live revision metadata from the prior session; 415 retain the original imported extraction. This continuation did not bulk-refresh article text.
- All 419 authored image URLs are reconciled: **396 cached mappings, 14 external, 7 license-review, 2 missing**. The mapped and actual disk cache is 372 unique files / 115,056,847 bytes (about 109.7 MiB).
- The image-only pass reached all 574 selected records. Exit code 1 records expected unsupported licenses/missing files and a transient OneDrive replacement error for event 440; its mapping was persisted by the following successful manifest write. The final offline media audit has no unresolved download-failure category. The original retrieval report retains that error honestly.
- Validation has **zero errors and 1,181 editorial warnings**. Counts are a snapshot, not frozen test expectations.
- Year zero in event 179 remains unresolved; canonical start is null and `legacy.originalStart` retains zero.
- 31 primary uncertain intervals, 10 dubious flags, 3 encoding warnings, 13 missing names, 154 missing sources, 389 missing short descriptions, and 119 missing primary dates remain research tasks. Categories overlap.
- All 169 literal place references remain unreviewed/non-geographic. No old geocode was promoted. Country codes are geographic lookups, not historical sovereignty claims.
- Four imported time-scale groups remain source-unverified, including 85 unset colors and 15 ranges outside their parent. Regional conventions, spelling, gaps, and overlaps are preserved.

See `docs/RESEARCH.md` for the prioritized source-review queue, and `data/reports/validation.json`, `media-audit.json`, and `source-sync.json` for machine-readable evidence. Do not broaden license acceptance or invent dates to clear reports. Article retrieval does not approve records.

## Deliberately deferred work

Deployment troubleshooting, visual redesign, annual historical map layers, and broader historical curation remain separate projects. A sourced review of time scales, biographies, unfinished events, and place references can now proceed through the local workflow. Preserve old assets; there is no automatic cache deletion.

No engineering restart or migration rerun is needed. Begin future work with Git status and the current source files, then use the documented checks appropriate to the change.

The task-created development/preview servers and browser QA tab were stopped after verification. Restart with npm run dev when authoring resumes. No unrelated browser tabs or processes were closed.
