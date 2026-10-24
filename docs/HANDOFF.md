# Chronica Omnium handoff

Updated 24 October 2026. **The engineering overhaul and requested public-reader revision are implemented and verified. Historical source review remains ongoing; it is not represented as finished fact-checking.**

Workspace: `C:\Users\marin\OneDrive\Documents\My Programs\chronica-omnium`

This continuation started from commit `46fc4bf` (`Sol updates`), which already contained the previous overhaul. The earlier handoff is preserved in [archive/HANDOFF-2026-10-24-baseline.md](archive/HANDOFF-2026-10-24-baseline.md); the original interrupted handoff remains in the archive too. Commit `2ff06b9` (`Big update`) contains the broader overhaul; `70d2940` (`One line descriptions`) records the summary/accessibility follow-up. These commits appeared while work was underway. The latest design archive, animated header and image-frame edits remain uncommitted at this check; inspect Git before continuing. The agent did not commit, push, deploy, restart the migration, reset, renumber, delete user material, change accounts or add a backend. Original files under `src/resources/` are unchanged.

## Start here

### Twenty major additions and paper event backgrounds

The latest continuation on 24 October removes the era-colored background from `.chronicle-list`. The chronicle line and time guide retain their era colors. Event backgrounds use the shared paper theme.

Twenty sourced additions, `event-0779` through `event-0798`, bring the catalog to **798 records: 768 dated and 30 deliberately undated**. [MAJOR-ADDITIONS.md](MAJOR-ADDITIONS.md) lists the choices, priorities and claim-specific evidence. `data/reports/major-additions-2026-10-24.json` retains date qualifications, canonical background article identities/revisions, selection reasoning and additional sources. These are editorially selected major gaps, not an objective universal top twenty. All remain `review`; none was promoted merely by fetching Wikipedia. The earlier 778 authored records are byte-identical to the pre-addition baseline retained under ignored `.local/major-additions/`.

The additions include continent-scale migrations, early Vedic and Buddhist traditions, Spanish American independence, the Mexican and Abbasid revolutions, the UN and UDHR, partition of British India, the PRC proclamation, African independence in 1960, medical/industrial/electronic milestones and Soviet dissolution. Thirty-nine sourced place references bring the reference file to 311 entries. Country associations use present-day geography without claiming historical borders. New sites have no invented map coordinates. The ambiguous older Georgia reference is preserved; Soviet dissolution uses a separate Georgia (country) reference. The Cultural Revolution is Event / Politics because its subject is a political and social campaign, not a separate war.

The old priority review report remains the historical 778-record snapshot; the new additions report records the twenty new assignments using the same rubric. The earlier tint guidance below is superseded by this section.

Validation for this continuation: `npm run data:build` and `npm run check` pass, including all **42 tests** and the production build. The catalog has zero validation errors and 875 editorial warnings, including place references awaiting separate map approval. The production catalog chunk is 810.53 kB raw / 128.34 kB gzip and still triggers Vite's 500 kB advisory; it was not hidden or reclassified as an error. Browser checks at desktop and 390px confirm no chronicle background image or horizontal page overflow, retained line/guide colors, new-record geographic and priority filtering, numeric and stable direct URLs, explicit uncertain origins, closed Sources with independent evidence and Wikipedia revision attribution, and successful horizontal SVG / vertical PNG generation with a filtered new war entry in all-period mode. Browser console checks found no warnings or errors. Screenshots are retained under ignored `.local/qa/paper-events-desktop.png` and `paper-events-mobile.png`.

### Reader preloading, simpler categories, geography and priority

The latest reader revision on 24 October supersedes the earlier distinct State/Civilization and conflict-type conventions below. All **778 existing records** have an editorial `priority` from 1 (highest) to 5 (lowest): 98 essential, 365 major, 68 significant, 212 specialist and 35 niche. This is survey prominence, not moral worth, confidence or a measured popularity ranking. [PRIORITY.md](PRIORITY.md) defines the rubric, examples, limitations and editing workflow. The old relevance field is untouched. New records start unassigned. The default reader shows all priorities; a tighter filter includes its threshold and higher priorities. Homepage and timeline filters share this convention, including all-period chart mode.

Polity combines states, civilizations and territorial dynastic subjects. Organization combines movements, parties, factions, institutions and companies. War is a field with War and Battle types; rebellions/revolutions use War, and campaigns/sieges use Battle. Geological/climate subjects use Natural event / Natural history. Cultural and historical Period subjects remain. The Holocaust and Great Famine in Ireland are corrected from War to Event; no dates or primary period meanings were changed. Original classifications are recorded in `data/reports/priority-review.json` and complete pre-edit records are backed up under `.local/history/reader-revision-2026-10-24/`.

