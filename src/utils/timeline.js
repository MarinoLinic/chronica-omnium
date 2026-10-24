import { ordinalYear, historicalYear } from "./dates.js";
export const colors = {
  "People":"#0d766e", "Society & conflict":"#974437", "Civilizations & institutions":"#616a98", "Ideas & discoveries":"#8b6528", "Earth & life":"#366d84", "Events & culture":"#705679",
  Unit: "#6172b8",
  Person: "#0d766e",
  Event: "#b45309",
  Period: "#7c3aed",
  Climate: "#0369a1",
};
export const colorFor = (type) => colors[type] || "#475569";
export function trackFor(record) {
  if (record.type === "Person") return "People";
  if (["War", "Revolution", "Movement", "Religion"].includes(record.type))
    return "Society & conflict";
  if (["Unit", "Period", "Company"].includes(record.type))
    return "Civilizations & institutions";
  if (
    ["Invention", "Discovery"].includes(record.type) ||
    ["Technology", "Science"].includes(record.field)
  )
    return "Ideas & discoveries";
  if (
    ["Climate", "Species", "Evolution"].includes(record.type) ||
    ["Biology", "Geology", "Astronomy"].includes(record.field)
  )
    return "Earth & life";
  return "Events & culture";
}
export function selectEvents(
  records,
  { start, end, type = "", field = "", query = "" },
) {
  const q = query.trim().toLowerCase();
  return records
    .filter(
      (r) =>
        r.start !== null &&
        r.start <= end &&
        (r.end ?? r.start) >= start &&
        (!type || r.type === type) &&
        (!field || r.field === field) &&
        (!q ||
          `${r.name} ${r.location || ""} ${r.short_desc || ""}`
            .toLowerCase()
            .includes(q)),
    )
    .sort((a, b) => a.start - b.start || a.id_num - b.id_num);
}
export function layoutTimeline(
  records,
  { start, end, orientation = "horizontal", pixels = 1600, grouped = false },
) {
  if (grouped && records.length) {
    const groups = [...new Set(records.map(trackFor))],
      items = [],
      heads = [];
    let lanes = 0,
      base;
    for (const label of groups) {
      base = layoutTimeline(
        records.filter((r) => trackFor(r) === label),
        { start, end, orientation, pixels },
      );
      heads.push({ label, lane: lanes });
      lanes++;
      items.push(...base.items.map((r) => ({ ...r, lane: r.lane + lanes })));
      lanes += base.lanes;
    }
    return {
      ...base,
      items,
      groups: heads,
      lanes,
      width:
        orientation === "horizontal"
          ? pixels + 320
          : Math.max(620, lanes * 260 + 160),
      height:
        orientation === "horizontal"
          ? Math.max(340, lanes * 52 + 150)
          : pixels + 160,
    };
  }
  const min = ordinalYear(start),
    span = ordinalYear(end) - min;
  if (span <= 0) throw new Error("Timeline needs an increasing date range");
  const scale = (year) => ((ordinalYear(year) - min) / span) * pixels;
  const lanes = [];
  const items = records.map((r) => {
    const position = Math.max(0, scale(r.start)),
      finish = Math.min(pixels, scale(r.end ?? r.start));
    const reserve =
      Math.max(finish, position + (orientation === "horizontal" ? 250 : 58)) +
      12;
    let lane = lanes.findIndex((last) => last <= position);
    if (lane < 0) {
      lane = lanes.length;
      lanes.push(reserve);
    } else lanes[lane] = reserve;
    return {
      ...r,
      position,
      length: Math.max(3, finish - position),
      lane,
      clippedStart: r.start < start,
      clippedEnd: (r.end ?? r.start) > end,
    };
  });
  const raw = span / 8,
    power = 10 ** Math.floor(Math.log10(raw)),
    unit = raw / power;
  const step = Math.max(
    1,
    (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power,
  );
  const ticks = [];
  for (let n = Math.ceil(min / step) * step; n <= ordinalYear(end); n += step)
    ticks.push({
      year: historicalYear(n),
      position: ((n - min) / span) * pixels,
    });
  return {
    items,
    ticks,
    lanes: lanes.length,
    width:
      orientation === "horizontal"
        ? pixels + 320
        : Math.max(620, lanes.length * 260 + 160),
    height:
      orientation === "horizontal"
        ? Math.max(340, lanes.length * 52 + 150)
        : pixels + 160,
  };
}
