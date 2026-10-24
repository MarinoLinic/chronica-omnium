# Editing the catalog

The source files here replace the spreadsheet/formula/CSV conversion chain. They are ordinary UTF-8 JSON, readable in a text editor, reviewable in Git, and usable by an agent without spreadsheet access.

## Everyday work

Run `npm ci` once, then `npm run dev`. Open the printed local URL and choose **Catalog & unfinished records**. **Edit locally** opens a form for an existing record. A save validates the complete catalog, backs up the original file under `.local/history/`, saves the source atomically, and rebuilds the public data. The catalog refreshes after saving. Preview opens a new tab; refresh other already-open pages to update their navigation data. The form retains unsaved changes in the current tab's session storage, while a source hash prevents stale saves. Reload from disk explicitly discards the draft.

Use **Create record** in the local catalog to allocate a permanent ID and open an undated stub, or use the CLI:

```powershell
npm run catalog -- add "A historical event"
npm run data:build
```

Refresh the local page to see it. You can also edit its file directly. Adding an incomplete record is valid. New records begin as `stub` with no inferred dates or location.

```powershell
npm run catalog -- find "Rome"
npm run catalog -- show event-0001
npm run data:build
npm test
npm run build
```

The editor exists only in Vite's local development server. A published site has a read-only catalog. There is no hosted editing API, account system, or database.

## Record fields

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Currently `1`. Change with an explicit migration. |
| `id`, `id_num` | Permanent string and numeric identifiers. `event-0001` and `1` refer to the same event. The filename must match `id`. |
| `slug` | Original imported slug, retained as provenance. Not used as the primary key. |
| `name`, `short_desc`, `long_desc` | Authored text. Null means missing. The site shows a clear placeholder for an unnamed record. |
| `start`, `end` | Signed integer historical years, negative for BCE. No year zero. Null means unknown or absent, according to `date_kind`. |
| `date_kind` | `point`: a single date with no end. `span`: a duration with a known end. `uncertain`: possible bounds, not a duration. `ongoing`: explicitly continues through `referenceYear`. |
| `date_note` | Evidence, precision, approximation, or unresolved ambiguity. Large negative years remain approximate historical coordinates, not precise cosmological calendar dates. |
| `date_label` | Optional explanation of what the primary dates mean, such as Lifespan or U.S. presidency. Existing unlabeled dates retain their imported meaning. |
| `periods` | Optional named periods for the same record, each with its own stable local ID, kind, label, dates, date meaning, source, and note. |
| `timeline_period` | Optional preferred additional-period ID. Null or omitted uses the primary recorded dates. It never changes the primary fields or numeric record URL. |
| `type`, `field` | Optional classification. Null is displayed as Uncategorized, never filtered out automatically. |
| `priority` | Optional integer 1–5, with 1 highest. An editorial estimate of prominence in a broad history survey, separate from legacy relevance and source confidence. Null means unassigned. See `docs/PRIORITY.md`. |
| `status` | `stub`, `review`, or `ready`. Ready requires a title, date, and source; factual review is still a person's responsibility. |
| `source` | Authored HTTPS evidence URL. It may differ from the original URL of a cached snapshot; the snapshot carries its own attribution. |
| `image` | Original HTTPS image URL. An authored URL is treated as a deliberate image choice. The reader hotlinks it (or its matching sized thumbnail) first and retains the local cache as fallback. Without an authored image, stored Wikipedia lead-image metadata supplies the choice. |
| `location` | Literal reader-facing place wording. Keep compound and historical labels intact. |
| `places` | List of IDs from `reference/places.json`. Several references can describe one event. |
| `casualties_low`, `casualties_high`, `dubious`, `relevance` | Retained research fields. A legacy dubious flag is a review warning, not a verdict. Casualty figures still require source review. |
| `notes` | Working notes; excluded from public event data. Do not place secrets in project files. |
| `legacy` | Preserved imported metadata, formulas, old dates, slugs, thumbnail URLs, and geocoder output. The website does not publish this object. |

The validator is `scripts/lib/catalog.mjs`. `schema/event.schema.json` is an editor aid with the same required fields; runtime validation also checks coupled IDs, date order, ready-record requirements, references, and unique IDs. Unknown fields, duplicate place IDs, non-text dubious flags, negative or reversed casualty bounds, and malformed reference containers are errors. `relevance` is a nonnegative number or null; casualty counts are nonnegative integers or null. Do not use zero years, empty numeric strings, NaN, or fabricated facts to satisfy required fields. Imported source snapshots permit unknown title/revision/retrieval metadata; fresh MediaWiki snapshots require those provenance fields.

