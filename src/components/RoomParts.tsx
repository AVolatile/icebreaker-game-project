import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Player, RoomView } from "../../shared/types";
import { Avatar, Icon } from "./Visuals";
export function Timer({ room }: { room: RoomView }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const offset = room.serverTime - Date.now();
    const tick = () =>
      setSeconds(
        Math.max(
          0,
          Math.ceil(((room.deadline ?? 0) - Date.now() - offset) / 1000),
        ),
      );
    tick();
    if (room.paused) return;
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [room.deadline, room.paused, room.serverTime]);
  return room.deadline ? (
    <div
      className={`timer ${seconds <= 5 ? "urgent" : ""}`}
      role="timer"
      aria-label={room.paused ? "Timer paused" : `${seconds} seconds left`}
    >
      <span>{room.paused ? "Ⅱ" : seconds}</span>
      <small>{room.paused ? "PAUSED" : "SECONDS"}</small>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="timer-track" cx="50" cy="50" r="45" />
        <circle
          className="timer-progress"
          cx="50"
          cy="50"
          r="45"
          strokeDasharray="283"
          strokeDashoffset={
            283 * (1 - Math.min(1, seconds / (room.duration / 1000)))
          }
        />
      </svg>
    </div>
  ) : null;
}
export function JoinQR({ url, code }: { url: string; code: string }) {
  const [qr, setQR] = useState(""),
    [copied, setCopied] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: "#191a24", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((data) => {
        if (mounted) setQR(data);
      })
      .catch(() => {
        if (mounted) setError("QR unavailable. Use the room code.");
      });
    return () => {
      mounted = false;
    };
  }, [url]);
  return (
    <div className="join-qr">
      <span className="eyebrow">SCAN IN. SHOW UP.</span>
      {qr ? (
        <img
          width="220"
          height="220"
          src={qr}
          alt={`Scan to join room ${code}`}
        />
      ) : (
        <div className="qr-loading">{error || "Making your QR code…"}</div>
      )}
      <p>Or open the link and enter</p>
      <strong>{code}</strong>
      <button
        className="copy-link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            setError("Copy the join address below.");
          }
        }}
      >
        {copied ? "Link copied ✓" : "Copy join link ↗"}
      </button>
      <a className="join-url" href={url} target="_blank" rel="noreferrer">
        {url.replace(/^https?:\/\//, "")}
      </a>
      {error && <p role="status">{error}</p>}
    </div>
  );
}
export function Scoreboard({
  players,
  compact = false,
}: {
  players: Player[];
  compact?: boolean;
}) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className={`scoreboard ${compact ? "compact" : ""}`}>
      <div className="scoreboard-heading">
        <span>THE PECKING ORDER</span>
        <span>POINTS</span>
      </div>
      {sorted.map((p, i) => (
        <div className={`score-row ${i === 0 ? "leader" : ""}`} key={p.id}>
          <span className="score-rank">{String(i + 1).padStart(2, "0")}</span>
          <Avatar id={p.avatar} size={compact ? 38 : 55} />
          <span className="score-name">
            {p.name}
            {p.bot && <small>DEMO</small>}
          </span>
          {p.movement !== 0 && (
            <span className={`movement ${p.movement > 0 ? "up" : ""}`}>
              {p.movement > 0 ? "↑" : "↓"}
              {Math.abs(p.movement)}
            </span>
          )}
          <span className="score-number">{p.score.toLocaleString()}</span>
          {p.delta > 0 && <span className="score-delta">+{p.delta}</span>}
        </div>
      ))}
    </div>
  );
}
export function Awards({ room }: { room: RoomView }) {
  const humans = room.players;
  const leader = [...humans].sort((a, b) => b.score - a.score)[0];
  const favorite = [...humans].sort((a, b) => b.votes - a.votes)[0];
  const fast = [...humans]
    .filter((p) => p.responseMs.length)
    .sort(
      (a, b) =>
        a.responseMs.reduce((s, x) => s + x, 0) / a.responseMs.length -
        b.responseMs.reduce((s, x) => s + x, 0) / b.responseMs.length,
    )[0];
  const artist = [...humans].sort(
    (a, b) => b.drawingPoints - a.drawingPoints,
  )[0];
  const awards = [
    leader
      ? {
          title: "ROOM ROYALTY",
          player: leader,
          detail: `${leader.score.toLocaleString()} points`,
          icon: "trophy",
        }
      : null,
    favorite && favorite.votes > 0
      ? {
          title: "CROWD FAVORITE",
          player: favorite,
          detail: `${favorite.votes} votes earned`,
          icon: "bubble",
        }
      : null,
    fast
      ? {
          title: "QUICK ON THE DRAW",
          player: fast,
          detail: `${(fast.responseMs.reduce((s, x) => s + x, 0) / fast.responseMs.length / 1000).toFixed(1)}s avg submission`,
          icon: "bolt",
        }
      : null,
    artist && artist.drawingPoints > 0
      ? {
          title: "ART DEPARTMENT",
          player: artist,
          detail: `${artist.drawingPoints} drawing points`,
          icon: "pencil",
        }
      : null,
  ].filter((x) => x !== null);
  return (
    <div className="awards">
      {awards.map((a) => (
        <div className="award" key={a.title}>
          <Icon name={a.icon} />
          <span>{a.title}</span>
          <Avatar id={a.player.avatar} size={55} />
          <b>{a.player.name}</b>
          <small>{a.detail}</small>
        </div>
      ))}
    </div>
  );
}
