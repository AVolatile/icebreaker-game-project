import { test } from "node:test";
import assert from "node:assert/strict";
import { Room, botDrawing, makeCode } from "../server/engine.js";
import { DEFAULT_SETTINGS } from "../shared/catalog.js";
import type { GameId } from "../shared/types.js";
import { inputSchema, joinSchema } from "../server/validation.js";
function room(game: GameId = "hotwire", count = 2) {
  const r = new Room(
    makeCode(),
    { ...DEFAULT_SETTINGS, playlist: [game], rounds: 1, autoAdvance: false },
    "http://localhost:4310/join",
    () => {},
  );
  for (let i = 0; i < count; i++) r.join(`Player ${i}`, i, `socket-${i}`);
  return r;
}
test("codes are readable and names, drawings, and capacity are validated", () => {
  for (let i = 0; i < 100; i++) assert.match(makeCode(), /^[A-HJ-NP-Z2-9]{5}$/);
  assert.equal(
    joinSchema.safeParse({ code: "ABCDE", name: "<script>", avatar: 0 })
      .success,
    false,
  );
  assert.equal(
    inputSchema.safeParse({
      drawing: [{ color: "red", width: 5, points: [[1, 2]] }],
    }).success,
    false,
  );
  const r = room("hotwire", 30);
  assert.throws(() => r.join("Extra", 1, "extra"), /full/);
  r.dispose();
});
test("lobby minimum, lock, late join, disconnect, and identity recovery", () => {
  const r = room("hotwire", 1);
  assert.throws(() => r.action("start"), /at least two/);
  r.action("lock");
  assert.throws(() => r.join("New", 2, "new"), /locked/);
  r.action("lock");
  r.join("New", 2, "new");
  assert.throws(() => r.join("new", 3, "again"), /taken/);
  const p = [...r.players.values()][0];
  r.disconnect("socket-0");
  assert.equal(p.public.connected, false);
  r.resumePlayer(p.token, "recovered");
  assert.equal(p.public.connected, true);
  r.action("start");
  r.advance();
  const late = r.join("Late", 3, "late");
  assert.equal(r.view(late.id).eligible, false);
  assert.throws(() => r.submit(late.id, { choice: 1 }), /next round/);
  r.remove(p.public.id);
  assert.throws(() => r.resumePlayer(p.token, "again"), /no longer available/);
  r.action("end");
  assert.equal(r.phase, "ended");
  r.dispose();
});
test("pause blocks inputs, resumes deadline, and server scores trivia", () => {
  const r = room();
  r.action("start");
  r.advance();
  const id = [...r.players.keys()][0];
  assert.equal(r.view(id).prompt?.explanation, undefined);
  assert.deepEqual(r.view(id).correct, []);
  r.action("pause");
  assert.throws(() => r.submit(id, { choice: 0 }), /paused/);
  r.action("pause");
  r.submit(id, { choice: r.prompt!.answer! });
  assert.throws(() => r.submit(id, { choice: 0 }), /already locked/);
  r.advance();
  assert.equal(r.phase, "results");
  assert.ok(r.players.get(id)!.public.score >= 500);
  assert.equal(r.view(id).correct.length, 1);
  r.advance();
  assert.equal(r.phase, "final");
  r.action("rematch");
  assert.equal(r.phase, "lobby");
  assert.equal(r.players.get(id)!.public.score, 0);
  r.dispose();
});
test("all tied majority choices score; absent choices never score", () => {
  const r = room("room-temperature", 4);
  r.action("start");
  r.advance();
  const ids = [...r.players.keys()];
  ids.forEach((id, i) => r.submit(id, { choice: i % 2 }));
  r.advance();
  assert.deepEqual(r.correct, [0, 1]);
  for (const p of r.players.values()) assert.equal(p.public.score, 600);
  r.dispose();
});
for (const game of ["sellout", "caption-this", "scribble-shift"] as GameId[])
  test(`${game}: anonymous collection, self-vote prevention, vote scoring, final`, () => {
    const r = room(game);
    r.action("start");
    r.advance();
    const ids = [...r.players.keys()];
    ids.forEach((id, i) =>
      r.submit(
        id,
        game === "scribble-shift"
          ? { drawing: botDrawing(i) }
          : { text: `Safe creative entry ${i}` },
      ),
    );
    assert.equal(r.view().submissions.length, 0);
    r.advance();
    assert.equal(r.phase, "voting");
    const entries = r.view().submissions;
    assert.ok(entries.every((e) => e.author === undefined));
    assert.equal(r.view(ids[0]).ownEntryId, entries[0].id);
    assert.throws(() => r.submit(ids[0], { vote: entries[0].id }), /yourself/);
    r.submit(ids[0], { vote: entries[1].id });
    r.submit(ids[1], { vote: entries[0].id });
    assert.throws(
      () => r.submit(ids[1], { vote: entries[0].id }),
      /already locked/,
    );
    r.advance();
    assert.ok(r.view().submissions.every((e) => e.author));
    for (const p of r.players.values()) assert.equal(p.public.score, 300);
    r.advance();
    assert.equal(r.phase, "final");
    r.dispose();
  });
test("two-player fact game and 8 / 12 demo player rooms use the same lifecycle", () => {
  const r = room("odd-one-in");
  r.action("start");
  r.advance();
  for (const id of r.players.keys())
    r.submit(id, { choice: r.prompt!.answer! });
  r.advance();
  for (const p of r.players.values()) assert.equal(p.public.score, 700);
  r.dispose();
  for (const n of [8, 12]) {
    const demo = room("hotwire", 0);
    demo.addBots(n);
    assert.equal(demo.players.size, n);
    demo.action("start");
    demo.advance();
    assert.equal(demo.phase, "active");
    demo.dispose();
  }
});