`config.json.referenceYear` is a deterministic build reference, not a live end date. Authored and published ongoing spans retain `end: null`; the reader resolves only `date_kind: "ongoing"` against the viewer’s current year. A missing end on a point stays a point. No annual rebuild is needed to display “present”. Dates are still recorded at year precision.

Date tooltips and the visible event-page estimate use the viewer’s year and 25 years per generation. Scientific ages must state their original reference (for example, calibrated BP relative to 1950) in `date_note`; do not reinterpret BP as the visitor’s present. The legacy generations columns and retained `generationYears` configuration do not override this reader convention.

`short_desc` is an authored, plain-language explanation in one short sentence. Keep pronunciation guides, translated names, biographical date lists and encyclopedia opening formulas out of it. Source-card suggestions need rewriting before publication. `data/reports/reader-summary-review.json` records the 24 October pass across all original records; the underlying article snapshots and source URLs remain separate.

## Lifespan, office, and active work

A single pair of dates cannot describe every aspect of a person. Keep the primary `start`/`end` pair and explain it with `date_label`; add separate periods for other meanings. This also supports several terms in office without treating a gap between terms as continuous service.

```json
{
  "date_label": "Lifespan",
  "periods": [
    {
      "id": "first-term",
      "label": "First term in office",
      "kind": "office",
      "start": null,
      "end": null,
      "date_kind": "point",
      "date_note": "Dates and source still need research.",
      "source": null
    }
  ],
  "timeline_period": "first-term"
}
```

This is a partial illustrative record, with no invented dates. Period kinds are `life`, `office`, `active`, and `other`; the label explains the actual role or activity. Period IDs are stable within the event, must be unique, and are independent of list order. They do not allocate another event ID. An added period uses the same year-zero, date-meaning, and URL rules as a primary date. A record cannot become ready while its additional periods lack dates or sources. An active-work interval needs evidence; never derive it from an arbitrary age or assume it matches employment.

The local editor has **Add period**, per-period sources/notes, and **Preferred timeline period**. Event pages show all periods. The main timeline and context charts can show the preferred period (falling back to primary dates), primary recorded dates, a recorded lifespan (falling back to primary dates), or all periods together. All-period mode counts periods and distinct records separately; every bar still links to the original event. An undated preferred period falls back to primary dates. Unlabeled imported dates are never inferred to be lifespans. Home and catalog continue to display the primary chronology.

