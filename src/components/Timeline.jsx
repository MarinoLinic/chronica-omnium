import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import data from "../data";
import SiteHeader from "./SiteHeader";
import { selectEvents, layoutTimeline, colorFor,trackFor } from "../utils/timeline";
import { formatYear, ordinalYear, historicalYear } from "../utils/dates";
import { exportTimeline } from "../utils/export-image";
import { timelinePeriods, dateModes } from "../utils/periods";
import timeScales from "../generated/time-scales.json";
import { timeBands } from "../utils/time-scales";
import TimeScaleBands from "./TimeScaleBands";

const viewerYear = new Date().getFullYear();
const presets = [
  ["Recent centuries", 1700, viewerYear],
  ["Common Era", 1, viewerYear],
  ["Ancient world", -4000, 500],
  ["Human history", -10000, viewerYear],
  ["Deep time", -13800000000, viewerYear],
];
const types = [...new Set(data.map((r) => r.type))].sort(),
  fields = [...new Set(data.map((r) => r.field))].sort();
const control = "rounded border border-slate-300 bg-white px-3 py-2 text-sm";
const validYear = (n) => Number.isSafeInteger(n) && n !== 0;
export default function Timeline() {
  const [params, setParams] = useSearchParams(),
    navigate = useNavigate(),
    location = useLocation();
  const from = Number(params.get("start") || 1700),
    to = Number(params.get("end") || viewerYear);
  const start = validYear(from) && validYear(to) && from < to ? from : 1700,
    end = validYear(from) && validYear(to) && from < to ? to : viewerYear;
  const orientation =
    params.get("view") === "vertical" ? "vertical" : "horizontal";
  const query = params.get("q") || "",
    type = params.get("type") || "",
    field = params.get("field") || "";
  const grouped = params.get("layout") !== "packed";
  const dateMode = Object.hasOwn(dateModes, params.get("dates"))
    ? params.get("dates")
    : "preferred";
  const [startInput, setStartInput] = useState(String(start)),
    [endInput, setEndInput] = useState(String(end)),
    [pixels, setPixels] = useState(1500),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setStartInput(String(start));
    setEndInput(String(end));
  }, [start, end, location.key]);
  const svgRef = useRef(null),
    scroller = useRef(null);
  const [exported, setExported] = useState(null);
  useEffect(
    () => () => {
      if (exported) URL.revokeObjectURL(exported.url);
    },
    [exported],
  );
  // History is updated synchronously, while React may still be rendering the
  // previous search params. Start each rapid control change from that history.
  const update = (changes) => {
    const next = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(changes)) {
      if (v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: Object.hasOwn(changes, "q") });
  };
  const range = (s, e) => {
    setStartInput(String(s));
    setEndInput(String(e));
    setMessage("");
    update({ start: s, end: e });
    scroller.current?.scrollTo({ top: 0, left: 0 });
  };
  const move = (pan, zoom = 1) => {
    const a = ordinalYear(start),
      b = ordinalYear(end),
      span = b - a,
      middle = (a + b) / 2 + span * pan,
      half = Math.max(1, span * zoom) / 2;
    range(
      historicalYear(Math.floor(middle - half)),
      historicalYear(Math.ceil(middle + half)),
    );
  };
  const records = useMemo(
    () =>
      selectEvents(timelinePeriods(data, dateMode), {
        start,
        end,
        type,
        field,
        query,
      }),
    [start, end, type, field, query, dateMode],
  );
  const recordCount = new Set(records.map((r) => r.id)).size;
  const layout = useMemo(
    () => layoutTimeline(records, { start, end, orientation, pixels, grouped }),
    [records, start, end, orientation, pixels, grouped],
  );
  const guideColumns = useMemo(() => orientation === 'vertical' ? timeBands(timeScales,start,end,pixels,viewerYear) : [], [orientation,start,end,pixels]);
  const guideWidth = guideColumns.length ? guideColumns.length * 66 + 14 : 0;
  const download = async (format) => {
    setBusy(true);
    setMessage("");
    try {
      const blob = await exportTimeline(svgRef.current, format);
      setExported({ url: URL.createObjectURL(blob), format });
      setMessage(
        `${format.toUpperCase()} export ready for this range and these filters.`,
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <header className="border-b border-slate-200 bg-white p-4">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-4 flex gap-5 text-sm underline">
            <Link to="/">All events</Link>
          </nav>
          <h1 className="text-3xl">Timeline</h1>
          <p className="mt-3 max-w-4xl text-sm text-slate-600">
            Explore elapsed time on a linear scale. Equal distances mean equal
            time. Each bar shows a recorded span; dashed bars show uncertain
            date bounds. Deep time compresses recent history, so narrow the
            range to see more.
            {orientation === 'vertical' && ' The left bands show approximate geological ages, human periods and centuries. Human ages overlap and follow broad conventions.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {presets.map(([label, s, e]) => (
              <button
                key={label}
                className={control}
                onClick={() => range(s, e)}
              >
                {label}
              </button>
            ))}
          </div>
          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const s = Number(startInput),
                t = Number(endInput);
              if (!validYear(s) || !validYear(t) || s >= t)
                return setMessage(
                  "Enter increasing signed integer years. Negative means BCE; there is no year zero.",
                );
              range(s, t);
            }}
          >
            <label className="text-xs">
              From year
              <input
                className={`${control} ml-2 w-36`}
                aria-label="From year"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                inputMode="numeric"
              />
            </label>
            <label className="text-xs">
              To year
              <input
                className={`${control} ml-2 w-36`}
                aria-label="To year"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                inputMode="numeric"
              />
            </label>
            <button className={control}>Apply range</button>
            <select
              aria-label="Timeline arrangement"
              className={control}
              value={grouped ? "grouped" : "packed"}
              onChange={(e) => update({ layout: e.target.value })}
            >
              <option value="grouped">Group by subject</option>
              <option value="packed">Pack chronologically</option>
            </select>
            <select
              aria-label="Timeline orientation"
              className={control}
              value={orientation}
              onChange={(e) => update({ view: e.target.value })}
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
            <label className="min-w-0 max-w-full text-xs">
              Dates shown
              <select
                aria-label="Timeline dates"
                className={`${control} max-w-full`}
                value={dateMode}
                onChange={(e) => update({ dates: e.target.value })}
              >
                {Object.entries(dateModes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </form>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              className={control}
              type="search"
              aria-label="Search timeline"
              placeholder="Search events or places"
              value={query}
              onChange={(e) => update({ q: e.target.value })}
            />
            <select
              className={control}
              aria-label="Timeline type"
              value={type}
              onChange={(e) => update({ type: e.target.value })}
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              className={control}
              aria-label="Timeline field"
              value={field}
              onChange={(e) => update({ field: e.target.value })}
            >
              <option value="">All fields</option>
              {fields.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <button
              className={control}
              aria-label="Earlier time window"
              onClick={() => move(-0.5)}
            >
              ← Earlier
            </button>
            <button className={control} onClick={() => move(0, 0.5)}>
              Zoom in
            </button>
            <button className={control} onClick={() => move(0, 2)}>
              Zoom out
            </button>
            <button
              className={control}
              aria-label="Later time window"
              onClick={() => move(0.5)}
            >
              Later →
            </button>
            <label className="ml-2 text-xs">
              Chart length{" "}
              <input
                aria-label="Chart length"
                type="range"
                min="1000"
                max="6000"
                step="500"
                value={pixels}
                onChange={(e) => setPixels(Number(e.target.value))}
              />
            </label>
            <button
              disabled={busy}
              className={control}
              onClick={() => download("png")}
            >
              Download PNG
            </button>
            <button
              disabled={busy}
              className={control}
              onClick={() => download("svg")}
            >
              Download SVG
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {records.length} {records.length === 1 ? "period" : "periods"} from{" "}
            {recordCount} {recordCount === 1 ? "record" : "records"} overlap
            this window. Preferred and lifespan views fall back to recorded
            dates when a dated alternative is absent. Scroll or swipe through
            the chart. Arrow tips indicate spans continuing outside the selected
            range. Exports include the full filtered chart. PNG is limited to
            4096 pixels per side; use SVG or narrow the range for readable
            crowded charts.
          </p>
          <p role="status" className="mt-2 text-sm text-amber-800">
            {message}{" "}
            {exported && (
              <a
                className="underline"
                href={exported.url}
                download={`chronica-timeline.${exported.format}`}
              >
                Save last {exported.format.toUpperCase()} export
              </a>
            )}
          </p>
        </div>
      </header>
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label="Scrollable timeline chart"
        className="m-4 max-h-[75vh] overflow-auto rounded border border-slate-200 bg-white"
      >
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${layout.width + guideWidth} ${layout.height}`}
          width={layout.width + guideWidth}
          height={layout.height}
          role="img"
          aria-label={`Timeline from ${formatYear(start)} to ${formatYear(end)}, ${records.length} periods`}
          style={{ fontFamily: "Arial, sans-serif", background: "#fff" }}
        >
          <rect width="100%" height="100%" fill="#fff" />
          <text x="24" y="28" fontSize="20" fontWeight="700" fill="#172033">
            Chronica Omnium
          </text>
          <text x="24" y="50" fontSize="12" fill="#475569">
            {formatYear(start)} – {formatYear(end)} · {records.length} periods ·{" "}
            {dateMode} dates · linear scale · {type || "all types"} ·{" "}
            {field || "all fields"}
            {query && ` · search: ${query}`}
          </text>
          <text x="24" y={layout.height - 15} fontSize="11" fill="#64748b">
            Solid: recorded span / point · Dashed: uncertain bounds · Arrows:
            continues beyond window
            {guideWidth > 0 && ' · Bands: approximate ages; human periods vary by region'}
          </text>
          {guideWidth > 0 && <TimeScaleBands columns={guideColumns} height={layout.height} />}
          <g transform={`translate(${guideWidth},0)`}>
          {layout.ticks.map((t) =>
            orientation === "horizontal" ? (
              <g key={t.year}>
                <line
                  x1={t.position + 40}
                  y1="85"
                  x2={t.position + 40}
                  y2={layout.height - 40}
                  stroke="#e2e8f0"
                />
                <text x={t.position + 40} y="77" fontSize="11" fill="#475569">
                  {formatYear(t.year)}
                </text>
              </g>
            ) : (
              <g key={t.year}>
                <line
                  x1="120"
                  y1={t.position + 100}
                  x2={layout.width - 20}
                  y2={t.position + 100}
                  stroke="#e2e8f0"
                />
                <text x="12" y={t.position + 104} fontSize="11" fill="#475569">
                  {formatYear(t.year)}
                </text>
              </g>
            ),
          )}
          {layout.groups?.map((g) => (
            <text
              key={g.label}
              x={orientation === "horizontal" ? 24 : g.lane * 260 + 140}
              y={orientation === "horizontal" ? g.lane * 52 + 120 : 96}
              fontSize="14"
              fontWeight="700"
              fill="#23665d"
            >
              {g.label}
            </text>
          ))}
          {layout.items.map((r) => {
            const horizontal = orientation === "horizontal",
              x = horizontal ? r.position + 40 : r.lane * 260 + 140,
              y = horizontal ? r.lane * 52 + 100 : r.position + 100,
              color = colorFor(grouped?trackFor(r):r.type);
            return (
              <a
                key={r.timelineKey}
                href={`/${r.id_num}`}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    navigate(`/${r.id_num}`);
                  }
                }}
                aria-label={`${r.name}: ${r.time_start}${r.time_end ? " to " + r.time_end : ""}`}
              >
                <title>
                  {r.name}: {r.time_start}
                  {r.time_end && ` – ${r.time_end}`}
                  {r.date_kind === "uncertain" && " (uncertain date bounds)"}
                </title>
                <rect
                  x={x - 2}
                  y={y - 2}
                  width={horizontal ? Math.max(242, r.length) : 244}
                  height={horizontal ? 48 : Math.max(50, r.length)}
                  fill="transparent"
                />
                <rect
                  x={x}
                  y={horizontal ? y + 27 : y}
                  width={horizontal ? r.length : 6}
                  height={horizontal ? 6 : r.length}
                  fill={r.date_kind === "uncertain" ? "#f1f5f9" : color}
                  stroke={color}
                  strokeDasharray={
                    r.date_kind === "uncertain" ? "4 3" : undefined
                  }
                />
                <text
                  x={horizontal ? x : x + 14}
                  y={y + 16}
                  fontSize="13"
                  fontWeight="600"
                  fill={color}
                >
                  {r.name.length > 31 ? r.name.slice(0, 30) + "…" : r.name}
                </text>
                {!horizontal && (
                  <text x={x + 14} y={y + 33} fontSize="10" fill="#64748b">
                    {r.time_start}
                    {r.time_end && ` – ${r.time_end}`}
                  </text>
                )}
                {r.clippedStart && (
                  <text
                    x={horizontal ? x : x - 5}
                    y={horizontal ? y + 39 : y + 8}
                    fontSize="14"
                    fill={color}
                  >
                    {horizontal ? "◀" : "▲"}
                  </text>
                )}
                {r.clippedEnd && (
                  <text
                    x={horizontal ? x + r.length - 10 : x - 5}
                    y={horizontal ? y + 39 : y + r.length}
                    fontSize="14"
                    fill={color}
                  >
                    {horizontal ? "▶" : "▼"}
                  </text>
                )}
              </a>
            );
          })}
          {records.length === 0 && (
            <text x="24" y="150" fontSize="16" fill="#475569">
              No records match this range and these filters.
            </text>
          )}
          </g>
        </svg>
      </div>
      <details className="m-4 rounded border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm">
          Text list of periods in this window ({records.length})
        </summary>
        <ul className="mt-3 space-y-2 text-sm">
          {records.map((r) => (
            <li key={r.timelineKey}>
              <Link to={`/${r.id_num}`} className="underline blue">
                {r.name}
              </Link>{" "}
              · {r.period_label} · {r.time_start}
              {r.time_end && ` – ${r.time_end}`}
              {r.date_kind === "uncertain" && " · uncertain bounds"}
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}
