# Ruckus portfolio capture guide

Use real product states. Bots are labeled DEMO. Don’t present a static preview as live multiplayer. Capture with sound muted; disable animation for stills and enable reduced motion for clean exports.

## Cover

**1280×960, 4:3.** A layered composition of the host lobby/QR, phone controller, three avatars, and Ruckus wordmark. No laptop hardware needed. `cover-1280x960.png` is an exported concept cover using real captured UI. `cover.html` is the editable source.

## Recommended captures

| Surface              | URL or path                   | Format                                    |
| -------------------- | ----------------------------- | ----------------------------------------- |
| Marketing hero       | `/`                           | 1440×1000 and 390×844                     |
| Host lobby / QR      | `/host` → create → add 8 bots | 1440×810 / 1920×1080                      |
| Name & avatar picker | `/join?room=REAL_CODE`        | 390×844                                   |
| Mobile lobby         | join a real room              | 390×844                                   |
| Hotwire              | select only Hotwire at setup  | 1440×810 + 390×844                        |
| Room Temperature     | select only Room Temperature  | 1440×810 + 390×844                        |
| Sellout              | select only Sellout           | prompt, submission, voting, reveal        |
| Caption This         | select only Caption This      | illustrated prompt, phone caption, reveal |
| Scribble Shift       | select only Scribble Shift    | canvas, gallery, vote, winner             |
| Odd One In           | select only Odd One In        | prompt and fact explanation               |
| Leaderboard          | intermission or final         | 1440×810                                  |
| Winner               | finish a one-game room        | 1440×810 / full page                      |
| Campaign             | `/campaign`                   | 1440px wide / full page                   |
| Brand system         | `/brand`                      | 1440px wide / full page                   |
| Case study           | `/case-study`                 | 1440px wide / full page                   |

`npm run test:e2e` creates actual host, controller, pitch reveal, keyboard drawing, homepage, and portfolio-route PNGs here. Additional capture tooling lives in `scripts/visual-review.mjs`.

## Files ready for reuse

- `public/brand/symbol.svg`: symbol, app icon, favicon.
- `public/brand/wordmark.svg`: standalone wordmark.
- `public/avatars/0.svg`–`19.svg`: 20 original avatars.
- `public/scenes/0.svg`–`14.svg`: original 640×360 caption compositions.
- `public/campaign/`: SVG posters, three social formats, four ad formats, five HTML email previews.
- Typography is locally hosted through Fontsource; font packages include their licenses.
- `scripts/generate-assets.py` / `generate-emails.py`: editable generation sources.

SVGs scale to print or digital sizes. Rasterize in a design tool at the required size. Email previews use relative local CTA links; set the public origin before any commercial use. No mail was sent.

## Video moments

- Players appear live after scanning.
- A phone answer locks while the host count updates.
- Eight bots submit at different times.
- Anonymous pitches become an authored result gallery.
- A keyboard or finger drawing becomes a gallery entry.
- Pause freezes play; resume returns the clock.
- Refresh restores the same player and score.
- Final awards and confetti celebrate actual session data.

Record only what the build supports. State plainly that Ruckus is a self-initiated fictional startup concept with a functioning multiplayer prototype.

## Studio expansion

The original `cover-1280x960.png` is preserved. Add the creator-to-live sequence as a project-detail gallery rather than crowding the existing cover.

| Capture                      | Route / action                    | Ready artifact                       |
| ---------------------------- | --------------------------------- | ------------------------------------ |
| Studio library               | `/studio`                         | `studio/library.png`                 |
| Custom question editor       | copy starter → edit               | `studio/editor.png`                  |
| Presenter + phone preview    | editor → Preview → Preview reveal | `studio/presenter-phone-preview.png` |
| Custom lobby + QR            | Play this board → add bots        | `studio/live-lobby.png`              |
| Live custom question         | start → We’re ready               | `studio/live-custom-question.png`    |
| Phone custom answer          | scan / join live room             | `studio/live-phone-answer.png`       |
| Custom reveal                | close round                       | `studio/live-reveal.png`             |
| Session scoreboard + summary | finish board                      | `studio/session-results.png`         |

`node scripts/expansion-qa.mjs` recreates the Studio sequence with real local rooms and phone browser contexts. Screenshots contain real demo participants and session data. `docs/qa/avatar-contact-sheet.png` and `caption-contact-sheet.png` are private development audits; keep them out of public product navigation. Maximum-length stress captures demonstrate validation/layout behavior and are QA evidence, not recommended hero portfolio imagery.

The expanded story proves brand design, host/player product design, six game mechanics, accessible frontend engineering, multi-device real-time state, phone drawing, a creator ecosystem and split production architecture. Describe deployment as ready until both public services and physical internet joining have actually been verified.
