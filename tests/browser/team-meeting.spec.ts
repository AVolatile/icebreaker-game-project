import { test, expect, type Page } from "@playwright/test";
import { io, type Socket } from "socket.io-client";
import {
  GAME_IDS,
  type ClientEvents,
  type ServerEvents,
  type RoomView,
  type Reply,
  type Input,
} from "../../shared/types";
import { TEAM_MEETING_PACK } from "../../shared/content/packs";
import { TEAM_MEETING_CONTENT } from "../../server/content/team-meeting";
import { PITCHES, botCreative } from "../../server/content";
import { botDrawing } from "../../server/engine";

type Client = {
  socket: Socket<ServerEvents, ClientEvents>;
  room: RoomView | null;
};

async function join(code: string, name: string): Promise<Client> {
  const socket: Client["socket"] = io("http://localhost:4310", {
    transports: ["websocket"],
    reconnection: false,
  });
  const client: Client = { socket, room: null };
  socket.on("room:state", (room) => {
    client.room = room;
  });
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("connect_error", reject);
  });
  const reply = await new Promise<Reply>((resolve) =>
    socket.emit("room:join", { code, name, avatar: 2 }, resolve),
  );
  expect(reply.ok, reply.error).toBe(true);
  client.room = reply.state!;
  return client;
}

async function input(client: Client, input: Input) {
  const reply = await new Promise<Reply>((resolve) =>
    client.socket.emit(
      "player:input",
      {
        input,
        roundKey: client.room!.roundKey,
      },
      resolve,
    ),
  );
  expect(reply.ok, reply.error).toBe(true);
}

async function action(page: Page, name: string) {
  // Keep the live server's existing host command rate limit intact.
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page
    .getByRole("button", { name, exact: true })
    .click({ timeout: 6000 });
}

