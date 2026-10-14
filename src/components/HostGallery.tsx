import { useEffect, useState } from "react";
import type { Submission } from "../../shared/types";
import { Drawing } from "./Drawing";
const PAGE_SIZE = 8;
export function HostGallery({ submissions }: { submissions: Submission[] }) {
  const [page, setPage] = useState(0),
    [cycling, setCycling] = useState(true);
  const pages = Math.ceil(submissions.length / PAGE_SIZE);
  useEffect(() => {
    if (
      pages < 2 ||
      !cycling ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(() => setPage((p) => (p + 1) % pages), 4000);
    return () => clearInterval(timer);
  }, [pages, cycling]);
  const current = Math.min(page, Math.max(0, pages - 1));
  const visible = submissions.slice(
    current * PAGE_SIZE,
    (current + 1) * PAGE_SIZE,
  );
  return (
    <>
      <div className="vote-gallery gallery-paged">
        {visible.map((s, i) => (
          <article key={s.id}>
            <span className="submission-number">
              {String(current * PAGE_SIZE + i + 1).padStart(2, "0")}
            </span>
            {s.drawing ? <Drawing strokes={s.drawing} /> : <h2>{s.text}</h2>}
          </article>
        ))}
      </div>
      {pages > 1 && (
        <div className="gallery-pagination">
          <span>
            PAGE {current + 1} / {pages} · EVERY ENTRY IS ON YOUR PHONE
          </span>
          <div>
            <button
              aria-label="Previous gallery page"
              onClick={() => {
                setCycling(false);
                setPage((p) => (p + pages - 1) % pages);
              }}
            >
              ←
            </button>
            <button onClick={() => setCycling((c) => !c)}>
              {cycling ? "Hold page" : "Cycle pages"}
            </button>
            <button
              aria-label="Next gallery page"
              onClick={() => {
                setCycling(false);
                setPage((p) => (p + 1) % pages);
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
