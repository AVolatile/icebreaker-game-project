import { expect, test, type Page } from "@playwright/test";
import { io, type Socket } from "socket.io-client";
import { DEFAULT_SETTINGS, gameById } from "../../shared/catalog";
import {
  GAME_IDS,
  type GameId,
  type HostAction,
  type Reply,
  type RoomView,
} from "../../shared/types";
import { MUSIC_TRACKS, type MusicTrack } from "../../src/lib/music";

declare global {
  interface Window {
    hostMusicProbe: {
      elements: HTMLAudioElement[];
      plays: {
        src: string;
        gesture: boolean;
        time: number;
        finaleVisible: boolean;
      }[];
      sockets: WebSocket[];
      activeVoices: number;
      oscillators: number;
    };
  }
}

async function probe(
  page: Page,
  mode: "native" | "blocked" | "unavailable" = "native",
) {
  await page.addInitScript((mode) => {
    const probe = (window.hostMusicProbe = {
      elements: [] as HTMLAudioElement[],
      plays: [] as {
        src: string;
        gesture: boolean;
        time: number;
        finaleVisible: boolean;
      }[],
      sockets: [] as WebSocket[],
      activeVoices: 0,
      oscillators: 0,
    });
    const NativeAudio = window.Audio;
    window.Audio = class extends NativeAudio {
      constructor(src?: string) {
        if (mode === "unavailable") throw new Error("Audio unavailable");
        super(src);
        probe.elements.push(this);
      }
      play() {
        probe.plays.push({
          src: this.src,
          gesture: navigator.userActivation.isActive,
          time: this.currentTime,
          finaleVisible:
            !!document.querySelector(".final-screen .confetti") &&
            !!document.querySelector(".final-hero h1"),
        });
        if (mode === "blocked")
          return Promise.reject(
            new DOMException("Playback blocked", "NotAllowedError"),
          );
        return super.play();
      }
    };
    const NativeWebSocket = window.WebSocket;
    window.WebSocket = class extends NativeWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        probe.sockets.push(this);
      }
    };
    const createOscillator = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      probe.oscillators++;
      const oscillator = createOscillator.call(this);
      probe.activeVoices++;
      oscillator.addEventListener("ended", () => probe.activeVoices--, {
        once: true,
      });
      return oscillator;
    };
  }, mode);
}

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const probe = window.hostMusicProbe;
    const audio = probe.elements[0];
    return {
      count: probe.elements.length,
      plays: probe.plays.length,
      firstGesture: probe.plays[0]?.gesture,
      oscillators: probe.oscillators,
      activeVoices: probe.activeVoices,
      src: audio?.getAttribute("src") ?? null,
      paused: audio?.paused,
      time: audio?.currentTime ?? 0,
      volume: audio?.volume ?? 0,
      loop: audio?.loop,
      error: audio?.error?.code ?? null,
    };
  });
}

async function playing(page: Page, track: MusicTrack) {
  await expect
    .poll(async () => (await snapshot(page)).src)
    .toBe(MUSIC_TRACKS[track]);
  await expect
    .poll(async () => (await snapshot(page)).time)
    .toBeGreaterThan(0.05);
  await expect
    .poll(async () => (await snapshot(page)).volume)
    .toBeCloseTo(track === "results" ? 0.12 : 0.18);
  expect(await snapshot(page)).toMatchObject({
    count: 1,
    paused: false,
    loop: track !== "intro" && track !== "results",
    error: null,
  });
}

