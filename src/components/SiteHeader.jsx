import { Link } from "react-router-dom";
export default function SiteHeader({ children }) {
  return (
    <header className="site-header">
      <nav aria-label="Main navigation">
        <Link to="/" className="wordmark">
          Chronica Omnium<span>A history of our world</span>
        </Link>
        <div className="site-links">
          <Link to="/">Chronicle</Link>
          <Link to="/timeline">Timeline</Link>
          <details className="tools-menu">
            <summary>Tools</summary>
            <div>
              <Link to="/catalog">Local catalog</Link>
              <a href="https://linic.net">Marino Linić ↗</a>
            </div>
          </details>
        </div>
      </nav>
      {children}
    </header>
  );
}
