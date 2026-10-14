# Ruckus

**Clock out of ordinary.** A fictional workplace party-game startup with a real multiplayer product. One screen hosts the show; phones become controllers. Original branding, six playable games, twenty avatars, fifteen caption illustrations, and a complete campaign system.

Created by Anthony Volatile / Volatile Solutions as a self-initiated portfolio concept. No accounts, billing, invented clients, or external AI services.

## Run locally

Use **Node 22 LTS or newer** for the supported toolchain. Application checks also ran on Node 20.15.1; newer lint dependencies expect Node 20.19+.

```sh
npm install
npm run dev
```

Open **http://localhost:4310**. The server prints detected network addresses. Development runs Vite as middleware inside Express, alongside Socket.IO, on one port.

For the fastest solo experience, click **Take it for a spin** or **Try a demo party**. This creates a three-game, two-round, quick-paced playlist and eight bots. Click **Let’s make a ruckus**. All rounds, voting, intermissions, and final standings advance automatically. The presenter toolbar can move faster.

## Play with your phone

1. Put the computer and phone on the same Wi-Fi.
2. Run `npm run dev`. Open `http://localhost:4310/host` on the computer.
3. Choose a lineup and open the room. Scan its QR with your phone.
4. Enter a name (2–18 characters), choose an avatar, and join. The host lobby updates live.
5. Invite a second player or add demo players. Start the session.
6. Use the phone for answers, pitches, captions, drawings, votes, and reactions. Results are on the big screen.

The service binds to **0.0.0.0**. A host opening localhost gets a QR using the first detected LAN IPv4 address. With VPNs/multiple interfaces, select the intended address explicitly:

```sh
PUBLIC_JOIN_URL=http://192.168.1.20:4310 npm run dev
```

Alternatively copy `.env.example` to `.env` and set `PUBLIC_JOIN_URL`. It is an **origin**, without `/join`. Phones can also open the printed Phone URL and visit `/join`, then type the code. On macOS, `ipconfig getifaddr en0` often shows the Wi-Fi address. Guest Wi-Fi/client isolation, VPNs, and firewall rules can prevent LAN joins; use a shared non-isolated network and allow the Node process on the local network.

The host can play too: open **Host controls → Join as a player**, which opens a separate tab, or scan the QR on a phone. Identity is stored per tab so a phone/controller does not replace the presenter.

## Game library

| Game             | Mechanic                                           | Server scoring                                   | Content                                  |
| ---------------- | -------------------------------------------------- | ------------------------------------------------ | ---------------------------------------- |
| Hotwire          | Four-choice timed trivia                           | Correct: 500–1,000 based on active response time | 21 original questions across seven packs |
| Room Temperature | Predict the group’s most popular choice            | 600 for each tied majority answer                | 12 original opinion prompts              |
| Sellout          | Product name + one-line pitch, anonymous voting    | 300 per vote received                            | 12 absurd product briefs                 |
| Caption This     | Caption an original illustration, anonymous voting | 300 per vote received                            | 15 original SVG scenes                   |
| Odd One In       | Find a real fact among curated bluffs              | 700 for a correct pick                           | 10 original question sets                |
| Scribble Shift   | Phone SVG drawing, anonymous gallery voting        | 300 per vote received                            | 12 drawing prompts                       |

Each session contains 1–6 games, 1–5 rounds per game, and 2–30 players. Timers support quick, normal, and relaxed pace. Normal choice rounds are 15 seconds; creative rounds 45 seconds; voting 20 seconds. Intro lasts 5 seconds, results 9 seconds, and intermission 10 seconds. Preset minutes are approximate; number of games and rounds determine actual playtime.

Pack selection filters supported choice prompts; games without a matching pack use their full content pool. Creative prompts use their own libraries. Work-friendly mode and anonymous voting are always enabled. Team scoring is not implemented.

## Architecture

```text
src/
  components/       avatars, layout, QR, timers, scoreboards, drawing tools
  pages/            marketing, setup, host, phone, brand, campaign, case study
  lib/              socket provider, Web Audio sounds
  styles/           foundation/marketing, gameplay, portfolio, responsive/motion
shared/
  types.ts          room/player/input/event contracts
  catalog.ts        public game metadata, settings, packs, avatars
server/
  index.ts          Express + Vite/static frontend + Socket.IO transport
  engine.ts         authoritative room state, timers, bot tasks, scoring
  content.ts        server-only answers, original prompts and bot text
  validation.ts     Zod schemas, name/text checks, rate limiting
public/
  avatars/          20 original editable SVG characters
  scenes/           15 original caption illustrations
  brand/            symbol/app icon/favicon and wordmark
  campaign/         64 scalable graphic formats + 5 HTML email previews
scripts/            asset generation and visual review
 tests/             engine, real-socket, browser and accessibility checks
portfolio-assets/   capture guide, exported screenshots, cover
 docs/              deployment and completion report
```

**Host/player model:** random host UUID token authorizes host-only controls. Player UUID tokens reconnect an existing identity. Room codes are five characters and exclude 0/O/1/I. Scores, eligibility, prompts, deadlines, and transitions live on the server. Question answers/explanations remain server-only until reveal. The public catalogue contains no answer keys.

**Lifecycle:** lobby → intro → active → voting (creative games with at least two entries) → results → another round, intermission, or final → rematch / ended. Every phase is a typed union managed in `Room`, not separate client state machines. Inputs carry a phase/round identifier and are rejected when stale. Scores reset on rematch, identities remain.

