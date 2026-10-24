# Chronica Omnium

A local historical research catalog and a static React website, from deep time to recent history. The catalog keeps unfinished work alongside dated events. Imported information is preserved; its presence does not mean it has been fact-checked.

## Start locally

Use Node.js 22 or newer and npm. From this directory:

```powershell
npm ci
npm run dev
```

Open the loopback URL printed by Vite, normally `http://127.0.0.1:5173`. Choose **Catalog & unfinished records** to create or edit records. The first install needs the package registry. Development, validation, tests, article exports, and production builds use local files and do not fetch Wikipedia.

## Everyday authoring

1. Find an existing record in `/catalog`, then choose **Edit locally**. The form includes dates, date meaning, editorial status, descriptions, sources, images, research fields, and place references.
2. Save. Validation runs before the source changes. The editor retains a backup under `.local/history/`, checks for conflicting edits, and rebuilds public data. The catalog refreshes itself; Preview opens the rebuilt record in a new tab. Refresh other already-open pages after editing.
3. To add a record, enter an optional title and choose **Create record**. It receives the next permanent ID and starts as an undated `stub`.
4. Review the sources before changing a record to `ready`. Fetching an article or image never approves its historical claims.

Unsaved forms retain a draft in the current browser tab's session storage. Reload from disk discards that draft. A stale draft cannot overwrite a file changed by another editor. Reference datasets remain ordinary JSON files; their structure and review rules are explained in [data/README.md](data/README.md).

People can have several dated periods in one record. Label the primary dates, then use **Add period** for a lifespan, term in office, or active-work interval with its own source. Choose a preferred timeline period without replacing the original dates. Event pages show them together, and timelines can switch between preferred dates, primary dates, lifespan, or all periods. John F. Kennedy is the first sourced example. Other entries retain their existing meaning until reviewed.

Agents and text-editor users can work directly in `data/events/event-NNNN.json`:

```powershell
npm run catalog -- find "Rome"
npm run catalog -- show event-0001
npm run catalog -- add "A historical event"
npm run data:build
npm run check
```

IDs are permanent. Existing numeric links such as `/1` remain supported, as do `/event-0001` links. Missing names, dates, and sources are retained as explicit unfinished work. Signed years use `-1` for 1 BCE and `1` for 1 CE, with no year zero. Uncertain date bounds are distinct from durations; an absent end date does not imply an ongoing event.

## Sources, images, and reading copies

Network enrichment is a separate, explicit command:

```powershell
npm run sources:sync -- --id 1 --images
npm run sources:sync -- --all --images --images-only
npm run data:build
```

Article snapshots retain their own source and revision metadata. Pinned Wikipedia revisions are left for manual review. Automatic image caching accepts only the documented reusable-license subset, records attribution and checksums, and keeps remote fallbacks. Unsupported sources, licenses, and missing files remain visible in reports. A full article refresh is a research operation, not routine maintenance.

```powershell
npm run content:export -- --id 1
npm run content:export -- --id 1 --html
```

Reading copies go to `.local/exports/`. The HTML copy works offline and offers browser **Print / Save as PDF**. Event pages also provide text download and print. Cached images load locally first; remote fallbacks and explicitly requested OpenStreetMap tiles can use the network.

## Timelines and checks

`/timeline` has horizontal and vertical linear timelines, date presets, pan/zoom, filters, keyboard-scrollable chart regions, and text links. URLs retain the chosen window and filters. PNG and SVG exports include the full filtered chart. PNG dimensions are bounded to protect browser memory; SVG preserves full resolution for crowded windows. Event pages load context charts on demand and can export those charts as PNG.

```powershell
npm run check         # offline preparation, tests, then production build
npm run dev -- --port 5173
npm run editor:check  # against the running local server; restores its test edit
npm run preview      # inspect the generated dist/ website
npm audit
```

The compiler rejects structural errors and emits research warnings in `data/reports/validation.json`. The suite checks archive preservation, IDs, dates, references, snapshots, image signatures, timeline layout, writer locking, and repeated offline builds. CI uses Node 22 on Linux; see [.github/workflows/validate.yml](.github/workflows/validate.yml). Local verification and its limits are recorded in [docs/HANDOFF.md](docs/HANDOFF.md).

All supplied writer commands share `.local/catalog.lock`, including the complete production build. A conflicting command fails clearly and can be retried. Do not start `vite build` directly or manually edit source files while another writer is running. Locks from exited processes are retained as abandoned-lock evidence and recovered automatically. Do not remove a live lock.

## Repository guide

| Location | Purpose |
| --- | --- |
| `data/events/` | Authored records, one permanent ID per file |
| `data/content/` | Cached article text and provenance |
| `data/reference/` | Places, countries, and time scales |
| `data/media/manifest.json`, `public/media/` | Attributed local image cache |
| `data/reports/` | Validation, latest source run, and complete image reconciliation |
| `scripts/` | Current offline compiler, authoring CLI, local editor, source sync, and reading exports |
| `src/` | Static React reader, catalog, and charts |
| `src/generated/`, `public/data/`, `dist/` | Generated output; do not hand-edit |
| `src/resources/` | Preserved original spreadsheet-era files and scripts |
| `.local/` | Ignored backups, exports, and QA evidence; never a publishing directory |

The archived JSON and its per-row hashes are recorded in `data/migration.json`. Do not rerun migration, renumber records, or use the archival Python scripts against the new catalog. Keep all original files, including incomplete records and legacy geocoder output. Old geocodes are quarantined until references are independently reviewed.

Read [AGENTS.md](AGENTS.md) before changing the workflow. [Architecture decisions](docs/DECISIONS.md) explain the local/static approach. [Research queue](docs/RESEARCH.md) distinguishes unfinished source work from engineering. Deployment troubleshooting, visual redesign, and annual historical map layers remain separate future work.
