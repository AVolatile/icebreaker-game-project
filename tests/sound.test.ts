import { test } from "node:test";
import assert from "node:assert/strict";
import { HostSounds } from "../src/lib/sound.js";

function fixture() {
  const voices: { stopped: boolean; disconnected: boolean }[] = [];
  let state = "suspended";
  let closed = false;
  const context = {
    get state() {
      return state;
    },
    currentTime: 0,
    destination: {},
    resume() {
      state = "running";
      return Promise.resolve();
    },
    close() {
      closed = true;
      return Promise.resolve();
    },
    createOscillator() {
      const voice = { stopped: false, disconnected: false };
      voices.push(voice);
      return {
        frequency: { value: 0 },
        connect() {},
        start() {},
        stop() {
          voice.stopped = true;
        },
        disconnect() {
          voice.disconnected = true;
        },
      };
    },
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
        disconnect() {},
      };
    },
  };
  let allocations = 0;
  const sounds = new HostSounds(() => {
    allocations++;
    return context as unknown as AudioContext;
  });
  return {
    sounds,
    voices,
    setState(value: string) {
      state = value;
    },
    allocations: () => allocations,
    closed: () => closed,
  };
}

test("stingers are gesture-unlocked, suspended cues are dropped, stop cancels every scheduled voice", () => {
  const s = fixture();
  s.sounds.play("winner");
  assert.equal(s.allocations(), 0);
  s.sounds.unlock();
  s.setState("suspended");
  s.sounds.play("reveal");
  assert.equal(s.voices.length, 0);
  s.setState("running");
  s.sounds.play("winner");
  assert.equal(s.voices.length, 4);
  s.sounds.stop();
  assert.ok(s.voices.every((voice) => voice.stopped && voice.disconnected));
  s.sounds.dispose();
  assert.equal(s.closed(), true);
  s.sounds.play("transition");
  s.sounds.unlock();
  assert.equal(s.voices.length, 4);
  assert.equal(s.allocations(), 1);
});

test("rejected unlock and unavailable Web Audio never throw or queue cues", async () => {
  const unavailable = new HostSounds(() => {
    throw new Error("Web Audio unavailable");
  });
  assert.doesNotThrow(() => {
    unavailable.unlock();
    unavailable.play("reveal");
    unavailable.dispose();
  });
  const blocked = new HostSounds(
    () =>
      ({
        state: "suspended",
        resume: () => Promise.reject(new Error("Blocked")),
        close: () => Promise.reject(new Error("Closed")),
      }) as unknown as AudioContext,
  );
  blocked.unlock();
  blocked.play("reveal");
  blocked.dispose();
  await new Promise<void>((resolve) => setImmediate(resolve));
});
