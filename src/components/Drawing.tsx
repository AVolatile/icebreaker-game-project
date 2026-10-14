import { useRef, useState, type PointerEvent } from "react";
import type { Stroke } from "../../shared/types";
const COLORS = [
  "#191a24",
  "#2548f4",
  "#ff7448",
  "#c0ee7b",
  "#ffa9d2",
  "#ffffff",
];
export function Drawing({
  strokes,
  className = "",
}: {
  strokes: Stroke[];
  className?: string;
}) {
  return (
    <svg
      className={`drawing ${className}`}
      viewBox="0 0 400 320"
      role="img"
      aria-label="Player drawing"
    >
      <rect width="400" height="320" fill="#fff" />
      {strokes.map((s, i) => (
        <polyline
          key={i}
          fill="none"
          stroke={s.color}
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={s.points.map((p) => `${p[0] * 400},${p[1] * 320}`).join(" ")}
        />
      ))}
    </svg>
  );
}
export function DrawingPad({
  onChange,
  disabled = false,
}: {
  onChange: (strokes: Stroke[]) => void;
  disabled?: boolean;
}) {
  const [strokes, setStrokes] = useState<Stroke[]>([]),
    [color, setColor] = useState(COLORS[0]),
    [width, setWidth] = useState(5);
  const live = useRef<Stroke[] | null>(null);
  const [cursor, setCursor] = useState<[number, number]>([0.5, 0.5]),
    [keyboardPen, setKeyboardPen] = useState(false),
    [focused, setFocused] = useState(false);
  const update = (s: Stroke[]) => {
    setStrokes(s);
    onChange(s);
  };
  function point(e: PointerEvent<SVGSVGElement>): [number, number] {
    const b = e.currentTarget.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)),
      Math.min(1, Math.max(0, (e.clientY - b.top) / b.height)),
    ];
  }
  function down(e: PointerEvent<SVGSVGElement>) {
    if (disabled || strokes.length >= 100) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    live.current = [
      ...strokes,
      { color, width, points: [p, [Math.min(1, p[0] + 0.00001), p[1]]] },
    ];
    update(live.current);
  }
  function move(e: PointerEvent<SVGSVGElement>) {
    if (
      !live.current ||
      disabled ||
      live.current.reduce((sum, s) => sum + s.points.length, 0) >= 2500
    )
      return;
    const s = live.current[live.current.length - 1];
    if (s.points.length >= 800) return;
    const p = point(e),
      last = s.points[s.points.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.003) return;
    live.current = [
      ...live.current.slice(0, -1),
      { ...s, points: [...s.points, p] },
    ];
    update(live.current);
  }
  return (
    <div className="drawing-pad">
      <div className="drawing-tools">
        <div className="drawing-colors">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c === "#ffffff" ? "Eraser" : `Draw in ${c}`}
              aria-pressed={color === c}
              style={{ background: c }}
              className={color === c ? "selected" : ""}
              onClick={() => setColor(c)}
              disabled={disabled}
            />
          ))}
        </div>
        <label className="line-width">
          Line
          <select
            aria-label="Line width"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            disabled={disabled}
          >
            <option value={3}>Fine</option>
            <option value={5}>Medium</option>
            <option value={10}>Bold</option>
          </select>
        </label>
      </div>
      <svg
        className="drawing-canvas"
        viewBox="0 0 400 320"
        role="application"
        tabIndex={0}
        aria-label="Drawing canvas. Arrow keys move. Space toggles drawing. Escape lifts the pen."
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setKeyboardPen(false);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Escape") {
            setKeyboardPen(false);
            return;
          }
          if (e.key === " ") {
            e.preventDefault();
            if (!keyboardPen && strokes.length < 100) {
              update([
                ...strokes,
                {
                  color,
                  width,
                  points: [
                    cursor,
                    [Math.min(1, cursor[0] + 0.00001), cursor[1]],
                  ],
                },
              ]);
              setKeyboardPen(true);
            } else setKeyboardPen(false);
            return;
          }
          if (
            !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
          )
            return;
          e.preventDefault();
          const p: [number, number] = [
            Math.max(
              0,
              Math.min(
                1,
                cursor[0] +
                  (e.key === "ArrowLeft"
                    ? -0.02
                    : e.key === "ArrowRight"
                      ? 0.02
                      : 0),
              ),
            ),
            Math.max(
              0,
              Math.min(
                1,
                cursor[1] +
                  (e.key === "ArrowUp"
                    ? -0.025
                    : e.key === "ArrowDown"
                      ? 0.025
                      : 0),
              ),
            ),
          ];
          setCursor(p);
          if (
            keyboardPen &&
            strokes.length &&
            strokes.reduce((sum, s) => sum + s.points.length, 0) < 2500
          ) {
            const last = strokes[strokes.length - 1];
            if (last.points.length < 800)
              update([
                ...strokes.slice(0, -1),
                { ...last, points: [...last.points, p] },
              ]);
          }
        }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => {
          live.current = null;
        }}
        onPointerCancel={() => {
          live.current = null;
        }}
      >
        <rect width="400" height="320" fill="#fff" />
        {strokes.map((s, i) => (
          <polyline
            key={i}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={s.points
              .map((p) => `${p[0] * 400},${p[1] * 320}`)
              .join(" ")}
          />
        ))}
        {focused && (
          <circle
            cx={cursor[0] * 400}
            cy={cursor[1] * 320}
            r="5"
            fill={keyboardPen ? color : "none"}
            stroke="#2548f4"
            strokeWidth="2"
          />
        )}
      </svg>
      <p className="drawing-keyboard-help">
        Keyboard: focus canvas · arrows to move · Space to draw or lift · Esc to
        lift.
      </p>
      <div className="drawing-bottom">
        <button
          type="button"
          disabled={disabled || !strokes.length}
          onClick={() => {
            setKeyboardPen(false);
            live.current = null;
            update(strokes.slice(0, -1));
          }}
        >
          ↶ Undo
        </button>
        <span>Finger painting. Serious business.</span>
        <button
          type="button"
          disabled={disabled || !strokes.length}
          onClick={() => {
            setKeyboardPen(false);
            live.current = null;
            update([]);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