The geography pass fills **402 previously missing locations**, leaving **14 unknown or non-terrestrial subjects** explicitly unlocated. Of 778 records, 764 now have associated place wording and 542 have at least one modern-country association. `data/reference/places.json` has 272 references, with sourced continent/country/core-region detail where supported. Modern-country labels locate associated sites and core regions, not historical sovereignty or exhaustive borders. India/China regional cores, separate Cambridge sites, Vukovar, Gori, Wrington, Greenock and several ambiguous article identities received explicit review. Ngandong, Abri du Maras and La Braña use research references where generic village links were missing or misleading. No map coordinates or record-ready statuses were approved. `data/reports/geography-review.json` records changes; `geography-sources.json` records 249 current Wikipedia reference checks with revisions, attribution and separately retained superseded links. The UN M49 reference supports country/region orientation; place sources remain separate. Geography backups are in `.local/history/geography-review-2026-10-24/`.

Public detail and summary data now include priority and associated geography. Continent, country and place/region filters cascade, and combined facets must match the same place association. A person spanning different continents uses separate country associations so, for example, a European filter does not offer the US merely because Paine lived in both countries. Empty geography remains available in the unfiltered reader. Maps still require independent sourced coordinate review.

`src/utils/event-loader.js` shares an in-flight and recently prepared article/image cache between hover, focus, touch and navigation, bounded to 24 entries. `EventLink` also warms the lazy story route. Failed requests are evicted for retry; save-data connections skip speculative loads. Stale navigation completions cannot replace a newer story, while a local editor save clears prepared details. Context SVG links now use client navigation so their preloads survive the transition. The cache is session memory, not a service worker or backend.

The reader opens with “A short history of everything”, without the repeated tagline and subtitles. Event links say “Learn more”. Date tooltips omit the spelled-out BCE expansion and per-generation arithmetic; Sources explains the 25-year convention, while dates before 10,000 BCE say “human generations”. Date buttons have color and focus feedback without underlining. Sources also explains priority in plain language. The Print button is removed; text/CLI reading exports remain. “About these ages” is retained and the redundant approximate-ages note is removed. JSON colors supply guide lines, subtle animated chronicle tint and exported vertical age bands, respecting reduced motion. Go to bottom targets the last virtual item plus the footer, using only the virtualizer; Back to top retains its native-scroll workflow.

Verification: `npm run data:build`, `npm run check` (**42 tests and the production build**) and `npm run editor:check` pass. Validation has zero errors and 853 review warnings; the new associated locations add map-review warnings rather than silently approving coordinates. The archive checks pass, and a semantic comparison of every record against the pre-edit backup permits changes only to priority, type, field, location and places. Dates, sources, article caches, images and legacy objects are unchanged. `git diff --check` passes. Vite retains a size advisory for the static catalog chunk (about 123 kB gzipped); this does not fail the build.

Browser QA covers desktop 1280 × 900 and mobile 390 × 844, combined continent/country/priority filters, cascading place options, India and Croatia examples, empty results, period jumps, age colors, both scroll endpoints, bounded concise date tooltips, numeric/stable record URLs, undated and uncertain records, separate lifespan dates, focus-prepared story/image transitions, and context SVG navigation. Production checks show complete story images and closed Sources on entry, with no horizontal page overflow or application console errors. PNG/SVG generation succeeds in both orientations for a filtered seven-period chart; exported headers retain the filters and the vertical chart has colored age bands. These are generation checks; the in-app browser's download-path callback timed out, so new export files were not independently inspected. Reviewed screenshots are `.local/qa/reader-priority-desktop.png`, `reader-priority-mobile.png` and `reader-ages-desktop.png`. Prior QA counts and export-file inspections in older sections describe their own snapshots.

### Queue curation, catalog expansion and simple time guide

The follow-up adds **112 records**, `event-0667`–`event-0778`, and clarifies 82 existing classifications/date meanings. The current total is **778 records: 748 dated and 30 undated**. It adds 82 Chinese/Indian states or dynastic phases, 14 selected battles, nine rebellions, three wars, the sealing of Magna Carta, the Spanish Inquisition and two ironworking developments. `Unit` is replaced by State or Civilization as appropriate, and battles/rebellions/sieges/campaigns are distinct filter types. Original IDs and archived exports remain intact.

