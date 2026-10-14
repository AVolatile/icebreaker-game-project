# Ruckus

**Clock out of ordinary.** One shared screen, phone controllers, six Ruckus Originals, and a creator platform that turns your questions into live multiplayer. An original portfolio product by Anthony Volatile / Volatile Solutions. The startup and Paper Moon Co. demo employer are fictional; the multiplayer is implemented.

## Play something. Make something.

**Originals:** Hotwire (speed trivia), Room Temperature (majority opinions), Sellout (pitch + vote), Caption This (caption + vote), Odd One In (spot the real fact), Scribble Shift (phone drawing + vote). Each supports 2–30 players, presenter controls, pause, reconnect, scoring, bots and rematch.

**Studio:** `/studio` is the board library; `/studio/boards/new` creates a draft; `/studio/boards/:id` edits; `/studio/boards/:id/preview` previews host and phone together. Create multiple choice with 2–6 answers, True / False, and unscored polls. Add from 168 original library questions across 21 topics or copy any of twelve starters, including an explicitly fictional onboarding example. Browser-local autosave, keyboard reordering, duplication, deletion, JSON transfer, CSV import and live room launch are implemented. No account, cloud board sync or shared editing is implied. Export a backup before clearing browser data.

The playable choice content contains **211 questions**: 169 Hotwire, 32 opinion prompts and 10 Odd One In sets. Studio adds **5 unique fictional-company questions**. The new After Hours starter adds **29 host-supplied party-quiz questions**. There are **245 distinct choice/poll questions across the product**, plus creative briefs, drawing prompts and 15 caption scenes. Template copies are not counted as new questions.

**New default starter — After Hours: Hot Takes & Highlights:** 29 questions covering football, baseball, movies, music, pop culture and workplace chaos. Find it first under Studio → Start with a little inspiration; choose **Demo it** to play with bots or **Make it mine** to edit and host. The supplied answer keys are preserved, including deliberately subjective punchline answers. This collection stays in its own party board, separate from Hotwire’s factual question bank. Rounds use 20 seconds, 500 points per correct answer, shuffled options and a leaderboard every five questions.

## Local development

Use **Node 22 LTS** (package toolchain minimum 20.19). This workspace was verified on Node 20.15.1 with the installed dependencies; use Node 22 for reproducible deployment.

```sh
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:4310`. Express runs Vite middleware and Socket.IO on one port, bound to `0.0.0.0`. Marketing and Studio browsing do not connect sockets; live routes and explicit launches connect on demand.

**LAN play:** put computer and phones on the same non-isolated Wi-Fi. Open a room and scan its QR. Localhost host screens automatically get a detected LAN IPv4 join link. With VPNs/multiple adapters, set `PUBLIC_APP_URL=http://YOUR-LAN-IP:4310` in `.env`. Guest Wi-Fi may block device-to-device connections. Public production phones can use Wi-Fi or cellular.

The host can play through a separate player tab. Per-tab identities preserve the presenter. Demo Party uses actual server-controlled players; add 4, 8 or 12 from the host lobby. Studio template demos create eight bots that understand the available choices and question type. They submit on the normal lifecycle, respect pause and receive server-calculated results.

## Studio rules

Titles 60 characters; descriptions 180; questions 180; answers 80; explanations 300; maximum 50 questions and 100 local boards. Timers: 5/10/15/20/30/45/60 seconds. Casual: 500 per correct answer. Quick Draw: 500–1,000 according to server-measured active response time. Just play and polls: zero points. Board defaults apply to new questions; each existing question retains its own timer/score. Optional shuffling preserves the correct answer. Reveals, explanations and leaderboards (each / every five / final) are configurable.

Launch requires a complete valid board; unfinished drafts can autosave. JSON exports are validated complete boards. CSV imports support quoted commas/newlines, answer A–F, correct letter or exact text, timer, score, explanation and type. Download the in-app template. HTML/control characters and basic profanity are rejected; React renders content as text. This basic filter is not an enterprise moderation system.

## Architecture

```text
src/studio/          board repository, import/export, creator routes, launch adapter
src/components/      shared game UI, Studio editor, presenter + phone previews
src/lib/             on-demand Socket.IO provider, runtime URLs, audio, dialog focus
shared/boards.ts     versioned Zod schemas, draft/completion validation, limits
shared/content/      original questions, topics, starter-board compositions
shared/types.ts      public room contracts and typed socket events
server/engine.ts     authoritative rooms, phases, timers, inputs, scoring, summaries
server/config.ts     explicit frontend origins and safe public QR URL construction
server/index.ts      HTTP/Socket.IO boundary, roles, rate limits, cleanup, health
```

