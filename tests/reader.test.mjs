import test from "node:test";
import assert from "node:assert/strict";
import {
  relativeDate,
  relativeAge,
  resolveDates,
  formatYear,
  elapsedYears,
} from "../src/utils/dates.js";
import { imageSources } from "../src/utils/images.js";
import { repairText, repairTree } from "../scripts/lib/text.mjs";
import { infobox, introSummary } from "../scripts/research.mjs";
import {
  compileRecord,
  loadCatalog,
  loadReferences,
  audit,
} from "../scripts/lib/catalog.mjs";
import { layoutTimeline, trackFor } from "../src/utils/timeline.js";
const entries = await loadCatalog(),
  refs = await loadReferences();
test("ongoing dates resolve at reading time while authored/build output remains clock independent", () => {
  const r = {
    ...entries[0].record,
    start: 2000,
    end: null,
    date_kind: "ongoing",
    periods: [],
  };
  assert.equal(compileRecord(r, refs).end, null);
  assert.equal(resolveDates(r, 2031).end, 2031);
  assert.equal(resolveDates(r, 2031).duration, 31);
  assert.equal(resolveDates(r, 2032).time_end, "present");
  assert.equal(r.end, null);
  assert.equal(resolveDates({ ...r, date_kind: "point" }, 2031).end, null);
});
test("reader dates omit positive CE and explain elapsed time without a year zero", () => {
  assert.equal(formatYear(2026), "2026");
  assert.equal(formatYear(-1), "1 BCE");
  assert.match(relativeDate(-1, 1), /about 1 year ago/);
  assert.match(relativeDate(-1000, 2026), /121 generations ago/);
  assert.doesNotMatch(relativeDate(-1000, 2026), /25 years each|Before Common Era/);
  assert.match(relativeDate(2100, 2026), /from now/);
  assert.match(relativeAge(-4250000000, 2026), /170 million human generations ago/);
  assert.match(relativeAge(2025, 2026), /less than 1 generation ago/);
  assert.equal(relativeAge(null, 2026), "");
  assert.doesNotMatch(relativeDate(-1000, 2026), /ancestor|equivalent/);
  assert.equal(elapsedYears(-1, 1), 1);
});
test("images prefer sized remote images and retain independent local/offline fallbacks", () => {
  const r = {
    image: "https://example.org/custom.jpg",
    local_image: "/media/local.jpg",
    img_sm: "https://example.org/320.jpg",
    display_image: "https://example.org/960.jpg",
  };
  assert.deepEqual(imageSources(r, true), [r.img_sm, r.image, r.local_image]);
  assert.deepEqual(imageSources(r), [r.display_image, r.image, r.local_image]);
  const ref = {
    ...refs,
    enrichment: {
      [entries[0].record.id]: {
        image: {
          original: "https://example.org/wiki.jpg",
          small: "https://example.org/small.jpg",
        },
      },
    },
  };
  assert.equal(
    compileRecord({ ...entries[0].record, image: r.image }, ref).image,
    r.image,
  );
});
test("encoding repair recovers reversible punctuation and accents without guessing lost characters", () => {
  assert.equal(repairText("Cretaceous\u0096Paleogene"), "Cretaceous–Paleogene");
  assert.equal(repairText("Slavoj \u008Ei\u009Eek"), "Slavoj Žižek");
  assert.equal(repairText("Ceau?escu"), "Ceau?escu");
  assert.deepEqual(
    repairTree({ name: "a\u0096b", legacy: { name: "a\u0096b" } }),
    { name: "a–b", legacy: { name: "a\u0096b" } },
  );
});
test("research returns the complete nested infobox as unapproved source text", () => {
  const box =
    "{{Infobox person\n|birth_date={{birth date|1900|1|1}}\n|name=Example\n}}";
  assert.equal(infobox("Before " + box + " after"), box);
  assert.equal(infobox("No infobox"), null);
  assert.equal(infobox("{{Infobox unclosed"), null);
  assert.match(
    introSummary(
      "Nicolae Ceaușescu (8 February [O.S. 26 January] 1918 – 25 December 1989) was a Romanian politician. Another sentence.",
    ),
    /Romanian politician\.$/,
  );
});
test("enrichment provenance and image URLs are validated before public compilation", () => {
  const id = entries[0].record.id;
  assert.ok(
    audit(entries, {
      ...refs,
      enrichment: {
        [id]: {
          schemaVersion: 1,
          eventId: id,
          source: "javascript:x",
          image: { original: "javascript:x" },
        },
      },
    }).errors.length,
  );
});
test("subject grouping separates tracks while preserving each bar’s linear position and ID", () => {
  const rows = [
    { id: "a", id_num: 1, name: "Person", start: 1, end: 10, type: "Person" },
    { id: "b", id_num: 2, name: "Event", start: 1, end: 10, type: "Event" },
  ];
  const plain = layoutTimeline(rows, { start: 1, end: 20 }),
    grouped = layoutTimeline(rows, { start: 1, end: 20, grouped: true });
  assert.equal(grouped.groups.length, 2);
  assert.notEqual(grouped.items[0].lane, grouped.items[1].lane);
  assert.equal(grouped.items[0].position, plain.items[0].position);
  assert.deepEqual(
    grouped.items.map((r) => r.id),
    ["a", "b"],
  );
  assert.equal(trackFor(rows[0]), "People");
});
