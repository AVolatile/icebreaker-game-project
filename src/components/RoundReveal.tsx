import { gameForRoom } from "../../shared/catalog";
import type { RoomView } from "../../shared/types";
import { Avatar, Icon, Tag } from "./Visuals";
import { Drawing } from "./Drawing";
export function RoundReveal({ room }: { room: RoomView }) {
  const game = gameForRoom(room);
  const submissions = [...room.submissions].sort((a, b) => b.votes - a.votes);
  const max = submissions[0]?.votes ?? 0;
  return (
    <div className="round-reveal">
      <Tag color={game.color}>ROUND {room.round + 1} / THE REVEAL</Tag>
      <h1>
        {game.category === "creative"
          ? max > 0
            ? "The room has spoken."
            : "The gallery is open."
          : room.prompt?.questionType === "poll"
            ? "Every opinion, on the board."
            : game.id === "room-temperature"
              ? "You’ve got a type."
              : "Truth has entered the room."}
      </h1>
      {room.prompt?.options ? (
        <>
          <div className="answer-distribution">
            {room.prompt.options.map((a, i) => (
              <div
                className={`distribution-row ${room.correct.includes(i) ? "correct" : ""}`}
                key={a}
              >
                <span>{"ABCDEF"[i]}</span>
                <b>{a}</b>
                <div className="distribution-track">
                  <i
                    style={{
                      width: `${(room.counts[i] / Math.max(1, ...room.counts)) * 100}%`,
                    }}
                  />
                </div>
                <strong>{room.counts[i] ?? 0}</strong>
                {room.correct.includes(i) && <Icon name="check" />}
              </div>
            ))}
          </div>
          {room.prompt.explanation && (
            <p className="fact-explanation">{room.prompt.explanation}</p>
          )}
          {game.id === "room-temperature" && room.correct.length > 1 && (
            <p className="fact-explanation">
              A split room. All tied majority answers earn points.
            </p>
          )}
        </>
      ) : (
        <div className="reveal-gallery">
          {submissions.map((s) => {
            const p = room.players.find((p) => p.id === s.author);
            return (
              <article
                key={s.id}
                className={`submission-card ${s.votes === max && max > 0 ? "winning" : ""}`}
              >
                {s.drawing ? (
                  <Drawing strokes={s.drawing} />
                ) : (
                  <h3>{s.text}</h3>
                )}
                <div className="submission-author">
                  {p && (
                    <>
                      <Avatar id={p.avatar} size={38} />
                      <b>{p.name}</b>
                    </>
                  )}
                  <span>
                    {s.votes} vote{s.votes !== 1 ? "s" : ""} · +{s.votes * 300}
                  </span>
                </div>
              </article>
            );
          })}
          {!submissions.length && (
            <p>No submissions this round. The next one is a fresh start.</p>
          )}
        </div>
      )}
    </div>
  );
}
