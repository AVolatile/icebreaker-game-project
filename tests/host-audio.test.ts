import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../server/engine.js";
import { DEFAULT_SETTINGS } from "../shared/catalog.js";
import { GAME_IDS, type RoomView } from "../shared/types.js";
import { HostAudio, questionKey } from "../src/lib/hostAudio.js";
import {
  HostMusic,
  type MusicOptions,
  type MusicTrack,
} from "../src/lib/music.js";
import { HostSounds, type SoundCue } from "../src/lib/sound.js";

class MusicSpy extends HostMusic {
  track: MusicTrack | null = null;
  volume = 0;
  muted = true;
  starts: { track: MusicTrack | null; options: MusicOptions }[] = [];
  override setTrack(track: MusicTrack | null, options: MusicOptions = {}) {
    if (track !== this.track || options.restart)
      this.starts.push({ track, options });
    this.track = track;
  }
  override setVolume(volume: number) {
    this.volume = volume;
  }
  override setMuted(muted: boolean) {
    this.muted = muted;
  }
  override dispose() {
    this.track = null;
  }
}
class SoundsSpy extends HostSounds {
  cues: { cue: SoundCue; intensity: number }[] = [];
  stops = 0;
  override unlock() {}
  override play(cue: SoundCue, intensity = 1) {
    this.cues.push({ cue, intensity });
  }
  override stop() {
    this.stops++;
  }
  override dispose() {
    this.stop();
  }
}
function fixture() {
  const source = new Room(
    "ABCDE",
    { ...DEFAULT_SETTINGS, playlist: ["hotwire"], autoAdvance: false },
    "http://localhost/join",
    () => {},
  );
  const room = source.view();
  source.dispose();
  return room;
}
function setup(t: TestContext) {
  t.mock.timers.enable({ apis: ["Date", "setTimeout"] });
  const music = new MusicSpy();
  const sounds = new SoundsSpy();
  const audio = new HostAudio(music, sounds);
  let room = fixture();
  audio.sync(room, true);
  audio.setMuted(false);
  t.after(() => audio.dispose());
  return {
    audio,
    music,
    sounds,
    cues: () => sounds.cues.map(({ cue }) => cue),
    sync(patch: Partial<RoomView>, connected = true, presented = false) {
      room = { ...room, ...patch, serverTime: Date.now() };
      audio.sync(room, connected, presented);
      return room;
    },
  };
}

test("new questions restart their bed once, including active-to-active and rematches", (t) => {
  const s = setup(t);
  s.sync({ phase: "active", roundKey: "1:active" });
  assert.equal(s.music.track, null);
  t.mock.timers.tick(100);
  assert.deepEqual(s.cues(), ["transition"]);
  t.mock.timers.tick(350);
  assert.equal(s.music.track, "hotwire");
  const starts = s.music.starts.length;
  for (let i = 0; i < 10; i++) s.sync({});
  assert.equal(s.music.starts.length, starts);
  assert.deepEqual(s.cues(), ["transition"]);
  s.sync({ roundKey: "2:active", round: 1 });
  assert.equal(s.music.track, null);
  t.mock.timers.tick(450);
  assert.equal(s.music.track, "hotwire");
  assert.deepEqual(s.cues(), ["transition", "transition"]);
  const original = s.sync({ phase: "results", roundKey: "2:results" });
  assert.equal(
    questionKey(original),
    questionKey({ ...original, phase: "voting", roundKey: "2:voting" }),
  );
  s.sync({ phase: "lobby", round: 0 });
  s.sync({ phase: "active", roundKey: "3:active" });
  t.mock.timers.tick(450);
  assert.equal(s.cues().filter((cue) => cue === "transition").length, 3);
});

