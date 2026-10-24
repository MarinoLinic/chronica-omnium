import EventLink from "./EventLink";
import CachedImage from "./CachedImage";
import DateLabel from "./DateLabel";
export default function HomeEvent({ data }) {
  return (
    <article className="chronicle-event">
      <div className="chronicle-copy">
        <p className="event-eyebrow">
          <DateLabel year={data.start} />
          {data.time_end && (
            <>
              {" "}
              <span>–</span>{" "}
              {data.date_kind === "ongoing" ? (
                "present"
              ) : (
                <DateLabel year={data.end} />
              )}
            </>
          )}
          {data.type !== "Uncategorized" && (
            <span className="event-type">{data.type}</span>
          )}
        </p>
        <h2>
          <EventLink event={data}>{data.name}</EventLink>
        </h2>
        {data.short_desc && <p className="event-summary">{data.short_desc}</p>}
        <p className="event-place">
          {data.location || (data.field !== "Uncategorized" && data.field)}
        </p>
        <EventLink className="read-link" event={data}>
          Learn more <span aria-hidden="true">↗</span>
        </EventLink>
      </div>
      {(data.image || data.local_image) && (
        <EventLink
          event={data}
          className="chronicle-image"
          aria-label={`Read about ${data.name}`}
        >
          <CachedImage
            event={data}
            small
            className="w-full h-full object-contain"
          />
        </EventLink>
      )}
    </article>
  );
}
