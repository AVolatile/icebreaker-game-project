# Ruckus — completion report

Built for Anthony Volatile / Volatile Solutions. Completed October 14, 2026. A fictional startup identity with a functioning real-time multiplayer product and original portfolio/campaign assets.

## Brand

- **Name:** Ruckus. A short, expressive name for a good-natured commotion, easy to say across a conference room.
- **Positioning:** Turn the screen everyone already has into something everyone can play.
- **Tagline:** Clock out of ordinary.
- **Symbol:** An energetic R with a spark; used as favicon/app icon and standalone brand mark.
- **Wordmark:** Custom-set lowercase Bricolage Grotesque with a spark. Standalone export uses outlined font glyphs.
- **Palette:** electric blue `#2548F4`, after-hours yellow `#F6ED51`, paper `#F9F7ED`, ink `#191A24`; accents pink `#FFA9D2`, green `#C0EE7B`, orange `#FF7448`, sky `#A9D9F6`, lilac `#B7AFF8`, and amber `#FFCC67`.
- **Typography:** locally hosted Bricolage Grotesque Variable for display and DM Sans Variable for interfaces. Font licenses are included.
- **Avatars:** 20 original ink-line SVG characters: Orbit, Bandit, Boo, Frogbert, Toast, Pidge, Prickle, Beep, Jelly, Peel, Rex, Espresso, Shroom, Fin, Visitor, Quack, Noodle, Miso, Grizzly, Nimbus.
- **Visual language:** oversized type, saturated stage colors, geometric sparks, physical sticker/card edges, expressive character entrances, and clear host/player separation.
- **Voice:** confident, lightly mischievous, workplace-friendly. Humor in prompts and waiting states; practical language in errors.

## Multiplayer architecture

One Express/Node process serves the React frontend, `/api/health`, and Socket.IO. In development Vite runs as middleware on the same HTTP service; production serves built static assets.

Rooms use random five-character codes, excluding 0/O/1/I. Each room contains settings, players, private host/player tokens, phase, playlist index, round, entries, votes, scores, timer deadline, connectivity, and actual session statistics. Up to 30 players; up to 500 in-memory rooms.

QR codes are real, generated from `/join?room=CODE` on the configured public/LAN origin. The host opening localhost receives a detected LAN address; `PUBLIC_JOIN_URL` overrides it.

The server owns scores, timers, eligibility, and transitions. Clients send intent; inputs are schema-validated and tagged with the current round/phase. Public snapshots omit answer keys and unpublished creative submissions. Countdown rendering happens locally using the server deadline/time reference, without second-by-second polling.

Per-tab session storage holds identity. Refresh/reconnect restores the same player and score, or host role, using a random token. Duplicate player connections move control to the latest tab. Removed players cannot resume. Draft text/drawings do not survive full refreshes.

## Host experience

`/host` provides approximate 5/10/20/30-minute presets, custom game selection/order, 1–5 rounds, seven content packs, quick/normal/relaxed pace, late-join rules, reactions, and automatic transitions.

`/room/:code/host` is the presenter stage: live avatars, QR/code/link, demo invitations, giant instructions, timer, answer distribution, anonymous voting gallery, scores, intermission, winner, awards, and rematch. Large voting galleries page through entries; the host can hold or change the page, while phones retain the full ballot.

Toolbar/drawer controls include start, next/close/skip through phases, pause/resume, sound, fullscreen, lock/unlock, remove player, separate player-tab link, and end-room confirmation. Keyboard shortcuts: Space, P, M, F, H. End confirmation traps focus and supports Escape.

## Player experience

`/join`: room code → 2–18-character name → avatar → join. QR-prefilled code, no account, email, password, or download. Duplicate names receive a specific correction message.

`/room/:code/play`: personal identity/score, waiting lobby, four-choice controller, product/caption forms, drawing canvas, anonymous ballot, locked-in confirmation, personal result, leaderboard, reactions, and ended-room feedback. Late arrivals watch until the next round. Disconnection/reconnection and host absence are explicitly shown.

## Games

### Hotwire

