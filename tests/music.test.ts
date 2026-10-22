import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { GAME_IDS } from "../shared/types.js";
import { HostMusic, MUSIC_TRACKS, musicTrackFor } from "../src/lib/music.js";

class FakeAudio {
  src = "";
  loop = false;
  preload = "";
  muted = false;
  volume = 1;
  currentTime = 0;
  plays: string[] = [];
  paused = true;
  loads = 0;
  result = () => Promise.resolve();
  play() {
    this.plays.push(this.src);
    this.paused = false;
    return this.result();
  }
  pause() {
    this.paused = true;
  }
  getAttribute() {
    return this.src || null;
  }
  removeAttribute() {
    this.src = "";
  }
  load() {
    this.loads++;
  }
}
function controller() {
  const audio = new FakeAudio();
  let allocations = 0;
  const music = new HostMusic(() => {
    allocations++;
    return audio as unknown as HTMLAudioElement;
  });
  return { music, audio, allocations: () => allocations };
}

test("every phase and Original maps to an intact, content-hashed music asset", () => {
  for (const game of GAME_IDS) {
    assert.equal(musicTrackFor("active", game), game);
    assert.equal(musicTrackFor("voting", game), game);
    for (const phase of ["lobby", "intro", "results", "intermission"] as const)
      assert.equal(musicTrackFor(phase, game), phase);
    assert.equal(musicTrackFor("final", game), "finale");
    assert.equal(musicTrackFor("ended", game), null);
  }
  for (const url of Object.values(MUSIC_TRACKS)) {
    const bytes = readFileSync(new URL(`../public${url}`, import.meta.url));
    const hash = createHash("sha256").update(bytes).digest("hex");
    assert.ok(url.endsWith(`.${hash.slice(0, 12)}.mp3`), url);
  }
});

test("one opt-in element loops quietly, resumes on unmute, and ignores unchanged tracks", async (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"] });
  const { music, audio, allocations } = controller();
  t.after(() => music.dispose());
  music.setTrack("lobby");
  assert.equal(allocations(), 0);
  music.setMuted(false);
  assert.deepEqual(audio.plays, [MUSIC_TRACKS.lobby]); // Synchronous gesture play.
  assert.equal(audio.loop, true);
  await Promise.resolve();
  t.mock.timers.tick(200);
  assert.equal(audio.volume, 0.18);
  audio.currentTime = 7;
  music.setTrack("lobby");
  assert.equal(audio.plays.length, 1);
  music.setMuted(true);
  assert.equal(audio.muted, true);
  assert.equal(audio.paused, true);
  music.setMuted(false);
  assert.equal(audio.currentTime, 7);
  music.setTrack("sellout");
  music.setTrack(musicTrackFor("voting", "sellout"));
  assert.equal(audio.plays.length, 3);
  assert.equal(allocations(), 1);
});

test("ended and unmount release media and cancel pending fades/plays", async (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"] });
  const { music, audio } = controller();
  let finish!: () => void;
  audio.result = () => new Promise<void>((resolve) => (finish = resolve));
  music.setTrack("hotwire");
  music.setMuted(false);
  music.setTrack(null);
  assert.equal(audio.src, "");
  assert.equal(audio.paused, true);
  assert.equal(audio.loads, 1);
  finish();
  await Promise.resolve();
  t.mock.timers.tick(500);
  assert.equal(audio.volume, 0);
  music.setTrack("finale");
  music.dispose();
  finish();
  await Promise.resolve();
  t.mock.timers.tick(500);
  assert.equal(audio.src, "");
  assert.equal(audio.muted, true);
  assert.equal(audio.paused, true);
  assert.equal(audio.volume, 0);
  music.setTrack("lobby");
  music.setMuted(false);
  assert.equal(audio.plays.length, 2);
});

test("late play completions cannot fade after muting or a newer track request", async (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"] });
  const { music, audio } = controller();
  t.after(() => music.dispose());
  const pending: (() => void)[] = [];
  audio.result = () => new Promise<void>((resolve) => pending.push(resolve));
  music.setTrack("lobby");
  music.setMuted(false);
  music.setTrack("intro");
  pending[0]();
  await Promise.resolve();
  t.mock.timers.tick(500);
  assert.equal(audio.volume, 0);
  music.setMuted(true);
  pending[1]();
  await Promise.resolve();
  t.mock.timers.tick(500);
  assert.equal(audio.volume, 0);
  assert.equal(audio.paused, true);
});

test("blocked, rejected and unavailable audio are safe and can retry on a later gesture", async () => {
  const { music, audio } = controller();
  try {
    audio.result = () => Promise.reject(new Error("Autoplay blocked"));
    music.setTrack("lobby");
    assert.doesNotThrow(() => music.setMuted(false));
    await new Promise<void>((resolve) => setImmediate(resolve));
    music.setTrack("lobby");
    assert.equal(audio.plays.length, 1);
    audio.result = () => {
      throw new Error("Media unavailable");
    };
    assert.doesNotThrow(() => music.setTrack("intro"));
    audio.result = () => Promise.resolve();
    music.setMuted(true);
    music.setMuted(false);
    assert.equal(audio.plays.length, 3);
  } finally {
    music.dispose();
  }
  const unavailable = new HostMusic(() => {
    throw new Error("No Audio constructor");
  });
  assert.doesNotThrow(() => {
    unavailable.setTrack("lobby");
    unavailable.setMuted(false);
    unavailable.setTrack("intro");
    unavailable.dispose();
  });
});

test("ducking preserves playback position; explicit restart rewinds and one-shot beds do not loop", async (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"] });
  const { music, audio, allocations } = controller();
  t.after(() => music.dispose());
  music.setTrack("hotwire");
  music.setMuted(false);
  await Promise.resolve();
  t.mock.timers.tick(200);
  audio.currentTime = 12;
  music.setVolume(0.025, 60);
  t.mock.timers.tick(60);
  assert.equal(audio.volume, 0.025);
  assert.equal(audio.currentTime, 12);
  assert.equal(audio.plays.length, 1);
  music.setVolume(0.18);
  t.mock.timers.tick(180);
  assert.equal(audio.volume, 0.18);
  music.setTrack("hotwire", { restart: true });
  assert.equal(audio.currentTime, 0);
  assert.equal(audio.plays.length, 2);
  music.setTrack("results", { loop: false });
  assert.equal(audio.loop, false);
  music.setTrack("finale");
  assert.equal(audio.loop, true);
  assert.equal(allocations(), 1);
});

test("source fades finish before starting the next track and survive volume changes or mute gestures", async (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"] });
  const { music, audio } = controller();
  t.after(() => music.dispose());
  music.setTrack("finale");
  music.setMuted(false);
  await Promise.resolve();
  t.mock.timers.tick(200);
  music.setTrack("lobby", { fadeOutMs: 180 });
  music.setVolume(0.14); // Must not cancel the pending source switch.
  assert.equal(audio.src, MUSIC_TRACKS.finale);
  t.mock.timers.tick(90);
  assert.ok(audio.volume > 0 && audio.volume < 0.18);
  t.mock.timers.tick(90);
  assert.equal(audio.src, MUSIC_TRACKS.lobby);
  assert.equal(audio.volume, 0);
  await Promise.resolve();
  t.mock.timers.tick(180);
  assert.equal(audio.volume, 0.14);
  music.setTrack(null, { fadeOutMs: 120 });
  music.setMuted(true);
  music.setTrack("hotwire");
  music.setMuted(false);
  t.mock.timers.tick(1000);
  assert.equal(audio.src, MUSIC_TRACKS.hotwire);
  assert.equal(audio.paused, false);
});
