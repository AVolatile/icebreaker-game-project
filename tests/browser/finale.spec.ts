import { expect, test, type Page } from "@playwright/test";
import { Room } from "../../server/engine";
import { DEFAULT_SETTINGS } from "../../shared/catalog";
import type { RoomView } from "../../shared/types";
import { MUSIC_TRACKS } from "../../src/lib/music";

declare global {
  interface Window {
    finaleFixture: RoomView;
    setFinaleFixture: (room: RoomView) => void;
    finaleAudio: HTMLAudioElement[];
  }
}

function fixture(count: number): RoomView {
  const room = new Room(
    "ABCDE",
    {
      ...DEFAULT_SETTINGS,
      rounds: 1,
      autoAdvance: false,
    },
    "http://localhost:4310/join?room=ABCDE",
    () => {},
  );
  room.join("AlexandriaVolatile", 2, "host-fixture-one");
  room.join("Maya", 5, "host-fixture-two");
  if (count > 2) room.addBots(count - 2);
  [...room.players.values()].forEach(({ public: player }, index) => {
    player.score = index < 2 ? 1200 : index < 4 ? 600 : 0;
    player.delta = index < 2 ? 600 : 0;
    player.movement = (index % 3) - 1;
    player.votes = index === 1 ? 4 : 0;
    player.responseMs = [1200 + index * 100];
    player.drawingPoints = index === 0 ? 300 : 0;
  });
  room.phase = "final";
  room.stats = { rounds: 6, answers: count * 6, reactions: 24 };
  const state = room.view();
  room.dispose();
  return state;
}

// Presentation fixtures render the actual HostRoom and components, with only the
// party context replaced. Real lifecycle/audio behavior is tested separately below.
async function openFixture(page: Page, room: RoomView) {
  await page.addInitScript((room) => {
    window.finaleFixture = room;
  }, room);
  await page.route(/\/src\/lib\/party\.tsx(?:\?.*)?$/, async (route) => {
    const source = await (await route.fetch()).text();
    const react = source.match(/from "([^"]*\/react\.js[^"]*)"/)?.[1];
    if (!react)
      throw new Error(
        "Cannot resolve the demo's React module for presentation fixtures.",
      );
    await route.fulfill({
      contentType: "application/javascript",
      body: `
      import React from ${JSON.stringify(react)};
      export function PartyProvider({children}) { return children; }
      export function useParty() {
        const [room, setRoom] = React.useState(window.finaleFixture);
        window.setFinaleFixture = setRoom;
        return {
          room, identity: {code: room.code, role: "host", token: "fixture"},
          connected: true, error: "", reactions: [], clearError() {},
          action: async () => ({ok: true})
        };
      }
    `,
    });
  });
  await page.goto(`/room/${room.code}/host`);
  await expect(page.locator(".final-screen")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function desktopGeometry(page: Page, count: number) {
  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const r = document.querySelector(selector)!.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    };
    const rows = document.querySelector(".scoreboard-rows")!;
    return {
      width: innerWidth,
      height: innerHeight,
      pageHeight: document.documentElement.scrollHeight,
      pageWidth: document.documentElement.scrollWidth,
      header: rect(".host-header"),
      toolbar: rect(".host-toolbar"),
      hero: rect(".final-hero"),
      board: rect(".scoreboard-stage"),
      footer: rect(".final-footer"),
      rows: rect(".scoreboard-rows"),
      last: rect(".score-row:last-child"),
      awards: rect(".awards"),
      rowHeight: rows.clientHeight,
      scrollHeight: rows.scrollHeight,
      controls: [
        ...document.querySelectorAll(
          ".final-actions > *, .host-toolbar button",
        ),
      ].map((node) => {
        const r = node.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      }),
    };
  });
  expect(geometry.pageHeight).toBeLessThanOrEqual(geometry.height + 1);
  expect(geometry.pageWidth).toBeLessThanOrEqual(geometry.width);
  expect(geometry.hero.top).toBeGreaterThanOrEqual(geometry.header.bottom);
  expect(geometry.hero.right).toBeLessThan(geometry.board.left);
  expect(geometry.hero.bottom).toBeLessThanOrEqual(geometry.footer.top);
  expect(geometry.awards.bottom).toBeLessThanOrEqual(geometry.footer.top);
  expect(geometry.board.bottom).toBeLessThanOrEqual(geometry.footer.top);
  expect(geometry.footer.bottom).toBeLessThanOrEqual(geometry.toolbar.top);
  expect(geometry.toolbar.bottom).toBeLessThanOrEqual(geometry.height);
  for (const control of geometry.controls) {
    expect(control.top).toBeGreaterThanOrEqual(0);
    expect(control.bottom).toBeLessThanOrEqual(geometry.height);
    expect(control.right).toBeLessThanOrEqual(geometry.width);
    expect(control.left).toBeGreaterThanOrEqual(0);
  }
  if (count <= 10) {
    expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.rowHeight + 1);
    expect(geometry.last.bottom).toBeLessThanOrEqual(geometry.rows.bottom + 1);
  } else {
    expect(geometry.scrollHeight).toBeGreaterThan(geometry.rowHeight);
  }
}

