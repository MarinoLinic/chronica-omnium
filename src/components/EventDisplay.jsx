import CachedImage from "./CachedImage";
import SourceArticle, { Sources } from "./SourceArticle";
import DateLabel from "./DateLabel";
import { relativeAge } from "../utils/dates";
export default function EventDisplay({ event, content }) {
  const dateNote=event.date_note&&!/^(Legacy range_type=|Dates shown to year precision;)/.test(event.date_note)?event.date_note:null;
  return (
    <article className="story">
      <header className="story-heading">
        <p className="story-kicker">
          {[event.field, event.type]
            .filter((t) => t && t !== "Uncategorized")
            .join(" / ")}
        </p>
        <h1>{event.name}</h1>
        <p className="story-dates">
          {event.date_label && <span>{event.date_label} · </span>}
          <DateLabel year={event.start} />
          {event.time_end && (
            <>
              {" "}
              –{" "}
              {event.date_kind === "ongoing" ? (
                "present"
              ) : (
                <DateLabel year={event.end} />
              )}
            </>
          )}
        </p>
        {event.start !== null && (
          <p className="story-age">
            {event.date_kind === "uncertain" ? "Earlier bound: " : event.time_end ? "Start: " : ""}
            {relativeAge(event.start)}
          </p>
        )}
        {event.date_kind === "uncertain" && (
          <p className="date-note">Approximate date bounds, not a duration.</p>
        )}
        {dateNote && <p className="date-note">{dateNote}</p>}
        {event.location && <p className="event-place">{[event.location,...(event.countryNames || []).filter(name=>!event.location.includes(name)),...(event.continents || []).filter(name=>!event.location.includes(name))].join(' · ')}</p>}
        {event.short_desc && <p className="story-intro">{event.short_desc}</p>}
      </header>
      {(event.image || event.local_image) && (
        <figure className="story-image">
          <CachedImage
            event={event}
            className="max-h-[500px] max-w-full object-contain"
          />
        </figure>
      )}
      {event.long_desc &&
        event.long_desc !== event.name &&
        event.long_desc !== event.short_desc && (
          <p className="story-description">{event.long_desc}</p>
        )}
      {event.periods?.length > 0 && (
        <section
          className="other-periods"
          aria-label="Additional dated periods"
        >
          <h2>Life & other periods</h2>
          <dl>
            {event.periods.map((p) => (
              <div key={p.id}>
                <dt>{p.label}</dt>
                <dd>
                  <DateLabel year={p.start} />
                  {p.time_end && (
                    <>
                      {" "}
                      –{" "}
                      {p.date_kind === "ongoing" ? (
                        "present"
                      ) : (
                        <DateLabel year={p.end} />
                      )}
                    </>
                  )}
                  {p.date_kind === "uncertain" && " · approximate bounds"}
                  {p.date_note && <p>{p.date_note}</p>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <SourceArticle event={event} content={content} />
      <Sources event={event} content={content} />
    </article>
  );
}