async function roomSession(playlist: GameId[] = ["hotwire"], rounds = 1) {
  const sockets: Socket[] = [];
  async function client() {
    const socket = io("http://localhost:4310", {
      transports: ["websocket"],
      reconnection: false,
    });
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });
    return socket;
  }
  const host = await client();
  const created = await new Promise<Reply>((resolve) =>
    host.emit(
      "room:create",
      {
        settings: {
          ...DEFAULT_SETTINGS,
          playlist,
          rounds,
          pace: "relaxed",
          autoAdvance: false,
        },
      },
      resolve,
    ),
  );
  expect(created.ok).toBe(true);
  let state = created.state!;
  host.on("room:state", (next: RoomView) => {
    state = next;
  });
  const players = [];
  for (const name of ["Music Tester One", "Music Tester Two"]) {
    const socket = await client();
    const joined = await new Promise<Reply>((resolve) =>
      socket.emit(
        "room:join",
        {
          code: created.identity!.code,
          name,
          avatar: 0,
        },
        resolve,
      ),
    );
    expect(joined.ok).toBe(true);
    players.push(socket);
  }
  return {
    identity: created.identity!,
    state: () => state,
    async action(action: HostAction) {
      // Respect the existing host command limiter during fast automated play.
      await new Promise((resolve) => setTimeout(resolve, 300));
      const reply = await new Promise<Reply>((resolve) =>
        host.emit("host:action", { action }, resolve),
      );
      expect(reply.ok, reply.error).toBe(true);
    },
    async submitCreative(game: GameId) {
      for (const [index, player] of players.entries()) {
        const input =
          game === "scribble-shift"
            ? {
                drawing: [
                  {
                    color: "#191a24",
                    width: 5,
                    points: [
                      [0.1, 0.1],
                      [0.5, 0.5],
                    ],
                  },
                ],
              }
            : { text: `A creative answer from player ${index}` };
        const reply = await new Promise<Reply>((resolve) =>
          player.emit(
            "player:input",
            {
              input,
              roundKey: state.roundKey,
            },
            resolve,
          ),
        );
        expect(reply.ok, reply.error).toBe(true);
      }
    },
    async close() {
      await new Promise<Reply>((resolve) =>
        host.emit("host:action", { action: "end" }, resolve),
      );
      sockets.forEach((socket) => socket.disconnect());
    },
  };
}

async function openHost(
  page: Page,
  session: Awaited<ReturnType<typeof roomSession>>,
) {
  await page.addInitScript(
    (identity) =>
      sessionStorage.setItem("ruckus-session", JSON.stringify(identity)),
    session.identity,
  );
  await page.goto(`/room/${session.identity.code}/host`);
  await expect(page.locator(".host-screen.phase-lobby")).toBeVisible();
}