async function scoreColumns(page: Page) {
  const rows = await page
    .locator(".scoreboard-finale .score-row")
    .evaluateAll((nodes) =>
      nodes.map((row) => {
        const total = row.querySelector(".score-number")!;
        const points = row.querySelector(".score-points")!;
        const delta = row.querySelector(".score-delta");
        const movement = row.querySelector(".movement");
        const totalRect = total.getBoundingClientRect();
        const pointsRect = points.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(total);
        return {
          textRight: range.getBoundingClientRect().right,
          columnWidth: pointsRect.width,
          columnHeight: pointsRect.height,
          columnLeft: pointsRect.left,
          totalTop: totalRect.top - row.getBoundingClientRect().top,
          nameRight: row.querySelector(".score-name")!.getBoundingClientRect()
            .right,
          avatarLeft: row.querySelector(".avatar")!.getBoundingClientRect()
            .left,
          movementRight: movement?.getBoundingClientRect().right,
          rightAligned: getComputedStyle(total).textAlign === "right",
          tabular:
            getComputedStyle(total).fontVariantNumeric.includes("tabular-nums"),
          totalFont: parseFloat(getComputedStyle(total).fontSize),
          deltaFont: delta
            ? parseFloat(getComputedStyle(delta).fontSize)
            : null,
          deltaText: delta?.textContent?.trim(),
          deltaBelow:
            !delta ||
            delta.getBoundingClientRect().top >= totalRect.bottom - 0.5,
        };
      }),
    );
  expect(rows.length).toBeGreaterThan(0);
  const spread = (values: number[]) =>
    Math.max(...values) - Math.min(...values);
  expect(spread(rows.map((row) => row.textRight))).toBeLessThanOrEqual(1);
  expect(spread(rows.map((row) => row.columnWidth))).toBeLessThanOrEqual(1);
  expect(spread(rows.map((row) => row.columnHeight))).toBeLessThanOrEqual(1);
  if (page.viewportSize()!.width >= 900)
    expect(spread(rows.map((row) => row.totalTop))).toBeLessThanOrEqual(1);
  for (const row of rows) {
    expect(row.rightAligned).toBe(true);
    expect(row.tabular).toBe(true);
    expect(row.nameRight).toBeLessThan(row.columnLeft);
    expect(row.deltaBelow).toBe(true);
    if (row.movementRight !== undefined)
      expect(row.movementRight).toBeLessThan(row.avatarLeft);
    if (row.deltaFont !== null) {
      expect(row.deltaFont).toBeLessThan(row.totalFont);
      expect(row.deltaText).toMatch(/^\+[\d,]+ this round$/);
    }
  }
}

for (const count of [2, 5, 10, 30]) {
  test(`finale presentation with ${count} players: desktop matrix, long names, ties and narrow layout`, async ({
    page,
  }, testInfo) => {
    const room = fixture(count);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await openFixture(page, room);
    const expected = [...room.players].sort((a, b) => b.score - a.score);
    await expect(page.locator(".final-hero h1")).toContainText(
      expected[0].name,
    );
    await expect(page.locator(".tie-note")).toHaveText(
      `A shared crown: ${expected[0].name}, ${expected[1].name}.`,
    );
    await expect(page.locator(".score-row")).toHaveCount(count);
    await expect(page.locator(".score-row.leader .score-name")).toContainText(
      expected[0].name,
    );
    await expect(page.locator(".award")).toHaveCount(4);
    expect(await page.locator(".score-number").allTextContents()).toEqual(
      expected.map((p) => p.score.toLocaleString()),
    );
    if (count > 2)
      await expect(page.locator(".score-name small")).toHaveCount(count - 2);
    for (const [width, height] of [
      [1280, 720],
      [1366, 768],
      [1440, 900],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width, height });
      await desktopGeometry(page, count);
      await scoreColumns(page);
      await page.screenshot({
        path: testInfo.outputPath(`finale-${width}x${height}.png`),
        animations: "disabled",
      });
    }
    if (count > 10) {
      const list = page.getByRole("region", {
        name: "Pecking Order standings",
      });
      await list.focus();
      await page.keyboard.press("End");
      await expect
        .poll(() => list.evaluate((node) => node.scrollTop))
        .toBeGreaterThan(0);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await scoreColumns(page);
    const mobile = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      hero: document.querySelector(".final-hero")!.getBoundingClientRect()
        .bottom,
      board: document
        .querySelector(".scoreboard-stage")!
        .getBoundingClientRect(),
      actions: document.querySelector(".final-actions")!.getBoundingClientRect()
        .top,
    }));
    expect(mobile.width).toBeLessThanOrEqual(390);
    expect(mobile.hero).toBeLessThan(mobile.board.top);
    expect(mobile.board.bottom).toBeLessThan(mobile.actions);
    await page.screenshot({
      path: testInfo.outputPath("finale-mobile.png"),
      fullPage: true,
      animations: "disabled",
    });
    expect(errors).toEqual([]);
  });
}

