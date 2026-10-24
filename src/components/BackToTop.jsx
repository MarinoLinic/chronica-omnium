import { useEffect, useState } from "react";
export default function BackToTop({ onTop, onBottom, hasRecords = true }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div className="scroll-controls">
    {visible && (
      <button
        className="scroll-button"
        onClick={() => {
          onTop?.();
          window.scrollTo({ top: 0, behavior: "instant" });
          requestAnimationFrame(() =>
            window.scrollTo({ top: 0, behavior: "instant" }),
          );
        }}
      >
        ↑ <span>Back to top</span>
      </button>
    )}
    {onBottom && hasRecords && <button className="scroll-button" onClick={onBottom}>↓ <span>Go to bottom</span></button>}
    </div>
  );
}
