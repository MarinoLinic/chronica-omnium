# Chronica Omnium

A history of the world, from deep time to the present. A static React reader is built from ordinary local JSON records, attributed article snapshots, and an image cache. Research tools stay under **Tools → Local catalog** (`/catalog`).

## Run locally

Use **Node 24 LTS or newer** and npm. The project’s `.nvmrc` and Linux CI select Node 24; the installed global Node is not changed.

```powershell
npm ci
npm run dev
```

Open the printed loopback URL, normally `http://127.0.0.1:5173`. The first installation needs the package registry. Development, validation, tests, reading-copy exports, and production builds do not fetch historical sources.

## Read and explore

The chronicle has a compact period picker, previous/next period controls, search, and type, field, geography and priority filters. Geography narrows from continent to country to place or region. Priority runs from **1 (highest) to 5 (lowest)** and includes every level by default; a tighter filter includes the chosen level and higher priorities. [The priority method](docs/PRIORITY.md) explains the editorial criteria and limitations.

The list is virtualized and images load lazily in reserved spaces. Hovering, focusing or touching an event link prepares its route, article and selected image in a shared bounded cache. Dates show elapsed years and approximate generations ago, using 25 years per generation; the calculation is explained in Sources. Dates earlier than 10,000 BCE say “human generations” to clarify the comparison. Positive years omit CE; negative years retain BCE. Back to top and Go to bottom work with the virtual list.

The left-hand time guide follows the visible story through geological units, broad archaeological and historical ages, and centuries. It folds away on mobile. The reference JSON supplies the guide colors, subtle chronicle tint and exported vertical age bands. “About these ages” retains the scope and regional qualifications.

Event pages show the article and selected image together after loading. Sources, image credits, geographic evidence, revision/retrieval details and text download are under a closed **Sources & reading copies** disclosure. Uncertainty that affects historical interpretation stays beside the date.

The header keeps the original animated blue/cyan gradient, with reduced-motion support. The original large title and percentage-based Back to Top designs are preserved in [legacy/designs/](legacy/designs/README.md), including a standalone preview. Event pictures retain their size limits without a coloured frame behind them.

`/timeline` supports horizontal and vertical linear charts, subject grouping or chronological packing, filters, presets, pan/zoom, and full-chart PNG/SVG exports. Context charts use the same SVG/export approach and appear only for populated categories in a useful human-history window. Text lists remain available.

Vertical timelines include age bands to the left of the events, including in exports. **Polity** combines states and civilizations; **Organization** combines parties, movements and institutions. The **War** field contains **War** and **Battle** types. Geological and climatic events share **Natural event / Natural history**. Historical and cultural Period entries remain distinct. The [catalog curation notes](docs/CATALOG-CURATION.md) preserve earlier intake coverage; the current [handoff](docs/HANDOFF.md) records the simplified categories.

## Authoring

1. Find an entry in `/catalog` and choose **Edit locally**, or edit `data/events/event-NNNN.json` directly.
2. Save through the form to validate, retain a backup under `.local/history/`, check for conflicts, and rebuild. The catalog refreshes itself; refresh other open reader pages after edits.
3. Use **Create record** or the CLI to allocate the next permanent ID. Never reuse or renumber an ID.
4. Review the evidence before marking a record `ready`. Fetching a summary or image never approves its dates or claims.

```powershell
npm run catalog -- find "Rome"
npm run catalog -- show event-0410
npm run catalog -- add "A historical event"
npm run data:build
npm run check
```

Unsaved forms retain a tab-local draft. Reload from disk discards it; a stale draft cannot bypass the source hash check. Existing numeric links such as `/410` and stable links such as `/event-0410` keep working.

People can have a lifespan, office terms, and other sourced activity periods. Label the primary interval with `date_label`, add named `periods`, and optionally select `timeline_period`. The timeline can show preferred dates, primary dates, lifespans, or every recorded period. Gaps between office terms remain gaps. Dates use signed integer years with no year zero. A null end means present **only** when `date_kind` is `ongoing`; the reader then resolves it using the viewer’s current year. Built data remains clock independent.

## Explicit research and caching

```powershell
# Stage an attributed source card with intro, nested infobox text, Wikidata ID,
# revision metadata, and lead-image choices. No dates or approval are assigned.
npm run research -- --id 410
npm run research -- --title "A specific Wikipedia article"

# Cache a chosen background article while preserving the authored evidence URL.
npm run research -- --id 410 --title "John F. Kennedy" --cache

# Cache eligible image bytes; existing text is untouched in images-only mode.
npm run sources:sync -- --all --images --images-only
npm run data:build
```

Source cards go to ignored `.local/research/`. `--cache` writes attributed introductions to `data/content/` and lead-image metadata to `data/enrichment/`. Infobox values are proposals to inspect, not normalized historical facts. Check redirects, article scope, calendar, precision, qualifiers, and references. Pinned `oldid` sources are never replaced automatically.

Write `short_desc` as one short, plain sentence explaining the person, event or idea. Research-card summaries are drafting aids. Do not copy a Wikipedia opening with pronunciation guides, alternate names, birth dates or lists of titles. Keep uncertainty when it matters; retain the longer attributed background separately.

An authored `image` is a deliberate choice and takes precedence. Otherwise the reader uses the stored Wikipedia lead image. Clear the image field to return to that stored choice. It hotlinks a sized remote image first and retains the original and attributed local cache as fallbacks. The explicit cache command downloads only recognized reusable licenses; external hosts, unsupported licenses, and failures stay in reports. Builds never refresh images. The site’s system fonts work offline; maps load external OpenStreetMap tiles only when requested.

```powershell
npm run content:export -- --id 410
npm run content:export -- --id 410 --html
```

Reading copies go to `.local/exports/`. HTML works offline and offers Print / Save as PDF. Cached source text and image bytes remain available independently of Wikipedia’s availability.

## Checks and repository guide

```powershell
npm run check          # offline data preparation, tests, production build
npm run editor:check   # against a dev server on port 5173; restores its test edit
npm run preview       # inspect dist/
npm audit
```

All supplied writers share `.local/catalog.lock`, including the full production build. Conflicting commands fail clearly; wait and retry. Do not invoke `vite build` directly, remove a live lock, or edit source records while another writer is running. OneDrive file holds get bounded atomic-write retries.

| Location | Purpose |
| --- | --- |
| `data/events/` | Authored records with permanent IDs |
| `data/content/` | Cached article introductions and provenance |
| `data/enrichment/` | Wikipedia lead-image metadata; authored choices override it |
| `data/reference/` | Independent places, countries, and time scales |
| `data/media/manifest.json`, `public/media/` | Attributed local image cache |
| `data/reports/` | Validation, source runs, image reconciliation, research evidence |
| `scripts/` | Offline compiler, editor, CLI, explicit research and exports |
| `src/styles/reader.css` | Shared public-reader theme and responsive layout |
| `src/generated/`, `public/data/`, `dist/` | Generated output; never edit manually |
| `src/resources/` | Untouched original exports, scripts, images, and backups |
| `.local/` | Ignored backups, source cards, exports, and QA evidence |

All 574 original IDs and archive contents are preserved. Archive checks account for Git’s LF/CRLF checkout conversion and still verify every original record hash. Read [AGENTS.md](AGENTS.md), [data/README.md](data/README.md), and [docs/HANDOFF.md](docs/HANDOFF.md) before changing the workflow. [Research notes](docs/RESEARCH.md) distinguish researched corrections from unresolved historical questions.

Deployment troubleshooting and annual historical map layers remain separate work. No account, deployment, or backend change is part of this overhaul.