`event-0410` is a sourced example: its original 1961–1963 primary interval is labeled U.S. presidency, its canonical name is John F. Kennedy, and a separate lifespan period records 1917–1963 from the [Library of Congress resource guide](https://guides.loc.gov/john-f-kennedy/introduction). The record remains `review`; its original name and all imported information remain in the untouched archive and the pre-edit backup. Several additional office-holders now have separately sourced lifespans. Trump’s second presidency is a separate ongoing period; the intervening gap is retained. Undefined active-work periods are never inferred from age.

## Separate reference datasets

- `reference/time-scales.json`: a simple, approximate geological, archaeological, human-period and climatic guide. The 24 October correction retains the broad original scheme, fixes copied Cenozoic epoch dates and several missing zeroes, makes metal ages peers of Stone Age, and separates overlapping Late Antiquity from its former classical-period parent. Geological bounds were checked against the June 2026 ICS chart without importing its full precision or every substage. Human-period labels remain one broad convention, with regional variation explained; this is not a universal chronology. Nodes with `ongoing: true` resolve to the viewer's year. The stored 2025 end is a deterministic reference, not a forecast. Climatic entries still marked `needs-source-review` retain that limitation. The original unmodified data remains in `src/resources/time_scales.json`; a pre-correction backup is also under `.local/history/curation-2026-10-24/`.
- `reference/countries.json`: 249 ISO alpha-2 geographic references with English labels. This is a lookup, not a historical border database. It does not imply that a modern state existed during an event.
- `reference/places.json`: the 169 original literal labels plus reviewed additions and disambiguated sites. A place may reference several country codes. Empty country lists are intentional until reviewed. There were no populated legacy country fields to migrate.

A place starts as `review` or `non-geographic`. To make a map available, set `status` to `reviewed`, add a source and valid `[latitude, longitude]`, and review `countryCodes`. The point is illustrative; it does not draw historical territory. Do not approve the old first-match geocoder output in bulk. Maps load only when a reader asks for them, and use external OpenStreetMap tiles.

Geographic filtering has its own source-backed review: optional `continents` (the seven reader continent names), `geographyLevel` (`continent`, `region`, `country` or `place`), and `geographySource` accompany `countryCodes`. This does not approve map coordinates. The compiler exposes associated places in `geography`, plus country and continent lists, on each record. Empty lists are intentional for unknown and non-terrestrial subjects. A country locates an associated site or core region in present-day geography; it does not assert historical sovereignty or the full extent of a person, war or empire. Person associations can be broad countries or documented sites, without implying that one point represents an entire life. Do not derive a birthplace from a demonym.

The 24 October reader revision assigns priority to all 778 then-existing records and fills 402 previously missing locations using authored scope, attributed article backgrounds and place-source checks. Ambiguous imported names have specific corrected references where researched, including separate Cambridge entries for Harvard and Keynes. Original records and reference files were backed up under `.local/history/reader-revision-2026-10-24/` and `.local/history/geography-review-2026-10-24/`. The public audit files are `reports/priority-review.json`, `reports/geography-review.json` and `reports/geography-sources.json`. Priority assignments are provisional editorial decisions; geographic associations remain independent of historical fact-checking and coordinate approval. The source-check report retains rejected/superseded links as evidence, separately from the accepted current references.

Public copies of all reference datasets are generated under `public/data/` and end up at `/data/time-scales.json`, `/data/countries.json`, and `/data/places.json`. They can be reused independently of the website. Those generated copies are ignored by Git.

## Article text and images

Legacy text is already local in `content/event-NNNN.json`. Its retrieval date and revision were not recorded, so they remain unknown. The original text also remains in the archived JSON. New fetches use MediaWiki's introductory plain-text extracts and record title, source, revision, revision timestamp, retrieval time, method, and license. Extracts are introductions, not full articles; equations, lists, and some article formats can need manual checking.

Network commands are explicit and resumable:

```powershell
# Refresh one article and cache its image if its license is supported.
npm run sources:sync -- --id 1 --images

# Cache existing authored images without changing article text.
npm run sources:sync -- --all --images --images-only

# Fetch a small batch. --refresh also revisits already cached content.
npm run sources:sync -- --limit 10 --images --refresh
npm run data:build
```

Use `CHRONICA_USER_AGENT` to supply a project identifier and real contact URL/email if the project moves. Requests have timeouts, a host allowlist, response limits, and delays between requests. Transient HTTP 429/502/503/504 and API maxlag/rate-limit responses have at most three attempts with backoff. Retry-After is respected; cooldowns over 60 seconds return a failure for a later manual retry. After three consecutive record failures, the job stops and can be rerun. Each run has an 80 MB new-image budget; rerun to resume after reaching it. Text and image failures are independent, and existing valid content is retained. `data/reports/source-sync.json` records the latest run, selected count, completion state, and per-source failures. A completed pass is not proof that every remote URL works. Exit code 1 indicates at least one failed source, including a deliberately deferred license review.

Pinned `oldid` article sources are left for explicit revision review. External article sources and non-Commons image hosts are not scraped automatically. The tool uses Commons image metadata for fresh thumbnail URLs rather than inventing thumbnail paths. Only recognized CC BY, CC BY-SA, CC0, and public-domain licenses are accepted automatically. Other or missing licenses remain remote and need review.

Images live at content-hashed paths in `public/media/`; `media/manifest.json` stores checksum, size, original URL, thumbnail URL, retrieval time, and full plain-text credit fields. The importer checks supported MIME types against byte signatures; offline builds verify signatures, size, hash, and attribution fields. The site tries a sized remote image first, then the original and local fallback. Existing authored image choices take precedence over fetched Wikipedia lead images. A changed authored URL cannot retain a stale cached mapping. `data/reports/media-audit.json` reconciles every authored image URL and counts unique mapped files/bytes without double-counting shared assets. Old unused cache assets are retained; cleanup needs a deliberate review, not an automatic deletion pass.

To export a cached article offline:

```powershell
npm run content:export -- --id 1
npm run content:export -- --id 1 --html
```

Exports go to ignored `.local/exports/`. The HTML copy has **Print / Save as PDF** and works without Wikipedia. Event pages also offer a Markdown download and browser print. A PDF is a reading copy, not the source of truth.

## Validation and preservation

`data/reports/validation.json` separates errors that block a build from editorial warnings. Missing information remains a warning. Invalid IDs, malformed years, reversed dates, unknown references, unsupported statuses, invalid URLs, or invalid reviewed coordinates block publishing.

`migration.json` identifies all 574 original rows and records checksums of the untouched original JSON and each row. Original CSV/XLSX/JSON, old scripts, images, and the previous JSON backup remain in `src/resources/`. New authored records retain the original ancillary fields under `legacy`; article text was separated into `content/`. The original year-zero value remains in `legacy.originalStart`. Christianity now has a sourced, explicitly approximate first-century origins window, without inventing a year zero or a lifespan for the religion.

Do not run the archival Python conversion or image-fixer against the new catalog. They target the old JSON and can renumber IDs or repeat outdated enrichment.

## Coordinating writes and builds

The supplied CLI add, editor, source sync, data build, and full production build share `.local/catalog.lock`. Conflicting commands fail with a busy message instead of racing public-directory writes. Wait for the current command to finish, then retry. Exited-process locks are archived and recovered; live locks are not stolen based on age. Use `npm run build`, which holds the lock through Vite copying assets, rather than invoking `vite build` directly. Manual edits and Git operations do not acquire this lock; finish running writers first.

Atomic writes use unique temporary filenames and bounded retries for short OneDrive/Windows file holds. On persistent failure, retain the old destination and the temporary file for inspection. A source save followed by a build failure is reported explicitly; repair the error, reload/review the record, and run `npm run data:build` before publishing.

`npm test` prepares generated data automatically. One regression check disables network access and compares successive generated outputs byte for byte. Against the running local server, `npm run editor:check` tests invalid writes and a real temporary author-note edit, checks stale conflict handling and public-note exclusion, and restores the original record in a finally block. Backups remain in `.local/history/`. Do not edit that record concurrently with this check.

## Research cards and Wikipedia lead images

`npm run research -- --id N` stages a source card in `.local/research/<run>/`. `--title "Article"` selects a specific background article independently of the record’s evidence URL. The card records the introduction, complete nested infobox wikitext, Wikidata entity ID when available, revision, retrieval time, and 320/960-pixel lead-image choices. Disambiguation pages fail; a successful redirect still needs semantic review. The La Braña village redirect was rejected during this pass.

`--id N --title "Article" --cache` backs up previous content, writes the attributed snapshot, and stores image choices under `data/enrichment/event-NNNN.json`. It never changes authored dates, source URLs, names, statuses, or custom images. It refuses pinned `oldid` sources. The enrichment schema is validated for identity, source/revision/retrieval provenance, image URLs, and available credit fields. Only this compact publishing metadata is canonical; the staged infobox is research evidence, not a second authoring database.

The image-only source sync also caches eligible lead images for records with no authored image. Manifest matching uses the selected original URL, so a changed choice cannot retain an unrelated local file. Existing original image choices were preserved, except for the user-identified repeated modern-irrigation images on domestication records. Their original URLs remain in the legacy archive and backups.

Research evidence is in `reports/research-review.json` (scoped dates, interpretations and targeted corrections), `reports/summary-research.json` (attributed article matching/retrieval), and `reports/reader-summary-review.json` (authored plain-language summaries). A general background link does not independently verify an imported date. All records remain open to source review; speculative future claims and concepts without defensible absolute dates remain undated. No original record was deleted to reduce warning counts.

Public JSON writes stage temporary bytes under ignored `.local/staging/` and then atomically rename into place. Persistent failures retain that evidence outside publishing directories. The dev server buffers generated JSON responses so cancelled reader requests do not keep a file stream open during editor rebuilds. The editor integration check includes cancelled reads and an exact-restored real public-data replacement.

The compiler publishes the generated JavaScript imports after public detail files. Vite watches these imports so command-line builds update its catalog module without requiring a server restart; refresh a reader page if its current view has not updated. Avoid watching all of `data/` or `public/media/`, which would produce unnecessary reloads during research and caching.
