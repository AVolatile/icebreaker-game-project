# Team Meeting Pack

Select **Team Meeting Pack** in Host setup → Content pack. The existing default
remains Mixed signals. The pack contains eight prompts for each of the six
Originals (48 total), with the supplied sports, Series 7, candy, food, holiday
and hobby mix.

## Routing

- `shared/content/packs.ts` holds the public ID, name and description. `PACKS`
  registers it for the existing selector; server settings validation reads that
  same catalog so a visible pack can be launched.
- `server/content/team-meeting.ts` holds the six prompt pools, answer keys,
  explanations, caption scene references and matching text bot responses. This
  server-only module is not imported into the browser catalog.
- `getPrompt` checks a small pack → game map before the existing routing. It uses
  the same `(round + offset) % pool.length` selection. Existing global pools and
  their fallback behavior are unchanged; Team Meeting content never enters
  another pack's fallback pool.
- `botCreative` uses the selected prompt's matching responses for this pack.
  Each pitch and caption has three original answers plus short variations,
  capped at the existing 160-character limit. Other packs keep their existing
  responses and asides. Drawing bots retain the existing sketch generator.
- Room state still exposes only the existing public prompt fields; answer keys
  and bot response lists remain on the server. The engine, timers, scores,
  rankings, sockets, lifecycle, rematch and audio are unchanged.

## Caption scenes

Scenes `15.svg` through `22.svg` are standalone, original 640×360 SVGs using the
existing palette, bold shapes and outlines. All eight together are about 14 KB.
They load through the existing `/scenes/{scene}.svg` path. Scenes 0–14 are
unchanged. There are no remote images, fonts, image services or new renderers.

Regenerate only this pack's scenes with:

```sh
python3 scripts/generate-team-meeting-scenes.py
```

## Content review

The supplied options and answer indices are retained. One Odd One In title says
“botanically true” to make the banana/peanut distinction unambiguous. Sources
checked on October 22, 2026:

- [NFL Week 7 schedule](https://www.nfl.com/schedules/2026/by-week/week-7)
- [MLB 2026 World Series preview](https://www.mlb.com/news/2026-mlb-world-series-faq-schedule-times-teams-and-more)
- [OCC options risk and time value](https://www.optionseducation.org/optionsoverview/leverage-risk)
- [Investor.gov callable bonds](https://www.investor.gov/introduction-investing/investing-basics/glossary/callable-or-redeemable-bonds)
- [National Museum of Ireland turnip lantern](https://source.museum.ie/en-IE/Collections-Research/Collection/Top-things-to-see-in-the-Irish-Folklife-Collection/Artefact/Ghost-turnip/b202e8ea-0728-4b3d-b0f1-82660fe45ce9)
- [USGA golf terminology](https://www.usga.org/content/usga/home-page/articles/2026/01/world-play-terminology-golf-lingo.html)
- [USGA history of feather-filled golf balls](https://www.usga.org/content/dam/usga/pdf/2020/distance-insights/DIPR-FINAL-2020-usga.pdf)
- [Kew botanical berries](https://www.kew.org/read-and-watch/surprising-pomegranate-facts)
- [Kew legumes](https://www.kew.org/read-and-watch/next-bean-thing)
- [Smithsonian cephalopod anatomy](https://ocean.si.edu/ocean-life/invertebrates/octopuses-squids-and-relatives)
- [Mars M&M's history](https://www.mars.com/pl-pl/news-and-stories/articles/mmsr-swietuja-80-urodziny)
- [MLB baseball stitching](https://www.mlb.com/amp/news/cubs-like-world-series-chances-against-indians-c206903382.html)
- [Kew cashew species information](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A319068-2/general-information)

The 2026 sports questions are dated historical/event content, not live feeds.

## Validation

```sh
npm run typecheck
TEST_ORIGIN=http://localhost:4310 AUTOPLAY_ORIGIN=http://localhost:4310 npm test
npm run build
npx playwright test tests/browser/team-meeting.spec.ts tests/browser/music.spec.ts tests/browser/finale.spec.ts
```

Start the demo on port 4310 for socket/browser tests. The focused unit suite
checks all 48 prompts, all offsets, 30-player text responses, scheduled demo bots,
five rounds of all six games, answer privacy, and rematch rotation. A pre-change
reference fixture verifies the existing 23 packs' prompts and bot routing.
Browser coverage selects the pack through setup, plays two rounds of every
Original with real sockets, checks caption loading and rematch, then switches
back to the existing Food pack. A separate contact sheet renders all eight SVGs
for visual review.
