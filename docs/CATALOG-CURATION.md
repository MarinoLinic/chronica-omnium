# Catalog curation

The Discord intake supplies research leads for events, people and historical states. A link to a country history, list, timeline, general social category or book does not become a catalog event automatically. Important document signings and specific technological developments can qualify when the record dates the action itself.

The private queue is `.local/discord-wikipedia/TODO.md`. Uncertain subjects are in `REVIEW.md`; excluded material and reasons are retained in `excluded.json`. Original messages and provenance remain in ignored `queue.json` and its pre-curation backup. Nothing in that private folder is a public asset. After authoring another batch, `py .local/discord-wikipedia/reconcile.py` refreshes matching and regenerates the curated lists. Do not rerun either completed batch's apply script.

The 24 October curation leaves **376 active candidates**, **288 uncertain subjects**, and **24 period/reference topics** after excluding **812 clear non-candidates**. This is a research queue, not a promise that every remaining title deserves an entry. The complete intake also retains already-added subjects, existing matches and duplicate links.

## Added coverage

The second batch adds **112 records**, `event-0667` through `event-0778`. Together with the first intake batch, the catalog has **778 records**, including **748 dated records**. Attributed source snapshots and lead-image metadata accompany the additions. They remain `review`; a successful Wikipedia fetch does not make the claims independently verified.

| Area | Coverage added in the second batch |
| --- | --- |
| Chinese states | 42 records covering Xia, Shang, Zhou, Xin, the Three Kingdoms, Jin, Northern and Southern dynasties, Sui, Tang, Wu Zhou, the Five Dynasties, all Ten Kingdoms, Liao, Western Xia, Jurchen Jin, Yuan, Western Liao, Northern Yuan and Southern Ming. Qin, Han, Song, Ming and Qing already existed. |
| Indian states | 40 records covering major Magadhan, Deccan, southern, eastern and northern ruling states, five Delhi dynasties, Vijayanagara, the Marathas and the Sikh Empire. Gupta and Mughal records already existed. |
| Battles | 14 selected battles: Marathon, Salamis, Gaugamela, Cannae, Red Cliffs, Tours, Talas, Hastings, Panipat, Plassey, Waterloo, Midway, Stalingrad and Vukovar. |
| Rebellions | Yellow Turban, An Lushan, Red Turban, Taiping, Boxer, Dungan, Nian and White Lotus rebellions, plus the Indian Rebellion of 1857. |
| Other additions | Napoleonic Wars, Crimean War, English Civil War, sealing of Magna Carta, Spanish Inquisition, early Chinese blast furnaces and the spread of iron smelting. |

Dynastic coverage is broad rather than an exhaustive list of every local house, claimant or short-lived regime. The Sixteen Kingdoms, additional Indian regional houses and other possible gaps can be assessed in later curation. Do not force a single national succession where several states overlapped.

Dates describe the selected subject. The medieval Chola state and later Pandya empire are dated as political phases rather than thousands of years of uninterrupted rule. The Delhi Sultanate is an umbrella span; its ruling-dynasty records are phases of the same polity. Western Chalukya and Kakatiya dates distinguish sovereignty from earlier feudatory origins. Han and Tang interruptions have separate periods. Notes retain conflicting chronologies, calendar conversions and approximate foundations. Casualty counts were not inferred from population changes or copied into the new records.

`data/reports/catalog-expansion.json` lists every addition, its source revision, date notes and the 82 existing records whose classifications or date meanings were clarified. Pre-edit files are under `.local/history/curation-2026-10-24/events/`. Stable IDs, original numeric URLs and the original source exports are retained.

## Categories and the time guide

Use **State** for territorial polities, including dynastic states, and **Civilization** for broader cultural groupings. **Dynasty** can describe a ruling house when that is the subject rather than a territorial state. Battles, sieges, campaigns, wars, rebellions and revolutions have separate types. They share the society/conflict chart grouping. These are the existing single type and field classifications, not an additional competing tag database.

`data/reference/time-scales.json` remains a simple rounded guide. Corrections address copied Cenozoic epoch dates, missing zeroes in Paleozoic endpoints, the Prehistory start, Quaternary spelling, metal-age nesting and overlapping Late Antiquity. The late-antique cooling interval now ends around 660, following its defining study. Existing regional examples remain in the reference file but are not multiplied or expanded in the reader. Three regional-range warnings remain because those examples extend beyond their broad parent convention.

The guide labels vary with the visible story. During human history, broader geological ancestors become compact links so the current epoch, human age and century fit together. Its links use the virtual list's single scroll command. The sticky position tracks the toolbar height, including expanded filters. Vertical chart bands are clipped to the selected window, place overlapping age conventions alongside one another and are omitted when too small to label usefully. Centuries cross BCE/CE without a year zero. PNG and SVG include the bands and preserve the reader's shared colors.

## Checks and remaining work

`npm run data:build` and `npm run check` pass: **38 tests**, a production build, offline reproducibility and original archive preservation. Current validation has **zero errors and 451 warnings**. Warnings include outstanding source/date work and are not factual approval.

The larger catalog also produces Vite's advisory for a minified data chunk above 500 kB: approximately 559 kB, or 104 kB gzipped. The build succeeds; this is a future performance consideration as intake continues, not a reason to suppress or delete records.

Desktop and 390px mobile checks cover period jumps, visible-period tracking, the expandable guide, Battle filtering, empty searches, Back to top and page overflow. Horizontal and vertical PNG/SVG exports each retain all 14 selected battle links in their SVG. Final PNG sizes are 3640 × 924 and 2304 × 3320, respectively. Evidence is under `.local/qa/curation-*`.

There are **776 article snapshots** and **754 selected images** after this batch. The 529 existing local image caches remain unchanged; the 195 newer remote image choices have no local byte cache yet. The disk-space limit still makes image caching a separate follow-up. No account, deployment, backend or unrelated file cleanup is part of this work.
