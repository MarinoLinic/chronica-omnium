import data, { eventById } from "../data";
import { useParams, Link } from "react-router-dom";
import { lazy, Suspense, useEffect, useState, useRef, useMemo } from "react";
import EventDisplay from "./EventDisplay";
import SiteHeader from "./SiteHeader";
import { ordinalYear, historicalYear } from "../utils/dates";
import { loadEvent } from "../utils/event-loader";
import EventLink from "./EventLink";
import { timelinePeriods, dateModes } from "../utils/periods";
import {trackFor} from "../utils/timeline";
const TimelineChart = lazy(() => import("./TimelineChart"));
const EventMap = lazy(() => import("./EventMap"));
const ordered = [...data].sort(
  (a, b) =>
    (a.start ?? Infinity) - (b.start ?? Infinity) || a.id_num - b.id_num,
);

function Context({ event }) {
  const ref = useRef(null),
    [visible, setVisible] = useState(false),
    [map, setMap] = useState(false);
  const [dateMode, setDateMode] = useState("preferred");
  const periods = useMemo(() => timelinePeriods(data, dateMode), [dateMode]);
  const focus = timelinePeriods(
    [event],
    dateMode === "all" ? "preferred" : dateMode,
  )[0];
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const hasDate = focus.start !== null && focus.start >= -10000;
  const center = focus.start ?? 1;
  const start = historicalYear(ordinalYear(center) - 100),
    end = historicalYear(
      Math.max(
        ordinalYear(center) + 1,
        Math.min(ordinalYear(center) + 100, ordinalYear(event.referenceYear)),
      ),
    );
  return (
    <aside
      ref={ref}
      className="mt-10 border-t border-slate-200 pt-6 print:hidden"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 max-w-full">
          <h2 className="text-xl">In context</h2>
          <p className="mt-2 text-sm text-slate-500">
            Charts share the same time window. Points include events without an
            end date. Dates shown: {dateModes[dateMode]}.
          </p>
          <select
            aria-label="Context dates"
            className="mt-2 max-w-full rounded border border-slate-300 p-2 text-sm"
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value)}
          >
            {Object.entries(dateModes).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {hasDate && (
          <Link
            className="underline blue"
            to={`/timeline?start=${start}&end=${end}&dates=${dateMode}`}
          >
            Explore this time range →
          </Link>
        )}
      </div>
      {!hasDate && (
        <p className="text-sm text-slate-500">
          Select a dated period within human history to show context charts.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        {visible && hasDate && (
          <Suspense fallback={<p>Loading charts…</p>}>
            {[...new Set(periods.map(trackFor))].map(label=>[label,label])
              .filter(([type]) =>
                periods.some(
                  (r) =>
                    trackFor(r) === type &&
                    r.start !== null &&
                    r.start <= end &&
                    (r.end ?? r.start) >= start,
                ),
              )
              .map(([type, title]) => (
                <section
                  key={type}
                  className="min-w-0 border border-slate-200 bg-white"
                >
                  <TimelineChart
                    track
                    data={periods}
                    rangestart={start}
                    rangeend={end}
                    type={type}
                    title={`${title} · ${dateMode} dates`}
                    markerYear={focus.start}
                  />
                </section>
              ))}
          </Suspense>
        )}
      </div>
      {event.location_info?.reviewed && (
        <div className="mt-5">
          <button onClick={() => setMap((m) => !m)} className="underline">
            {map ? "Hide map" : "Load location map (OpenStreetMap)"}
          </button>
          {map && (
            <div className="mt-3 h-[300px]">
              <Suspense fallback={<p>Loading map…</p>}>
                <EventMap locationInfo={event.location_info} />
              </Suspense>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
export default function Event() {
  const { eventId } = useParams(),
    event = eventById(eventId);
  const [detail, setDetail] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    setError("");
    if (!event) return;
    let active = true;
    loadEvent(event.id)
      .then((result) => {
        if (active) {
          setDetail(result);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => { active = false; };
  }, [event?.id]);
  if (!event)
    return (
      <main className="p-10 text-center">
        <h1>Event not found</h1>
        <Link className="underline" to="/">
          All events
        </Link>
      </main>
    );
  const position = ordered.findIndex((r) => r.id === event.id);
  const full = detail?.event;
  const loading = detail?.id !== event.id;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {loading && !error && (
        <div
          className="route-loading"
          role="status"
          aria-label="Loading story and image"
        />
      )}
      <nav className="story-nav" aria-label="Story navigation">
        <Link to="/">← Chronicle</Link>
        <div>
          {position > 0 && (
            <EventLink event={ordered[position - 1]}>← Previous</EventLink>
          )}
          {position < ordered.length - 1 && (
            <EventLink event={ordered[position + 1]}>Next →</EventLink>
          )}
        </div>
      </nav>
      <main
        className="mx-auto max-w-6xl px-5 py-10"
        aria-busy={loading && !error}
      >
        {full ? (
          <>
            <EventDisplay event={full} content={detail.content} />
            {[full, ...(full.periods || [])].some(
              (p) => p.start !== null && p.start >= -10000,
            ) && <Context key={full.id} event={full} />}
          </>
        ) : (
          !error && (
            <div className="route-skeleton" role="status">
              Loading story…
            </div>
          )
        )}
        {error && (
          <p role="alert" className="text-center">
            {error}{" "}
            <button
              className="underline"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </p>
        )}
      </main>
    </div>
  );
}
