import { useEffect, useState } from "react";
export default function BackToTop({ onTop }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    visible && (
      <button
        className="back-to-top"
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
    )
  );
}