Read [CATALOG-CURATION.md](CATALOG-CURATION.md) for scope, coverage, chronology qualifications, source reports, backups, exact resume commands and remaining gaps. The cleaned private queue has 376 active candidates; 812 clear non-candidates are excluded, 288 doubtful subjects are retained separately, and 24 period/reference topics are routed away from event intake. This supersedes the broad pending list described in the first-batch notes below.

The user explicitly requested **simple, approximate time scales close to the original scheme**, with accuracy improvements rather than many regional medieval/archaeological schemes. The canonical time-scale file now corrects obvious date-copy/zero/nesting errors and cites sources. It retains the rough original boundaries elsewhere. The new left-hand guide follows the visible chronicle story; mobile readers can expand it. Vertical charts include approximate age/century bands in PNG/SVG exports. Source notes and regional qualifications remain concise.

`npm run data:build` and `npm run check` pass with **38 tests**, an offline production build, **zero validation errors and 451 warnings**. Desktop/mobile navigation and four full-chart exports were checked. There are now 776 article snapshots and 754 selected image choices; no new image-byte cache was downloaded. The three remaining regional time-scale range warnings are documented rather than silently resolved into a universal chronology. Use the current curation document rather than the earlier snapshot counts below.

### Discord Wikipedia intake, 24 October 2026

The first intake batch adds **92 new records**, `event-0575`–`event-0666`: 78 people and 14 events, works, or periods. The catalog now contains **666 records, 636 dated and 30 undated**. Every one of the 574 pre-existing authored record files was checked byte-for-byte against its intake baseline and is unchanged.

The private, ignored working queue is `.local/discord-wikipedia/TODO.md`, with structured provenance in `queue.json`. It covers all authors in 32 HISTORY channels plus the supplied archeogenetics channel from the September Discord export. There are **1,817 distinct pasted Wikipedia articles** after normalizing mobile URLs and fragments: 92 added, 193 matched to existing records, 1,527 pending, two alternate links to the same article, two needing identity review, and one Polish article needing language review. The pending list contains surveys, lists, concepts and overlapping subjects as well as suitable future additions; it is not a count of approved new events. Original Discord files were read without modification. Author IDs, message IDs, timestamps and embed text stay in the ignored queue and are not included in published records or reports.

`data/reports/discord-wikipedia-additions.json` records only the added entries and their public Wikipedia revision/date evidence. All 92 have manually authored summaries and attributed introductory snapshots; they remain `review` pending independent claim-specific citations. The total article cache is now **664 snapshots**. Ten people have separate sourced reign/office periods; primary dates are explicitly lifespans. Approximate birth years, Monteverdi's baptism-year start, Old/New Style year differences, Domesday's disputed compilation bounds and fixed-reference climate ages retain explanatory notes. The uncertain Domesday bounds add one intentional validation warning.

The 88 new lead-image choices include attribution metadata, bringing the selected-image total to **647** (419 authored and 228 Wikipedia fallbacks). No new image bytes were downloaded because the disk-space check found approximately 400 MB free. Existing local image caches remain unchanged; the new entries use remote images and do not yet have offline image fallbacks. Once space permits, image-only sync can be limited to the new IDs using `--id` with a comma-separated list and `--limit 92`; do not refresh the entire catalog incidentally.

Resume by reading the private TODO and selecting another reviewed batch. `identities.json` retains the initial live redirect checks; `cards/` holds 105 staged research cards, including deferred candidates and their date problems. `py .local/discord-wikipedia/reconcile.py` refreshes queue matching against the current authored catalog and retains the initial additions. Do not rerun `apply-batch.mjs`: those IDs are already allocated. New batches should use the existing catalog CLI allocator, append their intake evidence, and run the normal offline checks. Never publish the Discord export or private queue as site assets.

Verification for this data-only batch: `npm run data:build`, all **34 tests**, and `npm run build` pass. Validation reports **zero errors and 548 warnings**. Existing archive/ID checks and offline byte-reproducibility checks pass. Reader spot-checks confirmed the new numeric URLs, Ada Lovelace's lifespan/background/image, and Domesday's visible uncertainty explanation with Sources initially closed. The temporary check tab was closed. No interaction or layout code changed.

Read `AGENTS.md`, `README.md`, and `data/README.md`. The source of truth remains one JSON record per permanent ID in `data/events/`. Do not edit `src/generated/`, `public/data/`, or `dist/`.

