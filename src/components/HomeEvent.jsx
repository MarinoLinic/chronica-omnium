import { Link } from "react-router-dom";
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
          <Link to={`/${data.id_num}`}>{data.name}</Link>
        </h2>
        {data.short_desc && <p className="event-summary">{data.short_desc}</p>}
        <p className="event-place">
          {data.location || (data.field !== "Uncategorized" && data.field)}
        </p>
        <Link className="read-link" to={`/${data.id_num}`}>
          Explore story <span aria-hidden="true">↗</span>
        </Link>
      </div>
      {(data.image || data.local_image) && (
        <Link
          to={`/${data.id_num}`}
          className="chronicle-image"
          aria-label={`Read about ${data.name}`}
        >
          <CachedImage
            event={data}
            small
            className="w-full h-full object-contain"
          />
        </Link>
      )}
    </article>
  );
}
