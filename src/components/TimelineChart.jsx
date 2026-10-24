import { useRef, useState, useEffect, useMemo } from "react";
import EventLink from "./EventLink";
import { formatYear, ordinalYear, formatRange } from "../utils/dates";
import { exportTimeline } from "../utils/export-image";
import { colorFor,trackFor } from "../utils/timeline";
export default function TimelineChart({
  data,
  track=false,
  rangestart,
  rangeend,
  type,
  title,
  markerYear,
}) {
  const rows = useMemo(
    () =>
      data
        .filter(
          (r) =>
            (track?trackFor(r):r.type) === type &&
            r.start != null &&
            r.start <= rangeend &&
            (r.end ?? r.start) >= rangestart,
        )
        .sort((a, b) => a.start - b.start),
    [data, type, track, rangestart, rangeend],
  );
  const svg = useRef(null),
    [exported, setExported] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(
    () => () => {
      if (exported) URL.revokeObjectURL(exported.url);
    },
    [exported],
  );
  const width = 640,
    height = Math.max(180, rows.length * 32 + 110),
    min = ordinalYear(rangestart),
    span = Math.max(1, ordinalYear(rangeend) - min),
    x = (y) => 190 + ((ordinalYear(y) - min) / span) * 420;
  const download = async (format) => {
    setBusy(true);
    try {
      const blob = await exportTimeline(svg.current, format);
      setExported({ url: URL.createObjectURL(blob), format });
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="context-chart">
      <div className="max-h-[340px] overflow-auto">
        <svg
          ref={svg}
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{
            fontFamily: "Arial,sans-serif",
            width: "100%",
            minWidth: 400,
            height: "auto",
          }}
          role="img"
          aria-label={`${title}: ${rows.length} records; dashed bars indicate uncertain dates. Text links below.`}
        >
          <rect width={width} height={height} fill="#fff" />
          <text x="16" y="26" fill="#203536" fontSize="16" fontWeight="600">
            {title}
          </text>
          <text x="190" y="51" fontSize="11" fill="#637570">
            {formatYear(rangestart)}
          </text>
          <text x="610" y="51" textAnchor="end" fontSize="11" fill="#637570">
            {formatYear(rangeend)}
          </text>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={190 + 420 * t}
              x2={190 + 420 * t}
              y1="62"
              y2={height - 32}
              stroke="#e5e9e3"
            />
          ))}
          {markerYear != null &&
            markerYear >= rangestart &&
            markerYear <= rangeend && (
              <line
                x1={x(markerYear)}
                x2={x(markerYear)}
                y1="62"
                y2={height - 32}
                stroke="#9d4a38"
                strokeDasharray="4 4"
              />
            )}
          {rows.map((r, i) => {
            const y = 80 + i * 32,
              a = Math.max(190, x(r.start)),
              b = Math.min(610, x(r.end ?? r.start)),
              color = colorFor(track?trackFor(r):r.type);
            return (
              <EventLink key={r.timelineKey || r.id} event={r}>
                <title>
                  {r.name}: {formatRange(r)}
                </title>
                <text x="16" y={y + 5} fontSize="12" fill="#203536">
                  {r.name.length > 24 ? r.name.slice(0, 23) + "…" : r.name}
                </text>
                <rect
                  x={Math.min(607, a)}
                  y={y - 5}
                  width={Math.max(3, b - a)}
                  height="10"
                  rx="2"
                  fill={r.date_kind === "uncertain" ? "#eef3ee" : color}
                  stroke={color}
                  strokeDasharray={
                    r.date_kind === "uncertain" ? "4 3" : undefined
                  }
                />
              </EventLink>
            );
          })}
          {!rows.length && (
            <text x="16" y="100" fontSize="13" fill="#637570">
              No records in this window.
            </text>
          )}
          <text x="16" y={height - 12} fill="#637570" fontSize="10">
            Chronica Omnium · linear time scale · dashed: uncertain bounds
          </text>
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 p-3 text-xs">
        <button
          className="underline"
          disabled={busy}
          onClick={() => download("png")}
        >
          Download chart
        </button>
        <button
          className="underline"
          disabled={busy}
          onClick={() => download("svg")}
        >
          SVG
        </button>
        {exported && (
          <a
            className="underline"
            href={exported.url}
            download={`chronica-context.${exported.format}`}
          >
            Save chart {exported.format.toUpperCase()}
          </a>
        )}
        <details>
          <summary>Text list ({rows.length})</summary>
          <ul>
            {rows.map((r) => (
              <li key={r.timelineKey || r.id}>
                <EventLink className="underline" event={r}>
                  {r.name}
                </EventLink>
                : {formatRange(r)}
              </li>
            ))}
          </ul>
        </details>
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
