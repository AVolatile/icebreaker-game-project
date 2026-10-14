import { chromium, expect } from "@playwright/test";
import { io } from "socket.io-client";
const origin = "http://localhost:4310";
const games = [
  "hotwire",
  "room-temperature",
  "sellout",
  "caption-this",
  "odd-one-in",
  "scribble-shift",
];
const browser = await chromium.launch();
async function capture(game) {
  const socket = io(origin, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false,
  });
  let state;
  socket.on("room:state", (s) => {
    state = s;
  });
  await new Promise((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("connect_error", reject);
  });
  const created = await new Promise((r) =>
    socket.emit(
      "room:create",
      {
        settings: {
          playlist: [game],
          rounds: 1,
          pace: "quick",
          pack: "mixed",
          lateJoins: true,
          reactions: true,
          autoAdvance: false,
        },
        demo: true,
      },
      r,
    ),
  );
  if (!created.ok) throw new Error(created.error);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 810 },
  });
  await context.addInitScript(
    (identity) =>
      sessionStorage.setItem("ruckus-session", JSON.stringify(identity)),
    created.identity,
  );
  const host = await context.newPage();
  await host.goto(`${origin}/room/${created.identity.code}/host`);
  await expect(host.locator(".lobby-players")).toBeVisible();
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const phone = await mobile.newPage();
  await phone.goto(`${origin}/join?room=${created.identity.code}`);
  await phone.getByLabel("What should we call you?").fill("Anthony");
  await phone.getByRole("button", { name: "I’m in. Let’s go." }).click();
  await expect(phone.locator(".player-lobby")).toBeVisible();
  const action = (action) =>
    new Promise((r) => socket.emit("host:action", { action }, r));
  const waitForState = (predicate) =>
    new Promise((resolve, reject) => {
      if (state && predicate(state)) return resolve();
      const timeout = setTimeout(() => {
        socket.off("room:state", listener);
        reject(new Error(`State timeout: ${game}`));
      }, 40000);
      const listener = (s) => {
        if (predicate(s)) {
          clearTimeout(timeout);
          socket.off("room:state", listener);
          resolve();
        }
      };
      socket.on("room:state", listener);
    });
  await action("start");
  await action("next");
  await expect(host.locator(".round-prompt h1")).toBeVisible();
  await expect(phone.locator(".player-prompt")).toBeVisible();
  await host.screenshot({
    path: `portfolio-assets/${game}-host.png`,
    fullPage: true,
    animations: "disabled",
  });
  if (game === "sellout") {
    await phone.getByLabel("Product name").fill("Offscript");
    await phone
      .getByLabel("Your one-line pitch")
      .fill("The questionable idea with the unusually good branding.");
  } else if (game === "caption-this")
    await phone
      .getByLabel("Your caption")
      .fill("Per my last extremely important meeting.");
  else if (game === "scribble-shift") {
    await phone.locator(".drawing-canvas").focus();
    await phone.keyboard.press("Space");
    for (let i = 0; i < 8; i++) await phone.keyboard.press("ArrowRight");
    for (let i = 0; i < 8; i++) await phone.keyboard.press("ArrowDown");
    for (let i = 0; i < 8; i++) await phone.keyboard.press("ArrowLeft");
    await phone.keyboard.press("Space");
  }
  await phone.screenshot({
    path: `portfolio-assets/${game}-phone.png`,
    fullPage: true,
    animations: "disabled",
  });
  if (["hotwire", "room-temperature", "odd-one-in"].includes(game))
    await phone.locator(".player-answer").nth(1).click();
  else
    await phone
      .getByRole("button", {
        name:
          game === "scribble-shift"
            ? "Send my masterpiece"
            : "Put it on the big screen",
      })
      .click();
  await waitForState((s) => s.players.every((p) => p.submitted));
  await action("next");
  if (["sellout", "caption-this", "scribble-shift"].includes(game)) {
    await expect(host.locator(".vote-gallery")).toBeVisible();
    await host.screenshot({
      path: `portfolio-assets/${game}-gallery.png`,
      fullPage: true,
      animations: "disabled",
    });
    await expect(phone.locator(".player-vote:enabled")).not.toHaveCount(0);
    await phone.locator(".player-vote:enabled").nth(0).click();
    await waitForState((s) => s.players.every((p) => p.voted));
    await action("next");
  }
  await expect(host.locator(".round-reveal")).toBeVisible();
  await host.screenshot({
    path: `portfolio-assets/${game}-reveal.png`,
    fullPage: true,
    animations: "disabled",
  });
  await action("end");
  await mobile.close();
  await context.close();
  socket.disconnect();
  console.log("Captured", game);
}
try {
  const requested = process.argv.slice(2);
  await Promise.all(
    (requested.length ? games.filter((g) => requested.includes(g)) : games).map(
      capture,
    ),
  );
} finally {
  await browser.close();
}