test("host music: real playback, all six games, shared mute/SFX, voting continuity, player isolation and cleanup", async ({
  page,
  browser,
}) => {
  test.setTimeout(65000);
  const session = await roomSession([...GAME_IDS]);
  const phoneContext = await browser.newContext();
  const phone = await phoneContext.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  phone.on("pageerror", (error) => errors.push(error.message));
  const playerMusicRequests: string[] = [];
  phone.on("request", (request) => {
    if (request.url().includes("/audio/"))
      playerMusicRequests.push(request.url());
  });
  try {
    await probe(page);
    await probe(phone);
    await openHost(page, session);
    expect(await snapshot(page)).toMatchObject({ count: 0, oscillators: 0 });
    await page.getByRole("button", { name: "Sound off M" }).click();
    await playing(page, "lobby");
    expect((await snapshot(page)).firstGesture).toBe(true);
    await page.getByRole("button", { name: "Sound on M" }).click();
    const muted = await snapshot(page);
    expect(muted.paused).toBe(true);

    await phone.goto(`/join?room=${session.identity.code}`);
    await phone.getByLabel("What should we call you?").fill("Quiet Controller");
    await phone.getByRole("button", { name: "I’m in. Let’s go." }).click();
    await expect(phone.locator(".player-screen.phase-lobby")).toBeVisible();
    await expect(page.locator(".lobby-player")).toHaveCount(3);
    expect((await snapshot(page)).oscillators).toBe(muted.oscillators);
    await phone.keyboard.press("m");

    // The shortcut retains its existing rule of ignoring focused buttons/fields.
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("m");
    await playing(page, "lobby");
    await expect(
      page.getByRole("button", { name: "Sound on M" }),
    ).toHaveAttribute("aria-pressed", "true");

    for (const [index, game] of GAME_IDS.entries()) {
      await session.action(index === 0 ? "start" : "next");
      await expect(page.locator(".host-screen.phase-intro")).toBeVisible();
      await playing(page, "intro");
      const beforePhase = await snapshot(page);
      await session.action("next");
      await expect(page.locator(".host-screen.phase-active")).toBeVisible();
      await playing(page, game);
      expect((await snapshot(page)).oscillators).toBeGreaterThan(
        beforePhase.oscillators,
      );
      const active = await snapshot(page);
      if (gameById(game).category === "creative") {
        await session.submitCreative(game);
        await session.action("next");
        await expect(page.locator(".host-screen.phase-voting")).toBeVisible();
        expect((await snapshot(page)).plays).toBe(active.plays);
        expect((await snapshot(page)).time).toBeGreaterThanOrEqual(active.time);
      } else {
        await session.action("lock"); // Repeated state, same track.
        expect((await snapshot(page)).plays).toBe(active.plays);
      }
      if (index === 0) await page.keyboard.press("m");
      const beforeResults = await snapshot(page);
      await session.action("next");
      await expect(page.locator(".host-screen.phase-results")).toBeVisible();
      if (index === 0) {
        const afterResults = await snapshot(page);
        expect(afterResults.paused).toBe(true);
        expect(afterResults.plays).toBe(beforeResults.plays);
        expect(afterResults.oscillators).toBe(beforeResults.oscillators);
        await page.keyboard.press("m");
      }
      await playing(page, "results");
      await session.action("next");
      if (index < GAME_IDS.length - 1) {
        await expect(
          page.locator(".host-screen.phase-intermission"),
        ).toBeVisible();
        await playing(page, "intermission");
      }
    }
    await expect(page.locator(".host-screen.phase-final")).toBeVisible();
    await playing(page, "finale");
    expect(await snapshot(phone)).toMatchObject({ count: 0, plays: 0 });
    expect(playerMusicRequests).toEqual([]);

    await page.getByRole("link", { name: "Ruckus home", exact: true }).click();
    await expect
      .poll(() => snapshot(page))
      .toMatchObject({
        count: 1,
        paused: true,
        src: null,
      });
    await page.goto(`/room/${session.identity.code}/host`);
    await expect(page.locator(".host-screen.phase-final")).toBeVisible();
    expect((await snapshot(page)).count).toBe(0);
    await page.getByRole("button", { name: "Sound off M" }).click();
    await playing(page, "finale");
    await session.action("end");
    await expect(page.locator(".host-screen.phase-ended")).toBeVisible();
    await expect
      .poll(() => snapshot(page))
      .toMatchObject({ paused: true, src: null });
    expect(errors).toEqual([]);
  } finally {
    await phoneContext.close();
    await session.close();
  }
});

