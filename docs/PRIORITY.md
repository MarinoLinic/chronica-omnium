# Priority

Priority is an editorial aid for choosing how much of this catalog to read. It estimates how central a subject is to a broad survey of world history, including natural history. **1 is highest and 5 is lowest.** The default reader includes every level. Choosing 2 shows levels 1 and 2; it does not change chronological order.

| Level | Label | Working question |
| --- | --- | --- |
| 1 | Essential | Would a short general history be difficult to explain without this subject or transition? |
| 2 | Major | Does it anchor a major region, era, scientific development or enduring cultural tradition? |
| 3 | Significant | Does it help explain an important national, regional or subject history? |
| 4 | Specialist | Is it mainly useful when exploring a particular country, period, discipline or cultural tradition in depth? |
| 5 | Niche | Is it a small detail, narrow cultural reference, disputed imported claim or speculative scenario outside the main historical narrative? |

Consider four things together: geographic or population reach, lasting consequences, prominence in broad historical accounts, and explanatory value. There is no mechanical weighted score. A major regional civilization can rank above an internationally famous celebrity. Scientific and cultural subjects count alongside politics. A famine or genocide is not a war just because it has casualties.

The first pass on 24 October 2026 uses the authored summaries, cached article backgrounds and editorial judgment. It is a provisional assignment to each existing record, not a fresh bibliometric study, page-view ranking or independent source audit. `data/reports/priority-review.json` records each ID, assigned level, explanation, source and snapshot revision where available. Existing classifications and records are preserved in backups. Publication prominence is inevitably uneven across languages and regions; revise choices when the catalog's coverage improves.

Priority does **not** measure moral worth, suffering, factual certainty, source quality or whether a record is ready. Those remain separate questions. Recent events can move as their long-term consequences become clearer. A low level is not a recommendation to delete a subject. Related records may share a level; duplicate milestones are not silently removed.

Examples: the Industrial Revolution and World War II are level 1; the Tang dynasty and the Indian Rebellion of 1857 are level 2; the Crimean War is level 3; the Battle of Vukovar is level 4; a narrow product-release milestone can be level 5. A book with broad intellectual influence, such as *The Wealth of Nations*, can rank above a less influential book. These examples illustrate editorial scope, not a universal ranking. A future record for the Croatian War of Independence would fit level 3 under this rubric; the current catalog has the separate Vukovar battle entry.

Edit `priority` in an authored event JSON or the local catalog form. It must be an integer 1–5 or null. New records start unassigned. Unassigned records remain in the default view and are excluded by a tighter priority filter. The old `relevance` field is preserved independently and does not supply priority.