- **Mechanic:** timed four-choice trivia.
- **Interaction:** phone answer buttons; host question and reveal.
- **Scoring:** correct answer earns 500–1,000 points based on active response speed.
- **Flow:** intro → question → lock/reveal → scores → another round/final.
- **Content:** 21 original questions across general/weird, food, travel, work, internet, and screen topics.

### Room Temperature

- **Mechanic:** predict the group’s majority choice, with no objective correct answer.
- **Interaction:** four choices on the phone; host distribution at reveal.
- **Scoring:** 600 points for any tied majority option. Absent options never win.
- **Flow:** intro → opinion prompt → choices → majority reveal → scores.
- **Content:** 12 original prompts about snacks, meetings, desks, travel, and everyday preferences.

### Sellout

- **Mechanic:** pitch an absurd product.
- **Interaction:** product name + one-line pitch, then one anonymous vote for someone else.
- **Scoring:** 300 points per vote received.
- **Flow:** intro → writing → anonymous gallery/ballot → authored reveal → scores.
- **Content:** 12 original briefs, from a compliment printer to a chair subscription; bot entries match the current brief.

### Caption This

- **Mechanic:** caption an original work-safe illustrated scene.
- **Interaction:** short caption, anonymous ballot, no self-voting.
- **Scoring:** 300 points per vote received.
- **Flow:** illustrated prompt → writing → voting → authored reveal → scores.
- **Content:** 15 original SVG scenes with scene-specific bot captions: office pigeon, promoted cactus, tired coffee machine, quarterly raccoon, and more.

### Odd One In

- **Mechanic:** spot the real fact among curated bluffs.
- **Interaction:** four-choice phone controller, fact explanation on the host reveal.
- **Scoring:** 700 points for a correct answer.
- **Flow:** prompt → select → reveal truth/explanation → scores.
- **Content:** 10 original question/decoy sets.

### Scribble Shift

- **Mechanic:** quick phone drawing followed by anonymous voting.
- **Interaction:** normalized SVG strokes, six colors including white eraser, three widths, undo/clear, send, vote. Keyboard support: arrows move, Space toggles pen, Escape lifts it.
- **Scoring:** 300 points per vote received.
- **Flow:** prompt → drawing → anonymous gallery → ballot → authored reveal → scores.
- **Content:** 12 drawing prompts; demo sketches vary in color, form, and line wobble, with recognizable mug/chair/robot/bird/plant/cat structures.

Creative rounds with fewer than two submissions reveal the available work directly, rather than offering an impossible self-only ballot. Submitted entries are immutable; duplicate votes/answers, self-votes, late inputs, and paused inputs are rejected.

## Demo Party

Homepage/host demo creates a room, eight fictional players, and a curated Room Temperature → Hotwire → Sellout mix with two rounds and quick pace. Press Start; the session progresses automatically. Hosts can also add 4/8/12 bots at a time, within the 30-player cap.

Bots use varied response delays, probabilistic choice answers, safe predefined prompt-specific creative entries, vector drawings, randomized non-self voting, and genuine server scoring. No external AI calls.

A live 12-bot, three-game, one-round-per-game session completed automatically in the test run, producing 36 submissions and vote-based scores.

## Game engine

All games share one authoritative `Room` engine and typed public/event contracts. The lifecycle is lobby → intro → active → voting/reveal → results → another round/intermission → final → rematch/ended. Choice and creative games specialize input validation/scoring inside this common lifecycle.

Phase changes clear previous timers and bot tasks. Pausing freezes active time, submissions, and bot scheduling. Resuming reschedules unfinished bot actions and restores the remaining deadline. Rematch resets scores/statistics, preserves identities, and changes the content offset.

## Mobile

Phone layouts are purpose-built controllers, with large answer buttons, field-specific form errors, clear submission acknowledgments, full ballots, reactions, and score feedback. Joining and drawing were checked at 320, 375, 390, and 430px. A distinct per-tab identity permits host and controller tabs on one computer.

## Big screen

