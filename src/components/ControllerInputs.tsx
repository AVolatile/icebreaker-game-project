import { useState, type FormEvent } from "react";
import { gameForRoom } from "../../shared/catalog";
import type { RoomView, Stroke } from "../../shared/types";
import { useParty } from "../lib/party";
import { Avatar, Icon } from "./Visuals";
import { Drawing, DrawingPad } from "./Drawing";
export function PlayerInput({ room }: { room: RoomView }) {
  const party = useParty(),
    [text, setText] = useState(""),
    [product, setProduct] = useState(""),
    [strokes, setStrokes] = useState<Stroke[]>([]),
    [busy, setBusy] = useState(false),
    [tried, setTried] = useState(false);
  const game = gameForRoom(room);
  const disabled = busy || room.paused || !party.connected;
  async function submit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    const value =
      game.id === "sellout"
        ? `${product.trim()} — ${text.trim()}`
        : text.trim();
    if (
      game.id === "sellout" &&
      (product.trim().length < 2 || text.trim().length < 2)
    )
      return;
    if (game.id === "caption-this" && text.trim().length < 2) return;
    if (game.id === "scribble-shift" && !strokes.length) return;
    setBusy(true);
    await party.input(
      game.id === "scribble-shift" ? { drawing: strokes } : { text: value },
    );
    setBusy(false);
  }
  if (room.ownSubmission)
    return (
      <div className="player-confirmation">
        <span className="confirmation-icon">
          <Icon name="check" />
        </span>
        <h2>
          {game.id === "scribble-shift"
            ? "A masterpiece. Probably."
            : "Locked. Loaded. Lovely."}
        </h2>
        <p>
          {game.category === "creative"
            ? "Your entry is in. Look up for the reveal, then vote on your phone."
            : "Your answer is in. Look up at the big screen for the reveal."}
        </p>
        <Avatar
          id={room.players.find((p) => p.id === room.you)?.avatar}
          size={135}
        />
        <span className="waiting-dots">● ● ●</span>
      </div>
    );
  if (!room.eligible)
    return (
      <div className="player-confirmation">
        <Avatar id={19} size={120} />
        <h2>Impeccable entrance.</h2>
        <p>
          You joined mid-round. Watch this one; you’re playing from the next
          round.
        </p>
      </div>
    );
  if (game.category !== "creative")
    return (
      <div className="player-answers">
        {room.prompt?.options?.map((a, i) => (
          <button
            disabled={disabled}
            className={`player-answer answer-${i}`}
            key={a}
            onClick={async () => {
              setBusy(true);
              await party.input({ choice: i });
              setBusy(false);
            }}
          >
            <span>{"ABCDEF"[i]}</span>
            <b>{a}</b>
            <Icon name="arrow" />
          </button>
        ))}
      </div>
    );
  return (
    <form onSubmit={submit} className="player-creative">
      {game.id === "scribble-shift" ? (
        <>
          <DrawingPad onChange={setStrokes} disabled={disabled} />
          {tried && !strokes.length && (
            <p className="field-error">Draw something before sending.</p>
          )}
        </>
      ) : (
        <>
          {game.id === "sellout" && (
            <>
              <label htmlFor="product-name">Product name</label>
              <input
                id="product-name"
                placeholder="The next big, terrible thing"
                maxLength={32}
                value={product}
                disabled={disabled}
                onChange={(e) => setProduct(e.target.value)}
                aria-invalid={tried && product.trim().length < 2}
              />
              {tried && product.trim().length < 2 && (
                <p className="field-error">
                  Give your idea a name of at least two characters.
                </p>
              )}
            </>
          )}
          <label htmlFor="submission-text">
            {game.id === "sellout" ? "Your one-line pitch" : "Your caption"}
          </label>
          <textarea
            id="submission-text"
            rows={4}
            maxLength={game.id === "sellout" ? 120 : 160}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            placeholder={
              game.id === "sellout"
                ? "Sell it like your lunch break depends on it."
                : "What’s really going on here?"
            }
            aria-invalid={tried && text.trim().length < 2}
          />
          <div className="text-counter">
            {text.length} / {game.id === "sellout" ? 120 : 160}
          </div>
          {tried && text.trim().length < 2 && (
            <p className="field-error">Give us at least two characters.</p>
          )}
        </>
      )}
      <button className="button full" disabled={disabled}>
        {busy
          ? "Sending your genius…"
          : game.id === "scribble-shift"
            ? "Send my masterpiece"
            : "Put it on the big screen"}
        <Icon name="arrow" />
      </button>
    </form>
  );
}
export function PlayerVoting({ room }: { room: RoomView }) {
  const party = useParty(),
    [busy, setBusy] = useState(false);
  if (room.ownVote)
    return (
      <div className="player-confirmation">
        <span className="confirmation-icon">
          <Icon name="check" />
        </span>
        <h2>Your vote is in.</h2>
        <p>Excellent taste. Probably. The big screen has the final word.</p>
      </div>
    );
  if (!room.eligible)
    return (
      <p className="waiting-note">
        Enjoy the gallery. You’ll play from the next round.
      </p>
    );
  return (
    <div className="player-votes">
      {room.submissions.map((s, i) => {
        const own = s.id === room.ownEntryId;
        return (
          <button
            className="player-vote"
            key={s.id}
            disabled={own || busy || room.paused || !party.connected}
            onClick={async () => {
              setBusy(true);
              await party.input({ vote: s.id });
              setBusy(false);
            }}
          >
            <span className="submission-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            {s.drawing ? <Drawing strokes={s.drawing} /> : <b>{s.text}</b>}
            <span className="vote-cta">
              {own
                ? "YOUR ENTRY · GIVE SOMEONE ELSE THE SPOTLIGHT"
                : "This one gets my vote ↗"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