```powershell
npm ci
npm run check
npm run dev -- --port 5173
# In a second terminal, while that server is running:
npm run editor:check

npm run catalog -- find "Kennedy"
npm run catalog -- show event-0410
npm run catalog -- add "Title"
npm run research -- --id 410
npm run research -- --id 410 --title "John F. Kennedy" --cache
npm run sources:sync -- --all --images --images-only
npm run data:build
```

Use Node 24 LTS or newer. `.nvmrc` and Linux CI select 24; the machine’s global Node was not changed. Current checked direct dependencies include React 19.3.1, React Router 7.18.4, React Virtuoso 4.18.19, Tailwind 4.3.3, and Vite 8.3.5. All direct dependencies were checked against npm’s latest stable versions; `npm outdated --json` returned `{}` and `npm audit` reported zero vulnerabilities. ECharts was removed because the required charts are now small native SVG components.

All supplied writers share `.local/catalog.lock`. Do not overlap editor saves, source sync, data builds, production builds, or manual record edits. A live lock is never removed based on age. Exited-process locks are archived before recovery. Use `npm run build`, not a direct Vite invocation. Refresh existing reader tabs after authored changes; saves do not promise a cross-tab live reload.

## Build failures fixed

The pasted Linux CI failure was the original-archive byte checksum after Git converted CRLF to LF, not a failing historical-data assertion or an obsolete Node runtime. `data/migration.json` now retains the original checksum and an independently recorded LF checksum. Tests check the complete normalized file, allow only those two complete byte forms, and still verify every original record’s hash. No original archive content or expected per-record hash was changed. Canonical/code paths have explicit LF attributes without renormalizing `src/resources/`. The hosted workflow itself was not rerun from this machine because no commit/push was requested.

A separate local `EPERM` replacement failure occurred while a Vite reader request held generated JSON. Stopping that dev server released the hold. The local middleware now reads small public JSON responses into a buffer and closes the file before responding, including aborted requests. The editor integration check now cancels reader requests, performs a real public-data replacement using a visually unchanged trailing space, verifies private notes remain excluded, and restores the exact original record in `finally`.

Atomic JSON replacement allows a bounded roughly nine-second retry for short Windows/OneDrive holds. Public-data temporary writes are staged in ignored `.local/staging/`, so failed temporaries cannot be copied into the production site. Failed-write evidence is retained under `.local/staging/` or `.local/failed-writes/`; it is not automatically deleted. A persistent replacement error still fails clearly rather than overwriting in place or claiming success.

Vite watches generated imports again, so a CLI data build can refresh its catalog module without restarting the server. The compiler publishes these imports only after all public detail files have been written. Canonical data, public outputs, media and ignored working storage remain excluded from file watching to avoid redundant reloads.

## Public reader completed

- The original large title, animated gradient and percentage-based Back to Top are preserved as exact source copies in `legacy/designs/`, with provenance and a standalone preview. The current header reuses the original gradient/timing with current typography and reduced-motion support. Detail images keep their reserved dimensions without the coloured frame. The current instant Back to Top behaviour remains in use.
- Shared warm-paper/system-font theme in `src/styles/reader.css`; Unicode-safe Segoe UI/system sans and Georgia headings. The Google Fonts request was removed.
- Chronicle layout with a continuous line, reserved lazy-image spaces, compact period picker, previous/next period buttons, current-period tracking, search, filters, and a mobile period control. The intrusive horizontal period strip is gone.
- Back to top uses one instant native scroll. The previous native/virtualizer combination was reproduced scrolling back down; desktop QA now reaches `scrollY = 0`.
- `/catalog` remains available under Tools, rather than prominent unfinished-record navigation. The production catalog has no local editing controls.
- Event loading retains the previous complete story while the next JSON and chosen image are prepared. Aborted/stale requests cannot replace a newer story. Initial loads use a loading state; complete failure uses a placeholder or retry message.
- Record/image/text provenance, editorial state, revision/retrieval metadata, period citations, download and print are in the closed Sources disclosure. Scientifically meaningful date uncertainty remains visible. Pure import/precision boilerplate is kept out of the heading.
- Date hover/focus/tap details show elapsed years and generations ago at 25 years each, including BCE. The native `title` was removed so it cannot overlap the custom tooltip. Event pages show the same estimate beneath the date, labelled as the start/earlier bound when appropriate. Positive years omit CE. A mobile tooltip stays within the viewport.
- Main and context charts use native SVG with shared date and bounded image-export helpers. Both main orientations remain linear. Subject grouping and chronological packing are available. Context subject groups include every populated category in the window, including companies, books and organizations; no empty cards are shown. Deep-time entries such as Big Bang have no context charts.
- The chart-engine removal eliminated roughly 510 KB of JavaScript. The expanded catalog remains a deliberate data chunk, with redundant/empty optional summary fields omitted and article bodies fetched separately. With the shorter authored summaries, the final data chunk is about 413 KB raw / 83 KB gzip, below the default chunk-size warning. Vite may print informational plugin-timing diagnostics for copying the local cache on OneDrive.