for (const mode of ["blocked", "unavailable"] as const) {
  test(`gameplay finishes when music is ${mode}`, async ({ page }) => {
    const session = await roomSession();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await probe(page, mode);
      await openHost(page, session);
      await page.getByRole("button", { name: "Sound off M" }).click();
      await expect(
        page.getByRole("button", { name: "Sound on M" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Let’s make a ruckus" }).click();
      await expect(page.locator(".host-screen.phase-intro")).toBeVisible();
      await page.getByRole("button", { name: "We’re ready" }).click();
      await expect(page.locator(".host-screen.phase-active")).toBeVisible();
      await page.getByRole("button", { name: "Close round" }).click();
      await expect(page.locator(".host-screen.phase-results")).toBeVisible();
      await page.getByRole("button", { name: "Next →", exact: true }).click();
      await expect(page.locator(".host-screen.phase-final")).toBeVisible();
      expect(session.state().stats.rounds).toBe(1);
      if (mode === "blocked")
        expect((await snapshot(page)).plays).toBeGreaterThan(0);
      await page.getByRole("button", { name: "Sound on M" }).click();
      await expect(
        page.getByRole("button", { name: "Sound off M" }),
      ).toBeVisible();
      expect(errors).toEqual([]);
    } finally {
      await session.close();
    }
  });
}

test("question pacing, result silence, mute cancellation, live reconnect and confetti-aligned finale", async ({
  page,
}) => {
  test.setTimeout(60000);
  const session = await roomSession(["hotwire"], 2);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await probe(page);
    await openHost(page, session);
    await page.getByRole("button", { name: "Sound off M" }).click();
    await playing(page, "lobby");
    await session.action("start");
    await playing(page, "intro");
    await session.action("next");
    await playing(page, "hotwire");

    // Actual websocket interruption: retain the host view, then hydrate a fresh one.
    async function reconnect(phase: "active" | "final") {
      const before = await snapshot(page);
      await page.context().setOffline(true);
      await page.evaluate(() =>
        window.hostMusicProbe.sockets
          .filter((socket) => socket.url.includes("/socket.io/"))
          .forEach((socket) => socket.close()),
      );
      await expect(
        page.getByText("Connection dropped. Reconnecting to your room…"),
      ).toBeVisible();
      await expect.poll(async () => (await snapshot(page)).paused).toBe(true);
      await page.context().setOffline(false);
      await expect(page.locator(`.host-screen.phase-${phase}`)).toBeVisible();
      await expect(
        page.getByText("Connection dropped. Reconnecting to your room…"),
      ).toHaveCount(0);
      await playing(page, phase === "final" ? "finale" : "hotwire");
      expect((await snapshot(page)).oscillators).toBe(before.oscillators);
    }
    await reconnect("active");

    await session.action("next");
    await expect(page.locator(".round-reveal")).toBeVisible();
    // Mute before the delayed reveal: scheduled voices and later cues must die.
    await page.getByRole("button", { name: "Sound on M" }).click();
    const afterMute = await snapshot(page);
    await expect.poll(async () => (await snapshot(page)).activeVoices).toBe(0);
    await page.getByRole("button", { name: "Sound off M" }).click();
    await playing(page, "results");
    expect((await snapshot(page)).oscillators).toBe(afterMute.oscillators);
    await expect
      .poll(async () => (await snapshot(page)).src, { timeout: 5000 })
      .toBe(null);
    expect((await snapshot(page)).paused).toBe(true);

    // Same game/track, a new real question: one restart after the audio breath.
    const beforeQuestion = await snapshot(page);
    await session.action("next");
    await expect(page.locator(".host-screen.phase-active")).toBeVisible();
    await playing(page, "hotwire");
    const nextQuestion = await snapshot(page);
    expect(nextQuestion.plays).toBe(beforeQuestion.plays + 1);
    expect(nextQuestion.oscillators).toBe(beforeQuestion.oscillators + 3);
    await session.action("lock"); // Join-lock is unrelated to answers.
    expect((await snapshot(page)).plays).toBe(nextQuestion.plays);
    expect((await snapshot(page)).oscillators).toBe(nextQuestion.oscillators);
    await page.getByRole("button", { name: "Sound on M" }).click();
    await page.getByRole("button", { name: "Sound off M" }).click();
    await playing(page, "hotwire");
    expect((await snapshot(page)).oscillators).toBe(nextQuestion.oscillators);

    await session.action("next");
    await playing(page, "results");
    await expect
      .poll(async () => (await snapshot(page)).src, { timeout: 5000 })
      .toBe(null);
    await session.action("next");
    await expect(page.locator(".final-screen .confetti")).toBeAttached();
    await playing(page, "finale");
    const finalePlay = await page.evaluate(() =>
      window.hostMusicProbe.plays.at(-1),
    );
    expect(finalePlay).toMatchObject({ finaleVisible: true, time: 0 });
    const finale = await snapshot(page);
    await session.action("lock");
    expect((await snapshot(page)).plays).toBe(finale.plays);
    expect((await snapshot(page)).oscillators).toBe(finale.oscillators);
    expect((await snapshot(page)).time).toBeGreaterThan(finale.time);
    await reconnect("final");
    const reconnected = await snapshot(page);
    await page.getByRole("button", { name: "Sound on M" }).click();
    await page.getByRole("button", { name: "Sound off M" }).click();
    await playing(page, "finale");
    expect((await snapshot(page)).oscillators).toBe(reconnected.oscillators);
    await page.getByRole("button", { name: "Same crew. Rematch." }).click();
    await playing(page, "lobby");
    expect(errors).toEqual([]);
  } finally {
    await page.context().setOffline(false);
    await session.close();
  }
});
