import { useId, useState } from "react";
import { formatYear, relativeDate } from "../utils/dates";
export default function DateLabel({ year, children }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  if (year == null) return <span>{children || "Undated"}</span>;
  const text = relativeDate(year);
  return (
    <span className="date-label">
      <button
        type="button"
        aria-expanded={open}
        aria-label={formatYear(year)}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.currentTarget) setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        onBlur={() => setOpen(false)}
      >
        {children || formatYear(year)}
      </button>
      {open && (
        <span id={tooltipId} role="tooltip" className="date-tooltip">
          {text}
        </span>
      )}
    </span>
  );
}