## Data and source work completed

All **574 original records** remain. All now have names, introductory summaries and source links. There are **544 dated records and 30 deliberately undated concepts, scenarios or unsupported claims**. Every record remains `review`; none was bulk-promoted to `ready`.

All 574 introductory summaries were individually rewritten as short explanations of the subject or event. They do not reuse Wikipedia opening sentences with pronunciation guides, alternate names or birth-date lists. Material uncertainty remains explicit; old unsupported superlatives are not repeated as facts. Earlier authored files are backed up in `.local/history/`. `data/reports/reader-summary-review.json` records each summary hash/source and the spelling corrections Hammurabi and John Maynard Keynes. This prose pass did not change dates or review status.

The 119 previously undated entries received scoped research and interpretation. The user approved Hungarian Revolution of 1956, two separate Chechen-war periods, Cold War nuclear competition, and Buchanan’s 1992 speech. Thirteen unnamed future placeholders now have cautious descriptive names without invented absolute dates or extinction probabilities. General background matches are recorded separately from claim-specific date review.

The date model supports primary labels plus independent lifespan, office, active-work and other periods. Kennedy, several US presidents, Thatcher, Atatürk, Mussolini, Ceaușescu, Tito, Gaddafi and Saddam have explicitly sourced alternatives where researched. Trump’s second presidency is separate from 2017–2021. Two Chechen wars and two Peloponnesian wars retain their gaps. No undefined career interval was guessed from a person’s age.

Piano is an invention point; religion origins use qualified milestones/windows rather than existence bars through 2023. Foundings and first tournaments are points. WHO’s COVID emergency phase ends in 2023 without falsely declaring all COVID/pandemic history over. The Ukraine invasion and checked living biographies have genuine ongoing spans. Authored and built ongoing ends stay null; runtime resolves “present” from the viewer’s year. These static historical facts still need editorial updating when a span actually ends; the clock does not fetch new facts.

Early-human corrections cover taxonomic versus evolutionary meanings of Hominini, disputed Graecopithecus/Sahelanthropus interpretations, Lomekwi/Homo, fire, Jebel Irhoud, Apidima, Ngandong, clothing lice, cave-art minimum dates, Madjedbebe, Neanderthal/Denisovan last appearances, cordage, White Sands, ancestry-group lifespans, horse domestication, Wrangel mammoths, Jiahu and La Braña. Original scientific ages and BP references remain explicit. The doorway/wagon and western-court claims are retained undated rather than silently approved. Clear early science subjects now use Astronomy, Geology or Biology rather than a misplaced Archaeogenetics label.

Reversible Windows-1252 control-character damage was repaired in current text, while original archives and `legacy` objects were preserved. Lost letters were corrected from sources: Niccolò Machiavelli, Nicolae Ceaușescu and Ōkuma. Žižek and the Cretaceous–Paleogene dash render correctly in actual desktop/mobile QA.

Research evidence and remaining qualifications are in [RESEARCH.md](RESEARCH.md), `data/reports/research-review.json`, and `data/reports/summary-research.json`. The latter’s general article links do not certify imported date claims. The unrelated La Braña village redirect was rejected. Pinned Haitian sources and their cached revisions remain intact.

## Explicit enrichment and offline coverage

`scripts/research.mjs` stages attributed Wikipedia introductions, proposed summaries, nested infobox wikitext, Wikidata IDs, revisions and lead-image choices in `.local/research/`. `--cache` updates `data/content/` and `data/enrichment/` after backups, without assigning authored dates, status or custom images. Disambiguation pages fail; semantic redirect review is still necessary. A single title cannot be assigned to `--all`, and pinned `oldid` sources cannot be overwritten.

Before the Discord intake there were **572 article snapshots**: 457 fresh MediaWiki introductions with revision/retrieval metadata and 115 retained legacy extractions. The intake above adds 92 fresh introductions, for **664 total**. Routine startup/tests/builds remain offline. Markdown/HTML reading exports remain available through `content:export` and Sources.