Host layouts were checked at 1024×768, 1280×720, 1440×810, and 1920×1080. Large prompts/timers and safe margins prioritize distance readability. Short-screen rules keep the lobby Start action above the fixed presenter toolbar. A 30-player lobby was specifically checked at 1280×720. Longer rosters/standings use readable scrolling; larger voting galleries use pages rather than shrinking every entry.

## Campaign

- **Eight territories:** agenda plot twist; projector personality; no harmed fun facts; reply all/play all; the meeting worth running over; same Wi-Fi/different wavelength; bragging rights/no paperwork; less agenda/more Ruckus.
- **OOH:** five featured posters, plus vector variants across all eight territories.
- **Social:** 1080×1080, 1080×1350, and 1080×1920 vectors, combining brand headlines with character/controller graphics.
- **Display:** 300×250, 728×90, 160×600, 970×250; modular vector artwork.
- **Email:** five responsive HTML concepts: launch, Friday, game drop, office party, remote. Inline styles; no messages sent.
- **Activation:** a proposed 17-minute conference-break takeover, using the functioning room product.

64 original scalable graphic files and five HTML email previews are committed in `public/campaign/`.

## Brand system

`/brand` presents strategy, naming, positioning, downloadable identity marks, palette, typography specimens, twenty avatars, icons, buttons, game cards, screen/controller compositions, motion, sound, and voice. Supporting campaign surfaces are linked for a complete brand presentation.

## Case study

`/case-study` explains the opportunity, host/player UX, system architecture, server authority, lifecycle, reconnection, six mechanics, bot mode, visual identity, moderation, accessibility, and honest scope. It includes the requested self-initiated-project disclaimer and only implemented product claims.

## Accessibility

Semantic landmarks/headings, skip link, visible focus, labeled forms, field-specific errors, live state/error feedback, answer text plus letters, keyboard navigation/drawing, end-dialog focus handling, reduced motion, and sound muted by default. Relaxed timers are available; no essential cue relies on audio.

Automated WCAG A/AA smoke checks pass on homepage, host setup, join, game library, brand, campaign, case study, 30-player host lobby, phone lobby, active host trivia, phone answer controls, and end-room dialog. This is smoke testing, not formal certification or a physical screen-reader audit.

## Moderation

Host-token authorization for control actions. Lock joins, remove players, or end the room. Always-work-friendly prompts, anonymous voting, no self-votes. Basic profanity/control-character/markup checks, safe text rendering, input schemas, 150KB socket payload limit, drawing coordinate/color/width/stroke/total-point limits, and creation/join/input/reaction rate limits.

Text safety is intentionally limited and does not replace a host’s judgment. No permanent employee metrics, profiles, account data, or billing data are collected.

## Architecture

React + TypeScript + Vite + Express + Socket.IO + Zod + locally hosted fonts + QR generation + SVG drawing + Web Audio. Frontend code is organized into reusable components, route pages, socket/sound helpers, and four CSS modules. Shared contracts and public catalogue are separate from server-only content and answer keys.

The build produces `dist/` for the client and `dist-server/` for Node. One process is the deployment unit; a non-root Node 22 Dockerfile is included. Rooms are in-memory, single-instance, and clear on restart. Multi-instance persistence/team scoring/account management are outside the implemented scope.

## Validation

| Check                                 | Result                                                            |
| ------------------------------------- | ----------------------------------------------------------------- |
| TypeScript frontend/shared/server     | Passed                                                            |
| ESLint                                | Passed                                                            |
| Client production build               | Passed                                                            |
| Server TypeScript build               | Passed                                                            |
| Development startup                   | Passed on port 4310                                               |
| Production startup                    | Passed with health/static client/socket checks on a separate port |
| Core engine cases                     | 8 passed                                                          |
| Live socket suite                     | Passed: independent host and player connections, all six games    |
| Full automatic bot session            | Passed: 12 bots, three games, 36 submissions                      |
| Full suite with live/autoplay enabled | 10 passed, no skips in that run                                   |
| Browser product journeys              | 3 passed                                                          |
| Host/player refresh                   | Covered in browser journeys                                       |
| QR generation/join address            | Generated and checked; physical-camera scan not performed         |
| Responsive                            | Listed phone, marketing, and host sizes checked                   |
| Keyboard                              | Drawing and modal/controller controls checked                     |
| Accessibility                         | Automated smoke checks passed on listed surfaces                  |
| Console                               | No runtime errors in checked browser journeys                     |
| Package audit                         | Zero reported vulnerabilities after dependency remediation        |
| Physical phones/projectors            | Not available in this session; LAN setup documented               |
| Public deployment                     | Not requested as a prerequisite; no public service deployed       |