**Synchronization:** the server broadcasts snapshots on state changes. Each client renders a local countdown from the deadline and server timestamp. There is no once-per-second socket polling. Drawing uses normalized vector strokes, sent once on submission. WebSocket upgrades are supported with Socket.IO’s normal polling fallback.

**Reconnect:** per-tab session storage saves the room code, role, and token. Socket reconnect and refresh reattach the same player and score; duplicate player tabs move control to the latest connection. Removed identities cannot resume. Draft text/drawings are local and do not survive a full refresh. Late joiners watch the current round and play from the next. Hosts can reconnect for up to five minutes; after that the room ends.

**Rooms:** single-process, in-memory state, up to 500 rooms, a 30-player cap, inactive-room expiration after two hours, ended-room cleanup after one minute. A restart clears all rooms. There is no distributed adapter or persistence.

**Bots:** host buttons add 4/8/12 fictional players, subject to room capacity. Safe prewritten pitches/captions, varied response delays, randomized choices, vector doodles, and non-self voting pass through the same scoring engine. No AI APIs. Demo labels distinguish bots from actual players.

## Host controls

Presenter toolbar: next/close round, pause/resume, mute, full screen, host drawer. Drawer: lock room, separate controller link, remove player, end room with confirmation. Final screen: rematch, new lineup, standings, awards, actual submission/round/reaction totals.

Keyboard shortcuts: **Space** next/start, **P** pause, **M** sound, **F** full screen, **H** controls. Shortcuts avoid form controls. Timers, input acceptance, and bots all stop while paused. Sound begins muted and uses original low-volume Web Audio tones after host interaction.

## Accessibility and moderation

Semantic landmarks and headings, skip link, visible focus, labeled fields, field-specific validation, live confirmation/error feedback, 44px-or-larger primary phone controls, answer text plus letters, keyboard drawing (arrows move, Space toggles pen, Escape lifts), reduced-motion support, and no sound-only cues. Relaxed pace helps hosts accommodate the group. This is not a certified accessibility audit; screen-reader testing on physical devices remains valuable.

User-controlled names and submissions render as text, never injected HTML. Zod bounds input lengths, avatar IDs, choices, drawing coordinates/colors/widths/strokes. Basic bad-word/control-character/markup filtering is intentionally limited; it is not comprehensive automated moderation. Hosts can lock, remove, or end. Create/join, input, and reaction events are rate-limited; Socket.IO payloads are bounded. Same-origin browser access is required unless `ALLOWED_ORIGINS` explicitly adds an origin. HTTPS is recommended on public deployment.

## Build and deploy

```sh
npm run build
npm start
```

The production process serves `dist/`, Socket.IO, and `/api/health` on the same port. `PORT` defaults to 4310 and binds to 0.0.0.0. Set `PUBLIC_JOIN_URL=https://your-hosted-origin.example` for public QR codes. See [deployment guidance](docs/DEPLOYMENT.md).

Use one persistent Node instance with WebSocket support. Generic examples include a Node web service/container on Render, Railway, or Fly.io. Static hosting alone cannot run the room server. Deploying this project is optional and no public deployment has been created.

## Validate

Start the app first, then:

```sh
npm run typecheck
npm run lint
npm test
TEST_ORIGIN=http://localhost:4310 npm test
# Optional ~2-minute full autoplay check:
AUTOPLAY_ORIGIN=http://localhost:4310 npm test
npx playwright install chromium
npm run test:e2e
node scripts/accessibility-check.mjs
npm run build
```

Without `TEST_ORIGIN`, `npm test` runs engine checks and explicitly skips the live socket suite. Live socket checks use independently connected clients, cover all six games, host authorization, locking, late joins, reconnect, and end. Browser tests cover actual host/controller interactions, responsive layouts, keyboard drawing, and console errors. Automated device contexts are not proof of physical phone or projector testing.

## Portfolio and brand

Routes: `/`, `/games`, six `/games/:slug` pages, `/how-it-works`, `/for-teams`, `/remote`, `/pricing`, `/resources`, `/about`, `/host`, `/join`, `/brand`, `/campaign`, `/case-study`.

Brand: electric cobalt, acid yellow, warm paper/ink, five game accent colors. Locally hosted Bricolage Grotesque and DM Sans. Original ink-line SVG avatars, geometric icons, reveal motion, and a confident workplace-friendly voice.

Campaign: eight territories, five featured posters, square/feed/story social formats, 300×250 / 728×90 / 160×600 / 970×250 display formats, five responsive HTML emails, and an event activation concept. Assets are downloadable on `/campaign`; no emails were sent.

Use [the export guide](portfolio-assets/EXPORT-GUIDE.md) and [completion report](docs/COMPLETION-REPORT.md). Only demonstrate implemented capabilities and label fictional/demo content clearly.

> This is a self-initiated concept project created to demonstrate multiplayer product design, game mechanics, real-time frontend engineering, brand strategy, motion, and campaign execution.

## Regenerating design assets (optional)

The committed assets work without Python. To rebuild the editable illustrations, campaign formats, emails, and outlined wordmark:

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
npm run assets
```

Typography outlines use the locally installed, licensed Bricolage Grotesque font. `node scripts/export-cover.mjs` renders the editable cover after product screenshots exist.
