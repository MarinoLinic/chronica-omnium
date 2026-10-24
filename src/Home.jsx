import { useState, useMemo, useRef, useEffect } from "react";
import { GroupedVirtuoso } from "react-virtuoso";
import data from "./data";
import timeScales from "./generated/time-scales.json";
import { filterData } from "./utils/functions";
import SiteHeader from "./components/SiteHeader";
import HomeEvent from "./components/HomeEvent";
import BackToTop from "./components/BackToTop";
import TimeGuide from "./components/TimeGuide";
import { periodLabel } from "./utils/time-scales";
export default function Home() {
  const allData = useMemo(() => filterData(data), []),
    virtuoso = useRef(null), toolbar = useRef(null);
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [field, setField] = useState(""),
    [filters, setFilters] = useState(false),
    [current, setCurrent] = useState(0),
    [visibleIndex, setVisibleIndex] = useState(0),
    [toolbarHeight,setToolbarHeight] = useState(60);
  useEffect(()=>{
    const observer = new ResizeObserver(([entry])=>setToolbarHeight(entry.target.getBoundingClientRect().height));
    if(toolbar.current)observer.observe(toolbar.current);
    return ()=>observer.disconnect();
  },[]);
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
      const label = periodLabel(r.start, timeScales);
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
          const visibleHeight = Math.min(rect.bottom,window.innerHeight)-Math.max(rect.top,cutoff);
          return visibleHeight >= Math.min(80,rect.height/2);
        });
        if (visible) {
          setCurrent(Number(visible.dataset.periodIndex));
          setVisibleIndex(Number(visible.dataset.eventIndex));
        }
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, [records]);
  const active = Math.min(current, Math.max(0, groups.length - 1));
  const jump = (i) => {
    const next = Math.min(Math.max(0, i), groups.length - 1);
    if (next < 0) return;
    jumpToRecord(indices[next]);
  };
  const jumpToRecord = (index) => {
    if (!Number.isInteger(index) || !records[index]) return;
    const group = indices.findLastIndex(i => i <= index);
    setCurrent(Math.max(0, group));
    setVisibleIndex(index);
    const toolbar = document.querySelector(".chronicle-toolbar")?.getBoundingClientRect().height || 55;
    const rail = window.innerWidth <= 760 ? document.querySelector(".period-rail")?.getBoundingClientRect().height || 0 : 0;
    virtuoso.current?.scrollToIndex({index,align:"start",behavior:"auto",offset:-(toolbar+rail+30)});
  };
  useEffect(() => { setVisibleIndex(0); }, [query,type,field]);
  const top = () => {setCurrent(0);setVisibleIndex(0);};
  return (
    <div className="chronicle" style={{'--toolbar-size':`${toolbarHeight}px`}}>
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
      <div className="chronicle-toolbar" ref={toolbar}>
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
                aria-label="Story type"
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
                aria-label="Story field"
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
          <TimeGuide year={records[Math.min(visibleIndex, records.length-1)]?.start} scales={timeScales} records={records} onJump={jumpToRecord} />
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
                <div data-period-index={g} data-event-index={i}>
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