Images now hotlink sized remote choices first, preserving original and local fallbacks. Existing authored images are treated as deliberate choices; Wikipedia lead metadata fills only missing choices. The user-identified repeated irrigation pictures were replaced with topic images, and the originals survive in archives/backups.

There are **647 selected images** after the Discord intake: 419 authored choices and 228 lead-image fallbacks. **529** have matching attributed local caches. The **507 unique mapped files total 160,137,971 bytes**. The earlier completed image-only pass downloaded 47,394,259 bytes without replacing text; the intake adds remote choices without image-byte downloads.

The explicit sync returned exit 1 for unresolved cases: 15 external imports, 12 license reviews, two missing Commons files, and one oversized animated GIF. This is an honest source/cache report, not a production-build failure. Unsupported license labels were not automatically approved or custom images replaced. Inspect `media-audit.json` and `source-sync.json` for exact IDs and reasons. Offline images are not guaranteed for those cases.

## Verification

Verified locally on Windows with Node 26.7.0, using Node 24 as the documented/CI baseline:

- `npm run check`: **34 tests pass and production build passes**. Repeated data compilation with fetch disabled is byte-identical across summaries, details, references, generated imports and reports.
- `npm run editor:check`: passes reads, origin rejection, stale conflicts, malformed/immutable fields, backups, no-op and real saves, cancelled reads, public-data replacement, private-note exclusion, and exact restoration.
- `npm outdated --json`: empty; `npm audit`: zero vulnerabilities.
- Original resources unchanged; original IDs/archive hashes verified. `git diff --check` clean after formatting cleanup.
- Production QA at desktop 1280 × 900 and mobile 390 × 844: period jumps, current period, Back to top, search/empty state, Unicode, date details, closed Sources, no horizontal page overflow, read-only catalog, independent periods, and complete-image story transitions.
- A live transition was observed with the old heading/image still paired and complete while busy, then the new heading/image paired and complete after loading.
- Latest reader checks verify that native date titles are absent, exactly one custom tooltip opens, mobile tooltip bounds remain inside 390px, and event pages display the concise estimate. Swastika's one-liner is a plain explanation rather than the article's pronunciation guide. A temporary whitespace edit built through the CLI reached an already open homepage through HMR; it and the editor integration edit were restored exactly.
- The design-preservation follow-up also passes all 34 tests and the production build. Four archived design files match commit `89bfd7e9f4fa0f730b715d2432d67ad39547738c` byte for byte. Desktop/mobile QA verifies the current gradient animates, the wordmark retains its normal font size, detail-image frames are transparent and bounded, and the standalone legacy Back to Top percentage appears and returns to zero scroll. Evidence includes `legacy-gradient-current-desktop.jpg`, `legacy-gradient-current-mobile.jpg`, `legacy-title-desktop.jpg` and `legacy-back-to-top-desktop.jpg` under `.local/qa/`.
- Horizontal and vertical main PNG/SVG exports include all 156 selected test periods. Verified PNG dimensions: 1967 × 4096 and 4096 × 439; SVG preserves full detail. A crowded vertical chart needs SVG or narrower filters for readable labels, as the UI explains.
- Context PNG/SVG exports pass; the grouped full-window PNG is 982 × 4096. Fictional fixtures pass local/thumbnail/original fallback, exhausted fallback, changed-source reset, BCE crossing, equal/empty window, and 180 rows. The 180-row PNG is bounded at 447 × 4096. These examples never became catalog records.

QA exports and screenshots are in ignored `.local/qa/`, including `overhaul-horizontal.*`, `overhaul-vertical.*`, `overhaul-context.*`, `overhaul-context-grouped.png`, and `overhaul-context-180-rows.png`. Task-generated downloads were moved there by exact returned path; pre-existing downloads were left alone. The local dev server may remain running on 5173 for the user; temporary production QA tabs/server are closed after verification.

## What remains

Engineering requested in this pass is complete. Research remains for claim-specific citations beyond the scoped review, regional domestication/cultural dates, disputed chronology, 10 legacy dubious flags, 115 legacy extracts, unreviewed places, time-scale boundaries, and the specific image cases above. The Discord intake is deliberately a first batch; its remaining candidates are tracked separately in the ignored queue described above. Current validation has **zero errors and 548 warnings**; warnings are not silently cleared or turned into factual approval. Use the research notes and intake queue rather than old missing-field counts as the next research queues.

Deployment troubleshooting and annual historical map layers remain explicitly deferred. Public-reader redesign is no longer deferred because the user requested and authorized it in this continuation.
