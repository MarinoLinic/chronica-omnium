// Historical signed years: -1 is 1 BCE, +1 is 1 CE. Never store year zero.
export const ordinalYear = (year) => (year < 0 ? year + 1 : year);
export const historicalYear = (ordinal) =>
  ordinal <= 0 ? ordinal - 1 : ordinal;
export const elapsedYears = (start, end) =>
  ordinalYear(end) - ordinalYear(start);
export function formatYear(year) {
  if (!Number.isFinite(year)) return "Undated";
  const n = Math.abs(year);
  const scaled =
    n >= 1e9
      ? `${Number((n / 1e9).toPrecision(5))} billion`
      : n >= 1e6
        ? `${Number((n / 1e6).toPrecision(5))} million`
        : n >= 10000
          ? n.toLocaleString("en-US")
          : String(n);
  return `${scaled}${year < 0 ? " BCE" : ""}`;
}
export function relativeAge(
  year,
  viewerYear = new Date().getFullYear(),
  generationYears = 25,
) {
  if (!Number.isFinite(year)) return "";
  const elapsed = elapsedYears(year, viewerYear),
    count = Math.abs(elapsed);
  const direction = elapsed < 0 ? "from now" : "ago";
  const generations = count / generationYears;
  const compact = (n) => n >= 1e6
    ? formatYear(Number(n.toPrecision(3)))
    : Math.round(n).toLocaleString("en-US");
  const generationCount = generations > 0 && generations < 1
    ? "less than 1 generation"
    : `${compact(generations)} ${Math.round(generations) === 1 ? "generation" : "generations"}`;
  return `about ${compact(count)} ${count === 1 ? "year" : "years"} ${direction} · ${generationCount} ${direction}, at ${generationYears} years each`;
}
export function relativeDate(year, viewerYear = new Date().getFullYear(), generationYears = 25) {
  const age = relativeAge(year, viewerYear, generationYears);
  return age ? `${formatYear(year)}${year < 0 ? " (Before Common Era)" : ""}: ${age}` : "";
}
export function resolveDates(record, viewerYear = new Date().getFullYear()) {
  const end = record.date_kind === "ongoing" ? viewerYear : record.end;
  return {
    ...record,
    end,
    referenceYear: viewerYear,
    time_start:
      record.start === null ? "Date not yet added" : formatYear(record.start),
    time_end:
      record.date_kind === "ongoing"
        ? "present"
        : end === null
          ? null
          : formatYear(end),
    duration:
      record.start !== null && end !== null && record.date_kind !== "uncertain"
        ? elapsedYears(record.start, end)
        : null,
    periods: record.periods?.map((p) =>
      resolveDates({ ...p, periods: undefined }, viewerYear),
    ),
  };
}
export const formatRange = (r) =>
  r.start === null
    ? "Date not yet added"
    : `${formatYear(r.start)}${r.date_kind === "ongoing" ? " – ongoing" : r.end !== null ? ` – ${formatYear(r.end)}` : ""}${r.date_kind === "uncertain" ? " (uncertain bounds)" : ""}`;