test("Team Meeting selection runs two rounds of all six games, rotates on rematch and restores an existing pack", async ({
  page,
}, testInfo) => {
  test.setTimeout(65000);
  const clients: Client[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  try {
    await page.goto("/host");
    await expect(page.getByLabel("Content pack")).toHaveValue("mixed");
    await page.getByRole("button", { name: /Full Ruckus/ }).click();
    await page
      .getByLabel("Content pack")
      .selectOption({ label: TEAM_MEETING_PACK.name });
    await page.getByLabel("Rounds per game").selectOption("2");
    await page.getByLabel("Timer pace").selectOption("quick");
    await page.getByText("Keep the party moving", { exact: true }).click();
    await action(page, "Open the room");
    await expect(page.locator(".host-screen.phase-lobby")).toBeVisible();
    const code = (await page.locator(".host-code b").textContent())!;
    clients.push(
      await join(code, "Meeting Maya"),
      await join(code, "Meeting Jordan"),
    );
    await expect(page.locator(".lobby-player")).toHaveCount(2);
    expect(clients[0].room!.settings.pack).toBe(TEAM_MEETING_PACK.id);
    await action(page, "Let’s make a ruckus");
    let firstPrompt = "";
    for (const game of GAME_IDS) {
      await action(page, "We’re ready");
      const seen = new Set<string>();
      for (let round = 0; round < 2; round++) {
        await expect(page.locator(".host-screen.phase-active")).toBeVisible();
        await expect.poll(() => clients[0].room?.phase).toBe("active");
        const prompt = clients[0].room!.prompt!;
        const source = TEAM_MEETING_CONTENT[game].find(
          (p) => p.title === prompt.title,
        );
        expect(
          source,
          `${game}: unexpected prompt ${prompt.title}`,
        ).toBeTruthy();
        expect("answer" in prompt).toBe(false);
        expect("botResponses" in prompt).toBe(false);
        if (!firstPrompt) firstPrompt = prompt.title;
        seen.add(prompt.title);
        await expect(page.locator(".round-prompt h1")).toHaveText(prompt.title);
        if (game === "caption-this") {
          await expect(page.locator(".caption-scene")).toHaveAttribute(
            "src",
            `/scenes/${source!.scene}.svg`,
          );
          await expect
            .poll(() =>
              page
                .locator(".caption-scene")
                .evaluate((node: HTMLImageElement) => node.naturalWidth),
            )
            .toBeGreaterThan(0);
        }
        if (round === 0)
          await page.screenshot({
            path: testInfo.outputPath(`${game}-active.png`),
            fullPage: true,
            animations: "disabled",
          });
        for (const [index, client] of clients.entries()) {
          await input(
            client,
            game === "scribble-shift"
              ? { drawing: botDrawing(index, prompt.title) }
              : game === "sellout" || game === "caption-this"
                ? { text: botCreative(game, source!, index) }
                : {
                    choice:
                      game === "room-temperature" ? index : source!.answer!,
                  },
          );
        }
        await action(page, "Close round →");
        if (
          game === "sellout" ||
          game === "caption-this" ||
          game === "scribble-shift"
        ) {
          await expect(page.locator(".host-screen.phase-voting")).toBeVisible();
          await expect.poll(() => clients[0].room?.phase).toBe("voting");
          for (const client of clients) {
            const view = client.room!;
            expect(view.submissions.every((s) => !s.author)).toBe(true);
            await input(client, {
              vote: view.submissions.find((s) => s.id !== view.ownEntryId)!.id,
            });
          }
          await action(page, "Reveal votes →");
        }
        await expect(page.locator(".host-screen.phase-results")).toBeVisible();
        await action(page, "Next →");
      }
      expect(seen.size).toBe(2);
      if (game !== GAME_IDS[GAME_IDS.length - 1]) {
        await expect(
          page.locator(".host-screen.phase-intermission"),
        ).toBeVisible();
        await action(page, "Next →");
      }
    }
    await expect(page.locator(".host-screen.phase-final")).toBeVisible();
    expect(clients[0].room!.stats.rounds).toBe(12);
    await action(page, "Same crew. Rematch.");
    await expect(page.locator(".host-screen.phase-lobby")).toBeVisible();
    expect(clients[0].room!.settings.pack).toBe(TEAM_MEETING_PACK.id);
    await action(page, "Let’s make a ruckus");
    await action(page, "We’re ready");
    await expect(page.locator(".host-screen.phase-active")).toBeVisible();
    expect(clients[0].room!.prompt!.title).not.toBe(firstPrompt);

    await page.goto("/host?game=sellout");
    await page.getByLabel("Content pack").selectOption("food");
    await action(page, "Open the room");
    await expect(page.locator(".host-screen.phase-lobby")).toBeVisible();
    const nextCode = (await page.locator(".host-code b").textContent())!;
    clients.push(
      await join(nextCode, "Snack Maya"),
      await join(nextCode, "Snack Jordan"),
    );
    await action(page, "Let’s make a ruckus");
    await action(page, "We’re ready");
    await expect(page.locator(".host-screen.phase-active")).toBeVisible();
    expect(PITCHES).toContain(clients[2].room!.prompt!.title);
    expect(clients[2].room!.settings.pack).toBe("food");
    await action(page, "Host controls H");
    await action(page, "End this room");
    await action(page, "End room");
    await expect(page.locator(".host-screen.phase-ended")).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    clients.forEach((client) => client.socket.disconnect());
  }
});

test("all eight local Team Meeting scenes decode and retain readable vector composition", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1280, height: 620 });
  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll('"', "&quot;");
  await page.setContent(`<style>
    body { margin:0; padding:16px; background:#f9f7ed; color:#191a24; font:14px Arial,sans-serif; }
    main { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
    figure { margin:0; } img { width:100%; border:2px solid #191a24; border-radius:8px; box-sizing:border-box; }
    figcaption { padding:8px 0; line-height:1.3; font-weight:bold; }
  </style><main>${TEAM_MEETING_CONTENT["caption-this"].map((p) => `<figure><img src="http://localhost:4310/scenes/${p.scene}.svg" alt="${escape(p.sceneDirection!)}"><figcaption>${p.scene} · ${escape(p.title)}</figcaption></figure>`).join("")}</main>`);
  await page
    .locator("img")
    .evaluateAll((nodes: HTMLImageElement[]) =>
      Promise.all(nodes.map((node) => node.decode())),
    );
  await expect(page.locator("img")).toHaveCount(8);
  expect(
    await page
      .locator("img")
      .evaluateAll((nodes: HTMLImageElement[]) =>
        nodes.every((node) => node.naturalWidth > 0),
      ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("team-meeting-scenes.png"),
    fullPage: true,
  });
});
