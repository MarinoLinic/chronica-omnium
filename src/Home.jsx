import { useState, useMemo, useRef, useEffect } from "react";
import { GroupedVirtuoso } from "react-virtuoso";
import data from "./data";
import timeScales from "./generated/time-scales.json";
import { filterData } from "./utils/functions";
import SiteHeader from "./components/SiteHeader";
import HomeEvent from "./components/HomeEvent";
import BackToTop from "./components/BackToTop";
function ordinal(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  const r = n % 10;
  if (r === 1) return `${n}st`;
  if (r === 2) return `${n}nd`;
  if (r === 3) return `${n}rd`;
  return `${n}th`;
}

function findArchaeological(year) {
  for (const ts of timeScales.time_scale.archeological) {
    if (year >= ts.start && year <= ts.end) {
      for (const sub of ts.sub || []) {
        if (year >= sub.start && year <= sub.end) return sub.name;
      }
      return ts.name;
    }
  }
  return null;
}

function findGeologic(year) {
  for (const ts of timeScales.time_scale.geologic) {
    if (year >= ts.start && year <= ts.end) {
      for (const sub of ts.sub || []) {
        if (year >= sub.start && year <= sub.end) {
          for (const ss of sub.sub || []) {
            if (year >= ss.start && year <= ss.end) return ss.name;
          }
          return sub.name;
        }
      }
      return ts.name;
    }
  }
  return "Cosmic era";
}

function getPeriodLabel(year) {
  if (year >= 1) return `${ordinal(Math.ceil(year / 100))} century`;
  if (year >= -4999)
    return `${ordinal(Math.ceil(-year / 1000))} millennium BCE`;
  return findArchaeological(year) || findGeologic(year);
}

export default function Home() {
  const allData = useMemo(() => filterData(data), []),
    virtuoso = useRef(null);
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [field, setField] = useState(""),
    [filters, setFilters] = useState(false),
    [current, setCurrent] = useState(0);
  const records = useMemo(
    () =>
      allData.filter(
        (r) =>
          (!type || r.type === type) &&
          (!field || r.field === field) &&
          (!query ||
            [r.name, r.short_desc, r.location, ...(r.countryNames || [])].some(
              (v) => v?.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
            )),
      ),
    [allData, query, type, field],
  );
  const { groups, counts, indices } = useMemo(() => {
    const groups = [],
      counts = [],
      indices = [];
    for (const [i, r] of records.entries()) {
      const label = getPeriodLabel(r.start);
      if (label !== groups.at(-1)) {
        groups.push(label);
        counts.push(1);
        indices.push(i);
      } else counts[counts.length - 1]++;
    }
    return { groups, counts, indices };
  }, [records]);
  useEffect(() => {
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cutoff =
          Math.max(
            document
              .querySelector(".chronicle-toolbar")
              ?.getBoundingClientRect().bottom || 0,
            window.innerWidth <= 760
              ? document.querySelector(".period-rail")?.getBoundingClientRect()
                  .bottom || 0
              : 0,
          ) + 32;
        const visible = [
          ...document.querySelectorAll("[data-period-index]"),
        ].find((el) => {
          const rect = el.getBoundingClientRect();
          return rect.bottom > cutoff && rect.top < window.innerHeight;
        });
        if (visible) setCurrent(Number(visible.dataset.periodIndex));
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [records]);
  const active = Math.min(current, Math.max(0, groups.length - 1));
  const jump = (i) => {
    const next = Math.min(Math.max(0, i), groups.length - 1);
    if (next < 0) return;
    setCurrent(next);
    virtuoso.current?.scrollToIndex({
      index: indices[next],
      align: "start",
      behavior: "auto",
      offset: -82,
    });
  };
  const top = () => setCurrent(0);
  return (
    <div className="chronicle">
      <SiteHeader />
      <section className="chronicle-hero">
        <p className="story-kicker">From the first light to the present</p>
        <h1>
          The long story
          <br />
          of everything.
        </h1>
        <p>
          Explore the people, discoveries and turning points that shaped our
          world.
        </p>
      </section>
      <div className="chronicle-toolbar">
        <div>
          <input
            type="search"
            aria-label="Search dated events"
            placeholder="Find a person, place or moment…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrent(0);
            }}
          />
          <span>
            {records.length} {records.length === 1 ? "story" : "stories"}
          </span>
          <button aria-expanded={filters} onClick={() => setFilters(!filters)}>
            Filters {filters ? "−" : "+"}
          </button>
        </div>
        {filters && (
          <div className="filter-panel">
            <label>
              Type{" "}
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setCurrent(0);
                }}
              >
                <option value="">All types</option>
                {[...new Set(allData.map((r) => r.type))].sort().map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Field{" "}
              <select
                value={field}
                onChange={(e) => {
                  setField(e.target.value);
                  setCurrent(0);
                }}
              >
                <option value="">All fields</option>
                {[...new Set(allData.map((r) => r.field))].sort().map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <button
              onClick={() => {
                setType("");
                setField("");
                setQuery("");
              }}
            >
              Reset
            </button>
          </div>
        )}
      </div>
      <div className="chronicle-layout">
        <aside className="period-rail" aria-label="Period navigation">
          <p className="story-kicker">You are exploring</p>
          <div className="period-controls">
            <button
              aria-label="Previous period"
              disabled={active === 0 || !groups.length}
              onClick={() => jump(active - 1)}
            >
              ←
            </button>
            <select
              aria-label="Choose period"
              value={active}
              disabled={!groups.length}
              onChange={(e) => jump(Number(e.target.value))}
            >
              {groups.length ? (
                groups.map((g, i) => (
                  <option key={g + i} value={i}>
                    {g}
                  </option>
                ))
              ) : (
                <option value={0}>No periods</option>
              )}
            </select>
            <button
              aria-label="Next period"
              disabled={active === groups.length - 1 || !groups.length}
              onClick={() => jump(active + 1)}
            >
              →
            </button>
          </div>
          <p className="period-caption">
            Move through time.
            <br />
            Follow what interests you.
          </p>
        </aside>
        <main className="chronicle-list">
          {records.length ? (
            <GroupedVirtuoso
              key={query + "|" + type + "|" + field}
              ref={virtuoso}
              useWindowScroll
              increaseViewportBy={400}
              groupCounts={counts}
              groupContent={(i) => (
                <div className="period-divider">{groups[i]}</div>
              )}
              itemContent={(i, g) => (
                <div data-period-index={g}>
                  <HomeEvent data={records[i]} />
                </div>
              )}
            />
          ) : (
            <div className="empty-state">
              <h2>No stories found</h2>
              <p>Try another search or reset the filters.</p>
            </div>
          )}
        </main>
      </div>
      <BackToTop onTop={top} />
      <footer className="site-footer">
        Curated by <a href="https://linic.net">Marino Linić</a> · A continuing
        exploration
      </footer>
    </div>
  );
}
