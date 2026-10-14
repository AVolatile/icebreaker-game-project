import type { CSSProperties, ReactNode } from "react";
import { AVATAR_NAMES } from "../../shared/catalog";
export function Avatar({
  id = 0,
  size = 80,
  className = "",
}: {
  id?: number;
  size?: number;
  className?: string;
}) {
  return (
    <img
      className={`avatar ${className}`}
      src={`/avatars/${id}.svg`}
      width={size}
      height={size}
      alt={AVATAR_NAMES[id] ?? "Player avatar"}
      draggable={false}
    />
  );
}
export function Symbol({ className = "" }: { className?: string }) {
  return (
    <img
      className={className}
      src="/brand/symbol.svg"
      width="34"
      height="34"
      alt=""
    />
  );
}
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`logo ${light ? "light" : ""}`}>
      ruckus<span className="logo-star">✳</span>
    </span>
  );
}
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const shapes: Record<string, ReactNode> = {
    bolt: <path d="M29 3 9 25h14l-4 20 21-26H26Z" />,
    eye: (
      <>
        <path d="M3 24Q24 0 45 24Q24 48 3 24Z" />
        <circle cx="24" cy="24" r="8" fill="currentColor" />
      </>
    ),
    megaphone: (
      <>
        <path d="M6 18h13L39 7v34L19 30H6Z" />
        <path d="M16 31v10h8l-4-11M44 17l4-3M44 31l4 3" />
      </>
    ),
    bubble: <path d="M5 8h38v26H23L11 43v-9H5Z" />,
    asterisk: (
      <>
        <path d="M24 3v42M6 13l36 22M6 35l36-22" strokeWidth="7" />
      </>
    ),
    pencil: (
      <>
        <path d="m8 33 23-24 9 9-23 24-13 3Z" />
        <path d="m25 15 9 9M8 33l9 9" />
      </>
    ),
    arrow: <path d="M7 24h33M27 11l13 13-13 13" />,
    check: <path d="m10 25 10 10 20-24" />,
    scan: (
      <>
        <path d="M17 7H7v10M31 7h10v10M7 31v10h10M41 31v10H31" />
        <path d="M15 24h18" />
      </>
    ),
    screen: (
      <>
        <rect x="4" y="7" width="40" height="28" rx="3" />
        <path d="M24 35v7M14 43h20" />
      </>
    ),
    phone: (
      <>
        <rect x="14" y="3" width="22" height="42" rx="4" />
        <path d="M22 38h6" />
      </>
    ),
    trophy: (
      <>
        <path d="M14 5h20v17q0 12-10 12T14 22ZM24 34v10M15 44h18M14 10H5v8q0 11 11 11M34 10h9v8q0 11-11 11" />
      </>
    ),
  };
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[name] ?? shapes.asterisk}
    </svg>
  );
}
export function Tag({
  children,
  color,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      className="tag"
      style={
        color
          ? {
              background: color,
              color: color.toLowerCase() === "#2548f4" ? "#f9f7ed" : "#191a24",
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`star ${className}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="m50 0 10 27 26-14-9 29 23 8-23 10 9 27-27-12-9 25-10-25-26 12 10-27L0 50l25-8-10-29 27 14Z"
      />
    </svg>
  );
}
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 35 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--x": `${(i * 43) % 100}%`,
              "--delay": `${(i % 7) * 0.15}s`,
              "--turn": `${i * 51}deg`,
              background: ["#f6ed51", "#ffa9d2", "#c0ee7b", "#ff7448"][i % 4],
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
