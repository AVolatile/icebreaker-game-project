import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import type { Player, RoomView } from "../../shared/types";
import { Awards, Scoreboard } from "./RoomParts";
import { Avatar, Confetti, Icon, Star, Tag } from "./Visuals";
import { BoardSummary } from "./studio/BoardSummary";

export function HostFinale({
  room,
  standings,
  onRematch,
  onPresented,
}: {
  room: RoomView;
  standings: Player[];
  onRematch: () => void;
  onPresented: (room: RoomView) => void;
}) {
  useLayoutEffect(() => onPresented(room), [onPresented, room]);
  const winner = standings[0];
  const scoring = room.board?.scoring !== false;
  const tied = standings.filter((p) => p.score === winner?.score);
  return (
    <div className="final-screen">
      <Confetti />
      <section className="final-hero" aria-labelledby="final-title">
        <Tag color="#f6ed51">
          {scoring
            ? "OFFICIALLY THE PERSON TO BEAT."
            : "STRONG OPINIONS. GREAT COMPANY."}
        </Tag>
        {winner && scoring && (
          <>
            <div className="final-winner-heading">
              <div className="winner-avatar">
                <Star />
                <Avatar id={winner.avatar} size={180} />
              </div>
              <h1 id="final-title">
                {winner.name}
                <span>made the most ruckus.</span>
              </h1>
            </div>
            <div className="winner-points">
              <p>
                <strong>{winner.score.toLocaleString()}</strong> points
              </p>
              <p>Unlimited bragging rights.</p>
              {tied.length > 1 && tied.length <= 3 && (
                <p className="tie-note">
                  A shared crown: {tied.map((p) => p.name).join(", ")}.
                </p>
              )}
              {tied.length > 3 && (
                <details className="final-tie" onKeyDown={dismissDisclosure}>
                  <summary>
                    A shared crown: {tied.length} tied for first.
                  </summary>
                  <p>{tied.map((p) => p.name).join(", ")}.</p>
                </details>
              )}
            </div>
            <Awards room={room} />
          </>
        )}
        {!scoring && (
          <>
            <div className="final-crew" aria-hidden="true">
              {room.players.slice(0, 6).map((p) => (
                <Avatar key={p.id} id={p.avatar} size={80} />
              ))}
            </div>
            <h1 id="final-title">Every opinion counted.</h1>
            <p>A good room doesn’t need a winner.</p>
          </>
        )}
      </section>
      <Scoreboard players={room.players} stage finale />
      <div className="final-footer">
        <div className="final-actions">
          <button className="button yellow" onClick={onRematch}>
            Same crew. Rematch. <Icon name="arrow" />
          </button>
          <Link className="button light-outline" to="/host">
            New lineup
          </Link>
        </div>
        <details className="final-recap" onKeyDown={dismissDisclosure}>
          <summary>Session recap</summary>
          <div className="final-recap-panel">
            <div className="session-stats">
              <span>
                <b>{room.stats.rounds}</b> rounds
              </span>
              <span>
                <b>{room.stats.answers}</b> submissions
              </span>
              <span>
                <b>{room.stats.reactions}</b> reactions
              </span>
            </div>
            <BoardSummary room={room} />
          </div>
        </details>
      </div>
    </div>
  );
}

function dismissDisclosure(event: React.KeyboardEvent<HTMLDetailsElement>) {
  if (event.key !== "Escape") return;
  event.stopPropagation();
  event.currentTarget.open = false;
  event.currentTarget.querySelector("summary")?.focus();
}
