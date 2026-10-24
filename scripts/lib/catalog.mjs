import { readFile, readdir, mkdir, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { randomUUID } from "node:crypto";
import { dateDetails, periodKinds } from "../../src/utils/periods.js";
import { formatYear, elapsedYears } from "../../src/utils/dates.js";
import { continents } from "../../src/utils/geography.js";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const at = (...parts) => path.join(ROOT, ...parts);
export const json = async (file) => {
  const raw = await readFile(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`,
      { cause: error },
    );
  }
};
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const content = JSON.stringify(value, null, 2) + "\n";
  try {
    if ((await readFile(file, "utf8")) === content) return;
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const publicRelative=path.relative(at('public'),file);
  const staging=publicRelative&&!publicRelative.startsWith('..')&&!path.isAbsolute(publicRelative)?at('.local/staging'):path.dirname(file);
  await mkdir(staging,{recursive:true});
  const temporary = path.join(staging,`${path.basename(file)}.${randomUUID()}.tmp`);
  await writeFile(temporary, content);
  // OneDrive/Windows scanners can hold the destination briefly. Never fall
  // back to deleting it: retain the temporary file if replacement still fails.
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(temporary, file);
      break;
    } catch (error) {
      if (!["EPERM", "EACCES", "EBUSY"].includes(error.code) || attempt >= 10)
        throw error;
      await new Promise((resolve) => setTimeout(resolve, Math.min(1500,50 * 2 ** attempt)));
    }
  }
}
export async function loadCatalog() {
  const files = (await readdir(at("data/events")))
    .filter((f) => f.endsWith(".json"))
    .sort();
  return Promise.all(
    files.map(async (file) => ({
      file,
      record: await json(at("data/events", file)),
    })),
  );
}
export async function loadReferences() {
  return {
    config: await json(at("data/config.json")),
    places: await json(at("data/reference/places.json")),
    countries: await json(at("data/reference/countries.json")),
    scales: await json(at("data/reference/time-scales.json")),
    media: await json(at("data/media/manifest.json")),
    enrichment: Object.fromEntries(
      await Promise.all(
        (
          await readdir(at("data/enrichment")).catch((e) =>
            e.code === "ENOENT" ? [] : Promise.reject(e),
          )
        )
          .filter((f) => f.endsWith(".json"))
          .map(async (f) => [
            f.slice(0, -5),
            await json(at("data/enrichment", f)),
          ]),
      ),
    ),
  };
}
export const recordFile = (id) => {
  if (!/^event-\d{4,}$/.test(id)) throw new Error("Invalid stable ID");
  return at("data/events", `${id}.json`);
};
export const requiredEventKeys = [
  "schemaVersion",
  "id",
  "id_num",
  "slug",
  "status",
  "name",
  "short_desc",
  "long_desc",
  "start",
  "end",
  "location",
  "type",
  "field",
  "relevance",
  "source",
  "image",
  "casualties_low",
  "casualties_high",
  "dubious",
  "date_kind",
  "date_note",
  "places",
  "notes",
  "legacy",
];
export const eventKeys = [
  ...requiredEventKeys,
  "date_label",
  "periods",
  "timeline_period",
  "priority",
];
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const https = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
};
export function newRecord(entries, name = null) {
  const id_num = Math.max(0, ...entries.map((e) => e.record.id_num)) + 1;
  return {
    schemaVersion: 1,
    id: `event-${String(id_num).padStart(4, "0")}`,
    id_num,
    slug: null,
    status: "stub",
    name,
    short_desc: null,
    long_desc: null,
    start: null,
    end: null,
    location: null,
    type: null,
    field: null,
    relevance: 1,
    priority: null,
    source: null,
    image: null,
    casualties_low: null,
    casualties_high: null,
    dubious: null,
    date_kind: "point",
    date_note: "",
    places: [],
    notes: "",
    legacy: {},
    date_label: null,
    periods: [],
    timeline_period: null,
  };
}
export function validateDateRange(r) {
  const errors = [];
  for (const key of ["start", "end"])
    if (!(r[key] === null || (Number.isSafeInteger(r[key]) && r[key] !== 0)))
      errors.push(
        `${key} must be a signed integer year or null; there is no year zero`,
      );
  if (!(r.end === null || (r.start !== null && r.end >= r.start)))
    errors.push("end requires start and must not precede it");
  if (!["point", "span", "uncertain", "ongoing"].includes(r.date_kind))
    errors.push("invalid date_kind");
  if (r.date_kind === "span" && r.end === null)
    errors.push("a span requires an end");
  if (r.date_kind === "point" && r.end !== null)
    errors.push("a point cannot have an end");
  if (r.date_kind === "ongoing" && (r.start === null || r.end !== null))
    errors.push("ongoing needs a start and no fixed end");
  return errors;
}
export function validatePeriod(p) {
  if (!object(p)) return ["period must be an object"];
  const errors = validateDateRange(p);
  for (const key of Object.keys(p))
    if (
      ![
        "id",
        "label",
        "kind",
        "start",
        "end",
        "date_kind",
        "date_note",
        "source",
      ].includes(key)
    )
      errors.push(`unknown period field ${key}`);
  if (typeof p.id !== "string" || !/^[a-z][a-z0-9-]*$/.test(p.id))
    errors.push("period needs a stable lowercase ID");
  if (typeof p.label !== "string" || !p.label.trim())
    errors.push("period needs a descriptive label");
  if (!periodKinds.includes(p.kind))
    errors.push("period kind must be life, office, active, or other");
  if (p.source !== null && !https(p.source))
    errors.push("period source must use HTTPS or be null");
  if (p.date_note !== null && typeof p.date_note !== "string")
    errors.push("period date_note must be text or null");
  return errors;
}
export function validateRecord(r) {
  if (!r || typeof r !== "object" || Array.isArray(r))
    return ["record must be an object"];
  const errors = [];
  const check = (ok, message) => {
    if (!ok) errors.push(message);
  };
  for (const key of Object.keys(r))
    check(eventKeys.includes(key), `unknown field ${key}`);
  check(r.schemaVersion === 1, "schemaVersion must be 1");
  check(
    /^event-\d{4,}$/.test(r.id),
    "id must be event- followed by at least four digits",
  );
  check(
    Number.isSafeInteger(r.id_num) && r.id_num > 0,
    "id_num must be a positive stable integer",
  );
  check(
    r.id === `event-${String(r.id_num).padStart(4, "0")}`,
    "id and id_num must identify the same record",
  );
  check(
    ["stub", "review", "ready"].includes(r.status),
    "status must be stub, review, or ready",
  );
  for (const key of [
    "slug",
    "name",
    "short_desc",
    "long_desc",
    "type",
    "field",
    "location",
    "source",
    "image",
    "date_note",
    "notes",
    "dubious",
  ]) {
    check(
      r[key] === null || typeof r[key] === "string",
      `${key} must be text or null`,
    );
  }
  errors.push(...validateDateRange(r));
  if (r.date_label !== undefined)
    check(
      r.date_label === null || typeof r.date_label === "string",
      "date_label must be text or null",
    );
  if (r.periods !== undefined)
    check(Array.isArray(r.periods), "periods must be a list");
  const periods = Array.isArray(r.periods) ? r.periods : [];
  for (const p of periods)
    for (const message of validatePeriod(p))
      errors.push(`period ${p?.id || "?"}: ${message}`);
  check(
    new Set(periods.map((p) => p?.id)).size === periods.length,
    "period IDs must be unique within the record",
  );
  if (r.timeline_period != null)
    check(
      typeof r.timeline_period === "string" &&
        periods.some((p) => p?.id === r.timeline_period),
      "timeline_period must reference an additional period ID or be null",
    );
  check(
    Array.isArray(r.places) && r.places.every((p) => typeof p === "string"),
    "places must be an array of reference IDs",
  );
  if (Array.isArray(r.places))
    check(
      new Set(r.places).size === r.places.length,
      "places must not contain duplicates",
    );
  check(object(r.legacy), "legacy must be an object");
  check(
    r.relevance === null ||
      (typeof r.relevance === "number" &&
        Number.isFinite(r.relevance) &&
        r.relevance >= 0),
    "relevance must be a nonnegative number or null",
  );
  check(r.priority == null || (Number.isInteger(r.priority) && r.priority >= 1 && r.priority <= 5), "priority must be an integer from 1 to 5 or null");
  for (const key of ["casualties_low", "casualties_high"])
    check(
      r[key] === null || (Number.isSafeInteger(r[key]) && r[key] >= 0),
      `${key} must be a nonnegative integer or null`,
    );
  if (r.casualties_low !== null && r.casualties_high !== null)
    check(
      r.casualties_low <= r.casualties_high,
      "casualties_low must not exceed casualties_high",
    );
  for (const key of ["source", "image"])
    if (r[key]) {
      check(https(r[key]), `${key} must be an HTTPS URL without credentials`);
    }
  if (r.status === "ready") {
    check(
      Boolean(
        typeof r.name === "string" &&
        r.name.trim() &&
        r.start !== null &&
        typeof r.source === "string" &&
        r.source.trim(),
      ),
      "ready records need a name, date, and source",
    );
    check(
      periods.every((p) => p?.start !== null && p?.source),
      "ready records need dates and sources for every additional period",
    );
  }
  return errors;
}
export function validateContent(c, id) {
  if (!object(c)) return ["snapshot must be an object"];
  const errors = [];
  if (c.schemaVersion !== 1 || c.eventId !== id)
    errors.push("snapshot schemaVersion/eventId does not match its file");
  for (const key of ["source", "license", "text", "method", "status"])
    if (typeof c[key] !== "string" || !c[key].trim())
      errors.push(`snapshot ${key} must be nonempty text`);
  if (c.title !== null && (typeof c.title !== "string" || !c.title.trim()))
    errors.push("snapshot title must be text or null");
  if (!https(c.source)) errors.push("snapshot source must use HTTPS");
  if (!["legacy-html-scrape", "mediawiki-intro-extract"].includes(c.method))
    errors.push("unsupported snapshot method");
  if (!["review", "ready"].includes(c.status))
    errors.push("invalid snapshot status");
  if (
    c.revisionId !== null &&
    (!Number.isSafeInteger(c.revisionId) || c.revisionId <= 0)
  )
    errors.push("invalid snapshot revisionId");
  for (const key of ["fetchedAt", "revisionTimestamp"])
    if (
      c[key] != null &&
      (typeof c[key] !== "string" || !Number.isFinite(Date.parse(c[key])))
    )
      errors.push(`invalid snapshot ${key}`);
  if (
    c.method === "mediawiki-intro-extract" &&
    (!c.title || !c.revisionId || !c.fetchedAt || !c.revisionTimestamp)
  )
    errors.push(
      "fresh extracts require title, revision and retrieval metadata",
    );
  return errors;
}
export function audit(entries, refs) {
  const errors = [],
    warnings = [];
  for (const key of ["places", "countries"])
    if (
      !object(refs?.[key]) ||
      refs[key].schemaVersion !== 1 ||
      !Array.isArray(refs[key][key]) ||
      refs[key][key].some((v) => !object(v))
    )
      errors.push({ id: key, message: `invalid ${key} reference container` });
  if (!object(refs?.scales?.time_scale))
    errors.push({
      id: "time-scales",
      message: "missing time_scale reference container",
    });
  if (
    refs?.config?.schemaVersion !== 1 ||
    !Number.isSafeInteger(refs.config.referenceYear) ||
    refs.config.referenceYear === 0
  )
    errors.push({ id: "config", message: "invalid fixed reference year" });
  if (refs?.media?.schemaVersion !== 1 || !object(refs.media.items))
    errors.push({ id: "media", message: "invalid media manifest container" });
  if (errors.length)
    return { total: entries.length, dated: 0, undated: 0, errors, warnings };
  const ids = new Set(),
    nums = new Set();
  const placeIds = new Set(refs.places.places.map((p) => p.id));
  for (const { file, record: r } of entries) {
    for (const message of validateRecord(r))
      errors.push({ id: r?.id || file, message });
    if (!object(r)) continue;
    if (file !== `${r.id}.json`)
      errors.push({ id: r.id, message: "filename must match stable ID" });
    if (ids.has(r.id) || nums.has(r.id_num))
      errors.push({ id: r.id, message: "duplicate ID" });
    ids.add(r.id);
    nums.add(r.id_num);
    for (const id of Array.isArray(r.places) ? r.places : [])
      if (!placeIds.has(id))
        errors.push({ id: r.id, message: `unknown place ${id}` });
    if (typeof r.name !== "string" || !r.name.trim())
      warnings.push({ id: r.id, code: "missing-name" });
    if (r.start === null) warnings.push({ id: r.id, code: "missing-date" });
    if (!r.source) warnings.push({ id: r.id, code: "missing-source" });
    if (!r.short_desc) warnings.push({ id: r.id, code: "missing-description" });
    const checkText = (value, field = "") => {
      if (field === "legacy") return;
      if (typeof value === "string" && /[\u0080-\u009f\uFFFD]/.test(value))
        warnings.push({ id: r.id, field, code: "possible-encoding-damage" });
      else if (Array.isArray(value))
        value.forEach((v, i) => checkText(v, `${field}.${i}`));
      else if (object(value))
        for (const [key, v] of Object.entries(value))
          if (key !== "legacy") checkText(v, field ? `${field}.${key}` : key);
    };
    checkText(r);
    if (typeof r.dubious === "string" && r.dubious.trim())
      warnings.push({ id: r.id, code: "legacy-dubious" });
    if (r.date_kind === "uncertain")
      warnings.push({ id: r.id, code: "uncertain-date-range" });
    for (const p of Array.isArray(r.periods) ? r.periods : []) {
      if (!object(p)) continue;
      if (p.start === null)
        warnings.push({ id: r.id, period: p.id, code: "missing-period-date" });
      if (!p.source)
        warnings.push({
          id: r.id,
          period: p.id,
          code: "missing-period-source",
        });
      if (p.date_kind === "uncertain")
        warnings.push({
          id: r.id,
          period: p.id,
          code: "uncertain-period-range",
        });
    }
    if (
      r.location &&
      !(
        Array.isArray(r.places) &&
        r.places.some(
          (id) =>
            refs.places.places.find((p) => p.id === id)?.status === "reviewed",
        )
      )
    )
      warnings.push({ id: r.id, code: "unreviewed-place" });
  }
  for (const [id, e] of Object.entries(refs.enrichment || {})) {
    if (
      !ids.has(id) ||
      e?.schemaVersion !== 1 ||
      e?.eventId !== id ||
      !https(e.source) ||
      !Number.isSafeInteger(e.revisionId) ||
      !Number.isFinite(Date.parse(e.fetchedAt))
    )
      errors.push({ id, message: "invalid Wikipedia enrichment provenance" });
    if (e?.image)
      for (const key of ["original", "small", "display"])
        if (!https(e.image[key]))
          errors.push({ id, message: `invalid lead image ${key} URL` });
    if (e?.image?.credit) {
      if (!https(e.image.credit.source))
        errors.push({ id, message: "invalid lead image attribution source" });
      for (const key of [
        "artist",
        "credit",
        "license",
        "licenseUrl",
        "attribution",
      ])
        if (typeof e.image.credit[key] !== "string")
          errors.push({ id, message: `invalid lead image credit ${key}` });
      if (
        e.image.credit.licenseUrl &&
        !https(e.image.credit.licenseUrl.replace(/^http:/, "https:"))
      )
        errors.push({ id, message: "invalid lead image license URL" });
    }
  }
  const countryIds = new Set();
  for (const c of refs.countries.countries) {
    if (
      !/^[A-Z]{2}$/.test(c.code) ||
      countryIds.has(c.code) ||
      typeof c.name !== "string" ||
      !c.name.trim()
    )
      errors.push({
        id: c.code,
        message: "invalid or duplicate country reference",
      });
    countryIds.add(c.code);
  }
  const seenPlaces = new Set();
  for (const p of refs.places.places) {
    if (seenPlaces.has(p.id))
      errors.push({ id: p.id, message: "duplicate place ID" });
    seenPlaces.add(p.id);
    if (
      typeof p.id !== "string" ||
      !p.id ||
      typeof p.label !== "string" ||
      !p.label.trim()
    )
      errors.push({ id: p.id, message: "place needs an ID and label" });
    if (!["review", "reviewed", "non-geographic"].includes(p.status))
      errors.push({ id: p.id, message: "invalid place status" });
    if (
      !Array.isArray(p.countryCodes) ||
      p.countryCodes.some((c) => !countryIds.has(c))
    )
      errors.push({ id: p.id, message: "unknown country code" });
    if (
      p.coordinates !== null &&
      (!Array.isArray(p.coordinates) ||
        p.coordinates.length !== 2 ||
        p.coordinates.some(
          (v) => typeof v !== "number" || !Number.isFinite(v),
        ) ||
        Math.abs(p.coordinates[0]) > 90 ||
        Math.abs(p.coordinates[1]) > 180)
    )
      errors.push({ id: p.id, message: "invalid coordinates" });
    if (p.source !== null && !https(p.source))
      errors.push({ id: p.id, message: "place source must use HTTPS" });
    if (p.continents !== undefined && (!Array.isArray(p.continents) || new Set(p.continents).size !== p.continents.length || p.continents.some(c=>!continents.includes(c))))
      errors.push({id:p.id,message:"invalid continent list"});
    if (p.geographyLevel !== undefined && !['continent','region','country','place'].includes(p.geographyLevel))
      errors.push({id:p.id,message:"invalid geography level"});
    if (p.geographySource != null && !https(p.geographySource))
      errors.push({id:p.id,message:"geography source must use HTTPS"});
    if ((p.countryCodes?.length || p.continents?.length) && !https(p.geographySource || p.source))
      errors.push({id:p.id,message:"country and continent assignments require a geographic source"});
    if (p.status === "reviewed" && (!p.source || p.coordinates === null))
      errors.push({
        id: p.id,
        message: "reviewed places need a source and coordinates",
      });
  }
  for (const [kind, nodes] of Object.entries(refs.scales.time_scale)) {
    if (!Array.isArray(nodes)) {
      warnings.push({ id: kind, code: "time-scale-not-populated" });
      continue;
    }
    const visit = (list, parent) => {
      for (const n of list) {
        if (!object(n)) {
          errors.push({ id: kind, message: "invalid time-scale node" });
          continue;
        }
        if (
          !Number.isFinite(n.start) ||
          !Number.isFinite(n.end) ||
          n.end < n.start
        )
          errors.push({ id: n.name, message: "invalid time-scale range" });
        if (parent && (n.start < parent.start || n.end > parent.end))
          warnings.push({
            id: n.name,
            code: "time-scale-outside-parent",
            kind,
          });
        if (n.color === "#")
          warnings.push({ id: n.name, code: "time-scale-color-unset", kind });
        if (n.sub != null && !Array.isArray(n.sub))
          errors.push({
            id: n.name,
            message: "time-scale sub must be an array",
          });
        else visit(n.sub || [], n);
      }
    };
    visit(nodes);
  }
  for (const [id, m] of Object.entries(refs.media.items)) {
    if (!object(m)) {
      errors.push({ id, message: "invalid media mapping" });
      continue;
    }
    if (!ids.has(id))
      errors.push({ id, message: "media references unknown event" });
    if (
      !https(m.original) ||
      !https(m.remoteThumbnail) ||
      !https(m.credit?.source) ||
      !m.credit?.license
    )
      errors.push({
        id,
        message: "media needs original, thumbnail, source and license",
      });
    for (const key of [
      "artist",
      "credit",
      "license",
      "licenseUrl",
      "attribution",
    ])
      if (typeof m.credit?.[key] !== "string")
        errors.push({ id, message: `media credit ${key} must be text` });
    if (
      m.credit?.licenseUrl &&
      !https(m.credit.licenseUrl.replace(/^http:/, "https:"))
    )
      errors.push({ id, message: "media license URL must use HTTP or HTTPS" });
    if (!Number.isFinite(Date.parse(m.fetchedAt)))
      errors.push({ id, message: "media needs retrieval time" });
  }
  return {
    total: entries.length,
    dated: entries.filter((e) => e.record?.start != null).length,
    undated: entries.filter((e) => e.record?.start === null).length,
    errors,
    warnings,
  };
}
export function compileRecord(r, refs) {
  const end = r.end;
  const places = r.places
    .map((id) => refs.places.places.find((p) => p.id === id))
    .filter(Boolean);
  const reviewed = places.find((p) => p.status === "reviewed" && p.coordinates);
  const lead = refs.enrichment?.[r.id]?.image;
  const selectedImage = r.image || lead?.original || null;
  const useLead = lead?.original === selectedImage;
  const cached = refs.media.items[r.id];
  const media = cached?.original === selectedImage ? cached : null;
  return {
    ...r,
    end,
    image: selectedImage,
    type: r.type || "Uncategorized",
    field: r.field || "Uncategorized",
    priority: r.priority ?? null,
    date_label: r.date_label || null,
    timeline_period: r.timeline_period || null,
    periods: (r.periods || []).map((p) => ({
      ...p,
      ...dateDetails(p, refs.config.referenceYear),
      end: p.end,
    })),
    name: r.name || `Untitled record ${r.id_num}`,
    time_start: r.start === null ? "Date not yet added" : formatYear(r.start),
    time_end:
      r.date_kind === "ongoing"
        ? "present"
        : end === null
          ? null
          : formatYear(end),
    duration:
      r.start !== null && end !== null && r.date_kind !== "uncertain"
        ? elapsedYears(r.start, end)
        : null,
    referenceYear: refs.config.referenceYear,
    location_info: reviewed
      ? {
          coordinates: reviewed.coordinates,
          display_name: reviewed.label,
          reviewed: true,
        }
      : null,
    countryCodes: [...new Set(places.flatMap((p) => p.countryCodes))],
    countryNames: [...new Set(places.flatMap((p) => p.countryCodes))].map(
      (code) =>
        refs.countries.countries.find((c) => c.code === code)?.name || code,
    ),
    continents: [...new Set(places.flatMap(p => p.continents || []))],
    geography: places.filter(p=>p.status !== 'non-geographic').map(p=>({
      id:p.id,label:p.label,level:p.geographyLevel || 'region',
      continents:p.continents || [],countryCodes:p.countryCodes,
      countryNames:p.countryCodes.map(code=>refs.countries.countries.find(c=>c.code===code)?.name || code),
      source:p.geographySource || p.source || null,
    })),
    local_image: media?.path || null,
    media_credit: media?.credit || (useLead ? lead?.credit : null) || null,
    display_image: useLead
      ? lead?.display || null
      : media?.remoteThumbnail || r.image,
    img_sm:
      (useLead ? lead?.small : null) ||
      media?.remoteThumbnail ||
      (r.image === r.legacy?.originalImage ? r.legacy?.img_sm : null) ||
      r.image,
  };
}