test("large intermission standings, many-way ties and optional Studio recap stay bounded", async ({
  page,
}) => {
  const room = fixture(30);
  room.players.forEach((p) => {
    p.score = 1800;
  });
  room.board = {
    title: "Our Friday Ruckus",
    description: "Team questions",
    color: "#2548f4",
    questionCount: 6,
    scoring: true,
    leaderboardFrequency: "each",
  };
  room.summary = {
    questions: [],
    correctness: 65,
    hardestQuestion: 3,
    fastest: { name: room.players[0].name, ms: 1200 },
  };
  await page.setViewportSize({ width: 1280, height: 720 });
  await openFixture(page, room);
  await page.locator(".final-tie summary").click();
  await expect(page.locator(".final-tie p")).toContainText(
    room.players[29].name,
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".final-tie")).not.toHaveAttribute("open");
  await page.locator(".final-recap summary").click();
  await expect(
    page.getByRole("button", { name: "Export session summary" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Same crew. Rematch." }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    720,
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".final-recap")).not.toHaveAttribute("open");

  await page.evaluate(
    (room) => window.setFinaleFixture({ ...room, phase: "intermission" }),
    room,
  );
  await expect(page.locator(".intermission .score-row")).toHaveCount(30);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    720,
  );
  expect(
    await page
      .locator(".scoreboard-rows")
      .evaluate((node) => node.scrollHeight > node.clientHeight),
  ).toBe(true);

  await page.evaluate(
    (room) =>
      window.setFinaleFixture({
        ...room,
        board: { ...room.board!, scoring: false },
      }),
    room,
  );
  await expect(
    page.getByRole("heading", { name: "Every opinion counted." }),
  ).toBeVisible();
  await expect(page.locator(".final-hero .awards")).toHaveCount(0);
  await expect(page.locator(".final-crew .avatar")).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    720,
  );
});

test("live finale preserves rematch/new-lineup and music transitions/mute controls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const NativeAudio = Audio;
    window.finaleAudio = [];
    window.Audio = class extends NativeAudio {
      constructor() {
        super();
        window.finaleAudio.push(this);
      }
    };
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/host?game=hotwire");
  await page.getByLabel("Rounds per game").selectOption("1");
  await page.getByText("Keep the party moving", { exact: true }).click();
  await page
    .getByRole("button", { name: "Open the room", exact: true })
    .click();
  await expect(page.locator(".host-screen.phase-lobby")).toBeVisible();
  const code = await page.locator(".host-code b").textContent();
  await page
    .getByRole("button", { name: "+ 4 demo players", exact: true })
    .click();
  await expect(page.locator(".lobby-player")).toHaveCount(4);
  await page.getByRole("button", { name: "Sound off M" }).click();
  for (let round = 0; round < 2; round++) {
    await page.getByRole("button", { name: "Let’s make a ruckus" }).click();
    await page.getByRole("button", { name: "We’re ready" }).click();
    await page.getByRole("button", { name: "Close round" }).click();
    await page.getByRole("button", { name: "Next →", exact: true }).click();
    await expect(page.locator(".final-screen")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => window.finaleAudio[0]?.getAttribute("src")),
      )
      .toBe(MUSIC_TRACKS.finale);
    await expect
      .poll(() => page.evaluate(() => window.finaleAudio[0]?.currentTime))
      .toBeGreaterThan(0);
    if (round === 0) {
      await page.locator(".final-recap summary").focus();
      await page.keyboard.press("Space");
      await expect(page.locator(".final-recap")).toHaveAttribute("open");
      await page.keyboard.press("Escape");
      await expect(page.locator(".final-recap")).not.toHaveAttribute("open");
      await expect(page.locator(".host-error .error-message")).toHaveCount(0);
      await page.locator("body").click({ position: { x: 5, y: 5 } });
      await page.keyboard.press("m");
      await expect(
        page.getByRole("button", { name: "Sound off M" }),
      ).toBeVisible();
      expect(await page.evaluate(() => window.finaleAudio[0].paused)).toBe(
        true,
      );
      await page.getByRole("button", { name: "Sound off M" }).click();
      await page.getByRole("button", { name: "Same crew. Rematch." }).click();
      await expect(page.locator(".host-screen.phase-lobby")).toBeVisible();
      await expect(page.locator(".host-code b")).toHaveText(code!);
      await expect(page.locator(".lobby-player")).toHaveCount(4);
      await expect
        .poll(() =>
          page.evaluate(() => window.finaleAudio[0].getAttribute("src")),
        )
        .toBe(MUSIC_TRACKS.lobby);
    }
  }
  await page.getByRole("link", { name: "New lineup", exact: true }).click();
  await expect(page).toHaveURL(/\/host$/);
  await expect
    .poll(() => page.evaluate(() => window.finaleAudio[0].paused))
    .toBe(true);
  expect(errors).toEqual([]);
});
