import { Link } from "react-router-dom";
import { preloadEvent } from "../utils/event-loader";

export default function EventLink({ event, children, onClick, ...props }) {
  const preload = () => preloadEvent(event.id);
  return <Link {...props} to={`/${event.id_num}`} onClick={onClick}
    onPointerEnter={preload} onFocus={preload} onTouchStart={preload}>{children}</Link>;
}
