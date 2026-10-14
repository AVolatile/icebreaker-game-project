import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { io } from "socket.io-client";
const origin = process.env.PRODUCTION_ORIGIN || "http://localhost:4311";
const response = await fetch(`${origin}/api/health`);
assert.equal(response.status, 200);
assert.equal((await response.json()).service, "ruckus");
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(origin);
assert.equal(await page.title(), "Ruckus — Clock out of ordinary.");
assert.ok(
  await page
    .getByRole("heading", { name: "Clock out of ordinary." })
    .isVisible(),
);
const socket = io(origin, { transports: ["websocket"] });
await new Promise((r, j) => {
  socket.once("connect", r);
  socket.once("connect_error", j);
});
const created = await new Promise((r) =>
  socket.emit(
    "room:create",
    {
      settings: {
        playlist: ["room-temperature"],
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
assert.equal(created.ok, true);
assert.ok(created.state.joinUrl.startsWith(`${origin}/join?room=`));
assert.equal(created.state.players.length, 8);
for (const action of ["start", "next", "next", "next", "end"]) {
  const reply = await new Promise((r) =>
    socket.emit("host:action", { action }, r),
  );
  assert.equal(reply.ok, true);
}
assert.deepEqual(errors, []);
socket.disconnect();
await browser.close();
console.log(
  "Production verified: health, static client, fonts, clean console, sockets, room, QR origin, lifecycle.",
);