Browser journeys cover marketing routes, actual host/phone play, anonymous pitch voting, reveal/final/end, refresh, and keyboard drawing. Separate live socket tests verify role authorization, locked-room rejection, late-join eligibility, pause, reconnection, six complete game loops, and host end. Unit tests cover one-player start rejection, two-player games, eight/twelve demo participants, capacity, duplicate names, immutable input, self-votes, majority ties, scoring, removal, and rematch.

## Local test instructions

```sh
npm install
npm run dev
```

1. Open `http://localhost:4310` on your computer.
2. Click Start a ruckus, choose the lineup, and Open the room.
3. Put the phone on the same Wi-Fi. Scan the real room QR.
4. Enter a name, pick an avatar, and join.
5. Add another player or demo crew and press Let’s make a ruckus.
6. Play on the phone; watch the shared screen for reveals/standings.

If the automatically detected network interface is a VPN or the wrong adapter:

```sh
PUBLIC_JOIN_URL=http://YOUR_COMPUTER_WIFI_IP:4310 npm run dev
```

For solo use, click Take it for a spin or Try a demo party, then Start. Use Host controls → Join as a player for a separate controller tab.

## Deployment

```sh
npm run build
npm start
```

Choose one persistent WebSocket-capable Node service/container; set `PORT`, `NODE_ENV=production`, and `PUBLIC_JOIN_URL` to the actual public HTTPS origin. Render/Railway/Fly.io-style Node hosting is suitable as a category, without requiring an account in this build. Static-only hosting cannot run this room engine. See `docs/DEPLOYMENT.md`, including the Dockerfile, health checks, proxy/origin settings, and scaling limits.

Technical references: [Socket.IO server options](https://socket.io/docs/v4/server-options/) and [Vite backend integration](https://vite.dev/guide/backend-integration.html).

## Files created

- `server/index.ts`, `engine.ts`, `content.ts`, `validation.ts`.
- `shared/types.ts`, `catalog.ts`.
- `src/main.tsx`, pages, reusable game/controller/gallery/QR/scoreboard components.
- `src/styles/` foundation/marketing, gameplay, portfolio, motion/responsive CSS.
- `public/brand/`, `avatars/`, `scenes/`, `campaign/`.
- `tests/engine.test.ts`, `socket.test.ts`, `autoplay.test.ts`, browser product tests.
- Asset generators, live capture, visual review, accessibility, production smoke, cover-render scripts.
- `README.md`, `.env.example`, build/lint/TypeScript/Playwright configs, package manifest/lock.
- `Dockerfile`, `.dockerignore`, deployment guide, this report, and export guide.

## Portfolio assets

`portfolio-assets/EXPORT-GUIDE.md` describes captures and usage. The directory includes actual homepage, host lobby, avatar picker, player lobby, all six host/phone/reveal game states, creative galleries, pitch result, drawing controller, winner, brand/campaign/case-study screenshots, plus an editable `cover.html` and rendered `cover-1280x960.png`.

Original brand vectors, avatar vectors, caption illustrations, campaign artwork, and HTML email previews are downloadable from their presentation pages. Generators and font licenses are included. No laptop mockup hardware is required.

## Remaining opportunities

- Test with physical iOS/Android phones, assistive technology, actual office Wi-Fi, and projector/TV displays.
- Add durable session recovery and distributed scheduling/storage only when deploying beyond one Node instance.
- Add custom event branding and managed content packs as a commercial product direction.
- Expand prompt libraries with editorial review and playtest larger groups to refine timing and score balance.

## Project disclaimer

This is a self-initiated concept project created to demonstrate multiplayer product design, game mechanics, real-time frontend engineering, brand strategy, motion, and campaign execution.
