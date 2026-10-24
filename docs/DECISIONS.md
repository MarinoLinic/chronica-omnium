# Architecture decisions

Updated 24 October 2026.

## Local files and a static reader

The catalog is small enough for one JSON file per record. These files work in a text editor, the loopback-only form, Git, and future agent sessions. They replace the spreadsheet/formula/export/conversion chain without introducing a database, login service, hosted write endpoint, or CMS. References and source snapshots remain reusable outside React.

The offline compiler validates the complete catalog before writing public output. A lean summary supports navigation and search; detailed text is fetched per event. Charts, map code, and images load when needed. This preserves a static publishing target and keeps large article text out of the initial JavaScript.

## Identity and preservation

IDs derive from the existing numeric IDs, not row order, sorting, or titles. New IDs are allocated above the current maximum while holding the writer lock. Neither incomplete records nor old URLs disappear when the catalog changes. No deletion workflow is provided. The migration manifest and tests verify the untouched original JSON and every original row hash; all other original resources remain archived in place.

Dates use signed integer years without year zero. Shared helpers calculate elapsed time across BCE/CE. Date meaning is explicit: point, span, uncertain bounds, or ongoing. Ongoing records retain a null end in build output and resolve to the viewer’s current year at runtime, as requested. The build stays reproducible while “present” stays current. Scientific BP dates keep their original fixed reference. Ambiguous imported values remain documented for research.

Optional named periods resolve the distinction between a person's lifespan, office terms, and active work. The original date pair remains primary; additional periods carry independent dates, meaning, notes, and sources. A preferred-period pointer controls a timeline projection rather than rewriting the original record. All-period views draw distinct bars but retain one record identity and URL. No role or lifespan is guessed from the imported title or dates.

## Enrichment is explicit

Network sync is never part of development startup, tests, or builds. Fresh extracts retain revision metadata; imported extracts retain unknown provenance fields honestly. Authored evidence URLs and snapshot provenance are separate. A pinned `oldid` URL cannot be silently replaced with current text.

Images are immutable content-hashed files with independent attribution, retrieval time, byte count, and checksum. Automatic imports use a conservative license subset and bounded network requests. Other licenses remain research tasks. Cache cleanup is deliberately absent. Failed text retrieval does not prevent an independent image attempt.

## Reviewed geography

Legacy first-match geocoder output is unreliable and preserved only as evidence. Coordinates enter the map through reviewed place references with a source. Modern country codes are geographic lookups, not assertions about historical sovereignty. Map tiles are external and load only on request. Annual historical layers require a separate sourced dataset later.

## Single-writer workflow

Editor saves, ID allocation, source sync, data compilation, and the whole production build share a local exclusive lock. Conflicts fail clearly. Live locks have no age-based expiry; exited-process locks are archived before recovery. Atomic JSON writes use unique temporary names and a bounded retry for short Windows/OneDrive file holds. Permanent replacement failure retains the temporary file and reports the error.

The lock coordinates supplied commands, not arbitrary text editors or Git operations. Stop writers before manual source edits. Source sync can hold the lock for several minutes. Public generation is repeatable rather than transactional across all files: failed builds must be repaired and rerun before publishing. The editor reports separately if the authored save succeeded but rebuilding failed, and retains the saved version token for recovery.

Unsaved browser forms retain a tab-local draft, and all writes still require the current source hash. File saves keep backups; reference curation stays file-based because it requires deliberate source review rather than another generic form.

## Reader and chart design

The public site is a chronicle for readers. The catalog remains accessible under Tools and at `/catalog`; editorial state and retrieval details live in closed Sources disclosures. Historical uncertainty remains visible. The home list retains virtualization and lazy images, with reserved image dimensions, a continuous chronology line, and compact period navigation. Back to top uses an instant native scroll; asking the virtualizer to scroll to its first row too caused a competing scroll back down.

Native SVG now draws both main and context timelines. These charts need linear spans, points, uncertain bounds, labels, links, and an optional focus marker. A general chart engine added about 510 KB of JavaScript without improving those requirements, so ECharts was removed. Both orientations and context charts share the same bounded PNG/SVG export helper. Subject tracks separate people, institutions, society/conflict, discoveries, and events without changing elapsed-time positions. Chronological packing remains an option.

Existing authored images are treated as deliberate choices because the old pipeline did not reliably distinguish custom from automatic choices. A stored Wikipedia lead image supplies only missing choices. Sized remote images load first; local attributed bytes provide offline fallbacks. The specific repeated irrigation images flagged by the user were replaced, with their originals preserved in archives/backups. Image and text research remain explicit; no runtime Wikipedia API requests are needed.

The toolchain uses Node 24 LTS as its supported baseline, current stable direct dependencies, React, and Vite 8. Rolldown chunk configuration replaces the old Rollup callback. Archive preservation checks verify both a complete LF-normalized checksum and each original record hash, accepting only the recorded LF/CRLF file forms. This fixes Linux CI without weakening content checks or rewriting the original archive.