A custom-board adapter uses the existing room engine with a private validated question snapshot. Future question keys, `correctAnswer`, and explanations are absent from live player payloads. Only the current choices and permitted reveal are sent. Server state controls eligibility, deadline, duplicate submissions and scoring. Studios’ author library is lazy loaded; Original players do not receive custom board banks via room events. Built-in trivia is public content, not an exam-security system.

Rooms and scores are in process memory. Host/player tokens are random capabilities kept in sessionStorage; refresh and short reconnect restore the existing participant. Host absence ends a room after five minutes; ended rooms clear after a minute; idle rooms expire after two hours. Server restart loses live rooms. Local boards remain in the author’s browser. One always-on realtime instance is the intended deployment; persistence and horizontal scaling are future work.

## Public deployment: Netlify + Render

**Status: READY FOR DEPLOYMENT — EXTERNAL SETUP REQUIRED.** Netlify account access is available; Render backend authorization/setup is not available in this session. No public production deployment has been claimed or verified. Follow [the production guide](docs/NETLIFY-PRODUCTION.md).

Netlify serves `dist`, built with `npm run build:client`. `netlify.toml` rewrites unknown paths to `/index.html` so React routes refresh correctly. A persistent Render Node web service builds with `npm ci && npm run build:server`, starts with `npm run start:server`, and exposes `/health`. `render.yaml` describes an always-on starter service; creating it requires the owner’s account/billing selection. Netlify Functions are not the realtime room server.

| Variable              | Where                                 | Purpose                                                      |
| --------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `VITE_REALTIME_URL`   | Netlify build                         | Public HTTPS Render origin; no path                          |
| `VITE_PUBLIC_APP_URL` | Netlify build                         | Public HTTPS frontend origin                                 |
| `CLIENT_ORIGIN`       | Render                                | Exact permitted frontend origin                              |
| `PUBLIC_APP_URL`      | Render                                | Frontend origin used for QR and join links                   |
| `ALLOWED_ORIGINS`     | Render, optional                      | Comma-separated explicitly permitted previews/custom domains |
| `REALTIME_ONLY`       | Render                                | `true` avoids serving Vite/static frontend                   |
| `PORT`                | Render automatically / local optional | HTTP listener; default 4310                                  |
| `NODE_ENV`            | Render                                | `production` enables strict public origin checks             |

Use HTTPS endpoints; Socket.IO upgrades to WSS and retains HTTPS polling fallback. Changes to frontend build values require a rebuild. These are public URLs, not secret credentials. CORS and WebSocket origin validation are explicit, with no production wildcard. QR always targets the frontend `/join?room=CODE`, never the Render hostname.

## Commands and verification

```sh
npm run typecheck
npm run lint
npm run build
npm test
# With npm run dev in another terminal:
TEST_ORIGIN=http://localhost:4310 npm test
AUTOPLAY_ORIGIN=http://localhost:4310 node --import tsx --test tests/autoplay.test.ts
npm run test:e2e
node scripts/expansion-qa.mjs
node scripts/accessibility-check.mjs
```

`npm test` intentionally skips socket/autoplay suites unless their origins are supplied. Playwright uses installed Chromium; on a fresh machine run `npx playwright install chromium`. The expansion audit records element overflow, accessibility results and screenshots in `docs/qa` and `portfolio-assets/studio`. Contact sheets are internal QA artifacts, not public routes.

```sh
npm run build:client    # Netlify frontend
npm run build:server    # Render backend
npm run start:server   # Requires deployment env in production
npm run build
NODE_ENV=production npm start  # Optional combined frontend + server alternative
npm run assets         # SVG assets; Python deps/venv needed for outlined brand exports
```

Asset source is in `scripts/generate-assets.py` and `scripts/avatar-overrides.json`. The refinement script needs `.venv` and `scripts/requirements.txt`; existing finished SVG assets are checked in, so deployment does not need Python.

## Product honesty and portfolio

Currently implemented: local authoring, original games, custom multiplayer, session-level summaries and CSV export, server validation and capability-based session restoration. Future: accounts, cloud boards, workspaces, SSO, access controls, audit logs, retention policy, durable rooms, shared state, billing and organizational security/legal review. No enterprise certifications, paying customers or employer affiliation are claimed. Do not put confidential organization material into this unauthenticated prototype.

See [product vision](docs/PRODUCT-VISION.md), [internal pilot notes](docs/ORGANIZATION-PITCH-NOTES.md), [final expansion report](docs/FINAL-EXPANSION-REPORT.md), and [portfolio export guide](portfolio-assets/EXPORT-GUIDE.md). The existing 1280×960 portfolio cover is preserved.
