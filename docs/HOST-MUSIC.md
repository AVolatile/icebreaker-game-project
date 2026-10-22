# Demo host music

`src/lib/useHostAudio.ts` scopes a small `HostAudio` observer to the valid host
room. It reads the existing room state and never sends gameplay actions.
`src/lib/music.ts` still owns a single lazy `HTMLAudioElement`; `src/lib/sound.ts`
adds short, host-owned synthesized stingers with cancellable Web Audio voices.
No dependencies, new audio assets, server audio state, or production engine were added.

Sound starts off. The existing sound button and M shortcut unlock both media
and Web Audio directly in the gesture. Music normally plays at 18% volume with
a 180 ms fade-in. Mute stops all voices and cancels pending audio callbacks;
unmute resumes only the current bed. It never replays missed stingers.

## Event mapping

| Existing state/event                 | Audio                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lobby                                | Loop the existing lobby track at 18%; a short join cue for new arrivals.                                                                                         |
| Intro                                | Fade the old source over 90 ms; transition cue at 100 ms; one-shot intro bed at 450 ms; fade to silence at 3.4 s.                                                |
| New active question/creative prompt  | Fade the old source over 90 ms; transition cue at 100 ms; restart the current Original's looping bed from zero at 450 ms.                                        |
| Active play                          | The existing Hotwire, Room Temperature, Sellout, Caption This, Odd One In, or Scribble Shift track at 18%.                                                       |
| Hotwire at 3, 2, 1 seconds           | One quiet tick per new second; music ducks to 7% for 150 ms. Paused timers and missed countdown seconds do not produce ticks. Other games have no countdown SFX. |
| Active → voting                      | Duck the same bed to 2.5% over 60 ms; lock cue immediately, voting cue at 300 ms; restore to 14% at 750 ms without restarting the bed.                           |
| Active/voting → results              | Stop the game bed; lock cue immediately; reveal cue after 300 ms (Odd One In: 420 ms; Caption This: 520 ms).                                                     |
| Results with visible round standings | Leaderboard sting 550 ms after the reveal cue. No separate leaderboard music asset exists in the demo.                                                           |
| Results bed                          | Existing results track, one-shot at 12%, starts 850 ms after the reveal cue; fades out over 120 ms at 3.4 s after entering results. Silence follows.             |
| Intermission/game change             | Fade out over 90 ms; short round-complete cue at 100 ms; intermission loop at 450 ms.                                                                            |
| Winner/confetti presentation         | Stop previous audio; start the dedicated finale loop at time zero plus one winner hit in the same render commit.                                                 |
| Finale persists                      | Keep playing without restarting on room updates.                                                                                                                 |
| Rematch                              | Fade finale out over 180 ms, then fade lobby in.                                                                                                                 |
| End/invalid host/unmount             | Release the music source and cancel callbacks/voices; unmount also closes the host AudioContext.                                                                 |

Room Temperature and Scribble Shift stingers use 65% intensity; Sellout,
Caption This and Odd One In use 80%; Hotwire and the finale hit use full cue
intensity. All remain short sine-note phrases. Voting continuation preserves
position; a new question deliberately restarts its game's track.

These are **audio-only** offsets. Questions, reveals, scoring and host controls
retain their existing timing; the observer never delays the UI. If the host
advances quickly, the new state cancels the old sequence immediately.

## Event identity, finale and recovery

Question identity combines room code/creation time, game index, round index,
and the sequence prefix of the existing `roundKey` (`sequence:phase`). Phase
changes detect voting/answer-lock/reveal; active-to-active changes also retrigger
the question sequence. The room-entry `locked` flag is unrelated to answer lock.
Repeated room updates do not replay event cues.

`HostFinale` reports presentation in a layout effect when the existing winner
and `Confetti` mount together. That callback starts finale playback before the
browser paints; no unrelated finale timer or generic results trigger is used.
The short results bed naturally falls silent before the host advances to the
winner; fast advancement starts the payoff immediately without adding a delay.

The first hydrated state restores music without stingers. Disconnect cancels
pending audio and resets event history. Because `PartyProvider` marks its socket
connected before receiving the resume reply, the observer waits for a fresh
room object before restoring playback. Reconnecting during active play/finale
restores that track without historical cues or another victory hit.

Autoplay rejection and unavailable media/Web Audio are swallowed safely.
Suspended Web Audio contexts never queue notes. Toggle off/on to retry blocked
playback. Phones never instantiate the host audio observer.

## Assets

The eleven hashed MP3 files in `public/audio/` were copied byte-for-byte from
`production/main` of `AVolatile/ruckus-development`, commit
`311a607ab57e6eac466e54e731cd88fe1936c87b`. MP3 keeps the single-element controller
compatible with desktop host browsers without codec selection infrastructure.
`tests/music.test.ts` verifies the content hashes in their filenames.

Production's `audio/ASSET-PROVENANCE.md` and `audio/assets.json` describe these as
project-owned original procedural output, generated by `ruckus-procedural-v1`
on 2026-10-15 with no imported recordings, compositions or samples. They retain
their **pre-release-reference** classification and `productionApproved: false`;
copying them here does not change that approval status. No open redistribution
license is granted. The original provenance document remains in production.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
With the demo running on port 4310, enable the existing live socket/autoplay
checks with `TEST_ORIGIN=http://localhost:4310 AUTOPLAY_ORIGIN=http://localhost:4310 npm test`.
Run `npx playwright test tests/browser/music.spec.ts tests/browser/finale.spec.ts`
for real-media playback across all six games, mute/SFX cancellation, question
restarts, deliberate result silence, voting continuity, player isolation, live
reconnect during active/finale, confetti presence at the time-zero finale play
request, rematch/cleanup, and blocked/unavailable playback.

Unit tests cover exact event timing, cancellation, one-element fades/ducking,
loop/restart behavior, hydration, countdown edges, and Web Audio voice cleanup.
Physical speaker levels, subjective listening, and device-specific autoplay
behavior still need a check on the conference-room equipment used for the pilot.