test("creative lock/voting ducks without restarting, results leave silence, caption and odd reveals breathe", (t) => {
  const s = setup(t);
  s.sync({
    phase: "active",
    settings: { ...DEFAULT_SETTINGS, playlist: ["caption-this"] },
    roundKey: "1:active",
  });
  t.mock.timers.tick(450);
  const starts = s.music.starts.length;
  s.sync({ phase: "voting", roundKey: "1:voting" });
  assert.equal(s.music.track, "caption-this");
  assert.equal(s.music.volume, 0.025);
  assert.equal(s.cues().at(-1), "lock");
  t.mock.timers.tick(750);
  assert.equal(s.music.starts.length, starts);
  assert.equal(s.music.volume, 0.14);
  assert.equal(s.cues().at(-1), "voting");
  s.sync({ phase: "results", roundKey: "1:results" });
  assert.equal(s.music.track, null);
  t.mock.timers.tick(519);
  assert.equal(s.cues().at(-1), "lock");
  t.mock.timers.tick(1);
  assert.equal(s.cues().at(-1), "reveal");
  t.mock.timers.tick(550);
  assert.equal(s.cues().at(-1), "leaderboard");
  t.mock.timers.tick(300);
  assert.equal(s.music.track, "results");
  assert.equal(s.music.starts.at(-1)?.options.loop, false);
  t.mock.timers.tick(2500);
  assert.equal(s.music.track, null);
  s.sync({
    phase: "active",
    roundKey: "2:active",
    settings: { ...DEFAULT_SETTINGS, playlist: ["odd-one-in"] },
  });
  t.mock.timers.tick(450);
  s.sync({ phase: "results", roundKey: "2:results", showLeaderboard: false });
  const count = s.cues().length;
  t.mock.timers.tick(419);
  assert.equal(s.cues().length, count);
  t.mock.timers.tick(1);
  assert.equal(s.cues().at(-1), "reveal");
  t.mock.timers.tick(4000);
  assert.equal(s.cues().filter((cue) => cue === "leaderboard").length, 1);
});

test("finale waits for winner/confetti presentation, restarts once and persists past results timers", (t) => {
  const s = setup(t);
  s.sync({ phase: "active", roundKey: "1:active" });
  t.mock.timers.tick(450);
  s.sync({ phase: "results", roundKey: "1:results" });
  t.mock.timers.tick(4000);
  assert.equal(s.music.track, null); // Anticipation before the host advances.
  s.sync({ phase: "final", roundKey: "1:final" });
  assert.equal(s.music.track, null);
  s.sync({}, true, true);
  assert.equal(s.music.track, "finale");
  assert.equal(s.music.starts.at(-1)?.options.restart, true);
  assert.equal(s.cues().at(-1), "winner");
  const starts = s.music.starts.length,
    cues = s.cues().length;
  for (let i = 0; i < 10; i++) s.sync({}, true, true);
  t.mock.timers.tick(60000);
  assert.equal(s.music.track, "finale");
  assert.equal(s.music.starts.length, starts);
  assert.equal(s.cues().length, cues);
  s.audio.setMuted(true);
  s.audio.setMuted(false);
  assert.equal(s.music.track, "finale");
  assert.equal(s.cues().length, cues);
  s.sync({ phase: "lobby" });
  assert.equal(s.music.track, "lobby");
  assert.equal(s.music.starts.at(-1)?.options.fadeOutMs, 180);
});

test("mute cancels pending reveal notes; unmute restores only the current meaningful bed", (t) => {
  const s = setup(t);
  s.sync({ phase: "active", roundKey: "1:active" });
  t.mock.timers.tick(100);
  const count = s.cues().length;
  s.audio.setMuted(true);
  t.mock.timers.tick(1000);
  s.sync({ phase: "results", roundKey: "1:results" });
  t.mock.timers.tick(100);
  s.audio.setMuted(false);
  assert.equal(s.music.track, "results");
  t.mock.timers.tick(1000);
  assert.equal(s.cues().length, count);
  s.audio.setMuted(true);
  t.mock.timers.tick(5000);
  s.audio.setMuted(false);
  assert.equal(s.music.track, null);
  assert.equal(s.cues().length, count);
});

