import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Icon, Logo, Star, Tag } from "../components/Visuals";
import { GameCard } from "../components/GameCard";
import { GAMES, DEFAULT_SETTINGS } from "../../shared/catalog";
import { useParty } from "../lib/party";
import { ErrorMessage } from "../components/Layout";
import { DrawnArrow, HomeOnboarding } from "../components/HomeOnboarding";
export function DemoButton({
  className = "button",
  children = "Try a demo party",
  describedBy,
}: {
  className?: string;
  children?: string;
  describedBy?: string;
}) {
  const party = useParty(),
    navigate = useNavigate(),
    [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy}
      aria-describedby={describedBy}
      onClick={async () => {
        setBusy(true);
        const reply = await party.create(
          { ...DEFAULT_SETTINGS, rounds: 2, pace: "quick" },
          true,
        );
        setBusy(false);
        if (reply.ok && reply.identity)
          navigate(`/room/${reply.identity.code}/host`);
      }}
    >
      {busy ? "Calling the crew…" : children}
      <Icon name="arrow" />
    </button>
  );
}
export function StagePreview() {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="hero-playground">
      <span className="preview-label">
        <Icon name="screen" /> HOST SCREEN · LAPTOP / TV
      </span>
      <div className="preview-stage">
        <div className="preview-stage-header">
          <Logo light />
          <span>
            ROOM TEMP. <span className="mini-pill">01 / 03</span>
          </span>
        </div>
        <div className="preview-stage-body">
          <span className="preview-eyebrow">THE ROOM HAS OPINIONS.</span>
          <h2>
            Pick the office
            <br />
            mascot.
          </h2>
          <div className="preview-answers">
            {["Pigeon", "Raccoon", "Tired robot", "Stapler"].map((a, i) => (
              <button
                key={a}
                className={pick === i ? "selected" : ""}
                onClick={() => setPick(i)}
              >
                <span>{"ABCD"[i]}</span>
                {a}
                {pick === i && <b>✓</b>}
              </button>
            ))}
          </div>
          <p className="preview-feedback" aria-live="polite">
            {pick === null
              ? "Just a preview. Tap an answer."
              : pick === 0
                ? "Excellent. Upper management material."
                : pick === 1
                  ? "Great at scavenging the snack budget."
                  : pick === 2
                    ? "Already knows how we feel on Mondays."
                    : "Finally, someone holding it together."}
          </p>
        </div>
        <div className="preview-stage-players">
          {[1, 3, 5, 7, 14].map((id, i) => (
            <div key={id}>
              <Avatar id={id} size={45} />
              <span>{["Maya", "Jordan", "Priya", "Mateo", "You"][i]}</span>
            </div>
          ))}
          <span className="preview-plus">+ your people</span>
        </div>
      </div>
      <div className="hero-phone">
        <span className="player-device-label">PLAYER PHONE</span>
        <div className="phone-speaker" />
        <div className="phone-top">
          <Logo />
          <span>PREVIEW</span>
        </div>
        <span className="phone-status">YOU’RE IN.</span>
        <Avatar id={5} size={104} />
        <h3>
          Nice to meet
          <br />
          your competitive side.
        </h3>
        <div className="phone-answer">
          {pick !== null ? "Answer locked. ✓" : "Your phone. Your controller."}
        </div>
        <div className="phone-reactions">👏 🔥 👀</div>
      </div>
      <div className="sticker no-download">
        ZERO
        <br />
        DOWNLOADS.
        <Star />
      </div>
      <div className="sticker meeting-sticker">
        Meeting mode
        <br />
        <s>ON</s> <b>OFF ↗</b>
      </div>
      <Avatar id={1} size={93} className="floating-bandit" />
      <Star className="hero-star" />
      <span className="hero-scribble">
        Your phone.
        <br />
        Your controller. <DrawnArrow />
      </span>
    </div>
  );
}
export function Home() {
  const { error } = useParty();
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <Tag>
            <span className="live-dot" /> MULTIPLAYER. MINUS THE MEETING.
          </Tag>
          <h1>
            Clock out
            <br />
            of <span className="outlined">ordinary.</span>
            <Star />
          </h1>
          <p>
            Your conference room has a game mode.
            <br />
            Party games on the big screen. Everyone plays from their phone.
          </p>
          <div className="hero-host-note" id="host-action-note">
            <strong>Host the game on this screen.</strong>
            <span>Players scan your room’s QR code with their phones.</span>
          </div>
          <div className="hero-actions">
            <div className="hero-action">
              <Link
                className="button"
                to="/host"
                aria-describedby="host-action-note"
              >
                Start a ruckus <Icon name="arrow" />
              </Link>
              <small>Host a room · choose your games</small>
            </div>
            <div className="hero-action">
              <DemoButton
                className="button text-button"
                children="Take it for a spin"
                describedBy="demo-action-note"
              />
              <small id="demo-action-note">
                Host a demo · 8 bot players included
              </small>
            </div>
          </div>
          <ErrorMessage message={error} />
          <p className="hero-player-path">
            Got a room code?{" "}
            <Link to="/join">
              Join a room <span aria-hidden="true">↗</span>
            </Link>
            <span>That’s the player entrance.</span>
          </p>
          <aside className="hero-solo-tip" aria-label="Solo demo tip">
            <span className="solo-tip-label">FLYING SOLO?</span>
            <p>
              Keep this open on your laptop. Scan the room’s QR with your phone.
              Add demo players in the lobby, then start on your laptop.
            </p>
          </aside>
          <div className="hero-fine">
            <span>✳ 2–30 people</span>
            <span>No accounts</span>
            <span>Just bring your phone</span>
          </div>
        </div>
        <StagePreview />
      </section>
      <HomeOnboarding />
      <div
        className="ticker"
        aria-label="Six games. Zero awkward introductions."
      >
        <div>
          SIX GAMES <span>✳</span> ZERO AWKWARD INTRODUCTIONS <span>✳</span> BIG
          SCREEN ENERGY <span>✳</span> SMALL SCREEN CONTROLS <span>✳</span> SIX
          GAMES <span>✳</span> ZERO AWKWARD INTRODUCTIONS <span>✳</span>
        </div>
      </div>
      <section className="section games-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MEET THE LINEUP</span>
            <h2>
              A little something
              <br />
              for every kind of loud.
            </h2>
          </div>
          <Link className="button outline" to="/games">
            All six games <Icon name="arrow" />
          </Link>
        </div>
        <div className="game-grid">
          {GAMES.map((g, i) => (
            <GameCard key={g.id} game={g} index={i} />
          ))}
        </div>
      </section>
      <section className="phone-feature">
        <div className="phone-feature-art">
          <div className="controller-preview">
            <div className="phone-top">
              <Logo />
              <span>HOTWIRE</span>
            </div>
            <Tag color="#ff7448">ROUND 01</Tag>
            <h3>
              What’s the tiny tip
              <br />
              of a shoelace called?
            </h3>
            {["Ferrule", "Aglet", "Grommet", "Toggle"].map((a, i) => (
              <div
                className={`controller-option ${i === 1 ? "is-correct" : ""}`}
                key={a}
              >
                <span>{"ABCD"[i]}</span>
                {a}
                {i === 1 && <span>✓</span>}
              </div>
            ))}
            <span className="phone-caption">
              Look up. Your points are on the big screen.
            </span>
          </div>
          <Avatar id={3} size={130} />
          <Star />
        </div>
        <div className="phone-feature-copy">
          <span className="eyebrow">POCKET-SIZED POWER MOVES</span>
          <h2>
            Your phone
            <br />
            just got a<br />
            <span>better job.</span>
          </h2>
          <p>
            Big, thumb-friendly buttons. A canvas for your questionable art. A
            place for your dangerously good pitches. Everyone gets their own
            controller.
          </p>
          <Link to="/how-it-works" className="button yellow">
            See how it works <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <section className="section occasions">
        <div className="section-heading">
          <div>
            <span className="eyebrow">UNREASONABLY GOOD TIMING</span>
            <h2>
              For the gaps
              <br />
              worth filling.
            </h2>
          </div>
          <p>
            There’s a Ruckus-shaped opening
            <br />
            in your calendar.
          </p>
        </div>
        <div className="occasion-grid">
          {[
            {
              time: "10:43 AM",
              title: "The meeting ended early.",
              text: "That’s seventeen minutes you can’t put back in the calendar.",
              avatar: 11,
            },
            {
              time: "FRIDAY, 4:00",
              title: "The week needs an outro.",
              text: "Close the tabs. Open a room. Find out who’s secretly competitive.",
              avatar: 1,
            },
            {
              time: "ANY TIME ZONE",
              title: "Different desks. Same room.",
              text: "Share your screen on the call. Let the phones handle the rest.",
              avatar: 19,
            },
          ].map((o) => (
            <Link
              to={o.avatar === 19 ? "/remote" : "/for-teams"}
              className="occasion"
              key={o.title}
            >
              <span className="eyebrow">{o.time}</span>
              <Avatar id={o.avatar} size={80} />
              <h3>{o.title}</h3>
              <p>{o.text}</p>
              <Icon name="arrow" />
            </Link>
          ))}
        </div>
      </section>
      <section className="demo-banner">
        <div>
          <Tag>THE PARTY OF ONE, PLUS EIGHT.</Tag>
          <h2>
            No coworkers handy?
            <br />
            We know some people.
          </h2>
          <p>
            Meet Maya, Priya, and the demo crew. They answer, vote,
            <br />
            and take the competition just seriously enough. You host on this
            screen; scan the room’s QR with your phone to play along.
          </p>
          <DemoButton className="button yellow" children="Host a demo party" />
          <ErrorMessage message={error} />
        </div>
        <div className="demo-avatar-stack">
          {[1, 3, 14, 9, 7, 5].map((id, i) => (
            <Avatar key={id} id={id} size={110} className={`stack-${i}`} />
          ))}
        </div>
      </section>
      <section className="home-studio">
        <div>
          <Tag>INTRODUCING RUCKUS STUDIO</Tag>
          <h2>
            Your questions.
            <br />
            Their competitive side.
          </h2>
          <p>
            Company lore. Snack debates. A specialist subject nobody saw coming.
            Make your own questions in Studio, then preview or host your board.
          </p>
          <Link to="/studio" className="button">
            Build your own board <Icon name="arrow" />
          </Link>
          <Link to="/games" className="studio-demo-link">
            Or play a Ruckus Original ↗
          </Link>
        </div>
        <div className="home-studio-card">
          <span>THE CREATOR’S SEAT</span>
          <h3>Friday Team Trivia</h3>
          <div>
            <b>A</b>Things only this team knows <Icon name="check" />
          </div>
          <div>
            <b>B</b>Everyone’s excellent snack opinions
          </div>
          <div>
            <b>C</b>Your next great question
          </div>
          <p>CREATE → PREVIEW → PLAY</p>
        </div>
      </section>
      <section className="final-cta">
        <span className="eyebrow">BRAGGING RIGHTS START HERE.</span>
        <h2>
          Make a little
          <br />
          <span>ruckus.</span>
          <Star />
        </h2>
        <Link className="button" to="/host">
          Host your own ruckus <Icon name="arrow" />
        </Link>
        <p>Host on this screen. Players join from their phones.</p>
      </section>
    </>
  );
}