test("reconnect waits for fresh hydration and restores active/finale without stale stingers", (t) => {
  const s = setup(t);
  for (const phase of ["active", "final"] as const) {
    const cached = s.sync(
      { phase, roundKey: `1:${phase}` },
      true,
      phase === "final",
    );
    t.mock.timers.tick(500);
    s.audio.sync(cached, false, phase === "final");
    assert.equal(s.music.track, null);
    const count = s.cues().length;
    s.audio.sync(cached, true, phase === "final");
    assert.equal(s.music.track, null);
    s.sync({}, true, phase === "final");
    assert.equal(s.music.track, phase === "final" ? "finale" : "hotwire");
    t.mock.timers.tick(2000);
    assert.equal(s.cues().length, count);
  }
});

test("fast progression, end, invalid host and unmount cancel scheduled audio", (t) => {
  const s = setup(t);
  s.sync({ phase: "active", roundKey: "1:active" });
  s.sync({ phase: "results", roundKey: "1:results" });
  s.sync({ phase: "intermission" });
  s.sync({ phase: "ended" });
  const count = s.cues().length;
  t.mock.timers.tick(60000);
  assert.equal(s.music.track, null);
  assert.equal(s.cues().length, count);
  s.sync({ phase: "active", roundKey: "2:active" });
  s.audio.sync(null, true);
  t.mock.timers.tick(1000);
  assert.equal(s.music.track, null);
  s.sync({ phase: "results" });
  s.audio.dispose();
  t.mock.timers.tick(10000);
  assert.equal(s.cues().length, count);
});

test("Hotwire ticks only at new 3/2/1 edges, honors server offset/pause/mute, never catches up", (t) => {
  const s = setup(t);
  s.sync({
    phase: "active",
    roundKey: "1:active",
    deadline: Date.now() + 6000,
  });
  t.mock.timers.tick(2000);
  s.audio.tick(); // 4 seconds
  t.mock.timers.tick(1000);
  s.audio.tick();
  s.audio.tick();
  assert.equal(s.cues().filter((cue) => cue === "tick").length, 1);
  s.sync({ paused: true, deadline: Date.now() + 3000 });
  t.mock.timers.tick(1000);
  s.audio.tick();
  assert.equal(s.cues().filter((cue) => cue === "tick").length, 1);
  s.sync({ paused: false, deadline: Date.now() + 3000 });
  t.mock.timers.tick(1000);
  s.audio.tick();
  s.audio.setMuted(true);
  t.mock.timers.tick(1000);
  s.audio.tick();
  s.audio.setMuted(false);
  s.audio.tick();
  assert.equal(s.cues().filter((cue) => cue === "tick").length, 2);
  s.sync({ roundKey: "2:active", deadline: Date.now() + 15000 });
  t.mock.timers.tick(13000);
  s.audio.tick(); // A background tab must not play the missed countdown burst.
  assert.equal(s.cues().filter((cue) => cue === "tick").length, 2);
  const shifted = s.sync({
    roundKey: "3:active",
    deadline: Date.now() + 104000,
  });
  s.audio.sync(
    { ...shifted, roundKey: "4:active", serverTime: Date.now() + 100000 },
    true,
  );
  t.mock.timers.tick(1000);
  s.audio.tick();
  assert.equal(s.cues().filter((cue) => cue === "tick").length, 3);
});

test("all Originals use their own bed; relaxed games have softer cues and no countdown", (t) => {
  const s = setup(t);
  for (const [i, game] of GAME_IDS.entries()) {
    s.sync({
      phase: "active",
      gameIndex: 0,
      round: i,
      roundKey: `${i + 1}:active`,
      settings: { ...DEFAULT_SETTINGS, playlist: [game] },
      deadline: Date.now() + 4000,
    });
    t.mock.timers.tick(450);
    assert.equal(s.music.track, game);
    const ticks = s.cues().filter((cue) => cue === "tick").length;
    t.mock.timers.tick(550);
    s.audio.tick();
    assert.equal(
      s.cues().filter((cue) => cue === "tick").length,
      ticks + (game === "hotwire" ? 1 : 0),
    );
    if (game === "scribble-shift" || game === "room-temperature")
      assert.equal(s.sounds.cues.at(-1)?.intensity, 0.65);
  }
});
