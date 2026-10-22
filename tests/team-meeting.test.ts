import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { PACKS, DEFAULT_SETTINGS } from "../shared/catalog.js";
import { GAME_IDS } from "../shared/types.js";
import { TEAM_MEETING_PACK } from "../shared/content/packs.js";
import { TEAM_MEETING_CONTENT } from "../server/content/team-meeting.js";
import { botCreative, getPrompt } from "../server/content.js";
import { Room, botDrawing } from "../server/engine.js";
import { inputSchema, safeText, settingsSchema } from "../server/validation.js";

test("Team Meeting Pack registers once, validates and leaves the global default alone", () => {
  assert.deepEqual(
    PACKS.filter((p) => p.id === TEAM_MEETING_PACK.id),
    [TEAM_MEETING_PACK],
  );
  assert.equal(TEAM_MEETING_PACK.name, "Team Meeting Pack");
  assert.equal(DEFAULT_SETTINGS.pack, "mixed");
  for (const { id } of PACKS)
    assert.equal(
      settingsSchema.safeParse({ ...DEFAULT_SETTINGS, pack: id }).success,
      true,
      id,
    );
  assert.equal(
    settingsSchema.safeParse({ ...DEFAULT_SETTINGS, pack: "missing-pack" })
      .success,
    false,
  );
});

test("all six games use only their eight Team Meeting prompts and preserve offset rotation", () => {
  for (const game of GAME_IDS) {
    const pool = TEAM_MEETING_CONTENT[game];
    assert.equal(pool.length, 8, game);
    assert.equal(new Set(pool.map((p) => p.title)).size, 8);
    for (const offset of [0, 1, 17, 499]) {
      const titles = new Set<string>();
      for (let round = 0; round < 16; round++) {
        const prompt = getPrompt(game, round, TEAM_MEETING_PACK.id, offset);
        assert.equal(prompt, pool[(round + offset) % 8]);
        assert.equal(prompt.pack, TEAM_MEETING_PACK.id);
        assert.ok(safeText(prompt.title));
        titles.add(prompt.title);
        if (game === "hotwire" || game === "odd-one-in") {
          assert.equal(prompt.options?.length, 4);
          assert.equal(new Set(prompt.options).size, 4);
          assert.ok(
            Number.isInteger(prompt.answer) &&
              prompt.answer! >= 0 &&
              prompt.answer! < 4,
          );
          assert.ok(prompt.explanation);
        } else assert.equal(prompt.answer, undefined);
        if (game === "room-temperature")
          assert.equal(prompt.options?.length, 4);
      }
      assert.equal(titles.size, 8);
    }
  }
});

test("existing packs retain their pre-change prompts, rotation and creative bot answers", () => {
  // Recorded from the original demo content module before adding this pack.
  const baseline: {
    offsets: number[];
    rounds: number;
    bots: number;
    hashes: Record<string, string>;
  } = JSON.parse(
    readFileSync(
      new URL("./fixtures/existing-pack-routing.json", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    Object.keys(baseline.hashes),
    PACKS.filter((p) => p.id !== TEAM_MEETING_PACK.id).map((p) => p.id),
  );
  for (const [pack, expected] of Object.entries(baseline.hashes)) {
    const hash = createHash("sha256");
    for (const game of GAME_IDS)
      for (const offset of baseline.offsets)
        for (let round = 0; round < baseline.rounds; round++) {
          const prompt = getPrompt(game, round, pack, offset);
          const responses =
            game === "sellout" || game === "caption-this"
              ? Array.from({ length: baseline.bots }, (_, index) =>
                  botCreative(game, prompt, index),
                )
              : [];
          hash.update(JSON.stringify([game, round, offset, prompt, responses]));
        }
    assert.equal(hash.digest("hex"), expected, `${pack} changed`);
  }
});

test("creative bots match every Team Meeting pitch/scene and stay safe for 30 players", () => {
  for (const game of ["sellout", "caption-this"] as const) {
    for (const prompt of TEAM_MEETING_CONTENT[game]) {
      assert.equal(prompt.botResponses?.length, 3);
      for (let index = 0; index < 30; index++) {
        const response = botCreative(game, prompt, index);
        assert.ok(response.startsWith(prompt.botResponses![index % 3]));
        assert.ok(inputSchema.safeParse({ text: response }).success);
        assert.ok(safeText(response));
        assert.doesNotMatch(
          response,
          /stapler|office chair|printer|paperclip/i,
        );
      }
    }
  }
});

test("new captions reference eight small local scenes without reusing the office scenes", () => {
  const scenes = TEAM_MEETING_CONTENT["caption-this"];
  assert.deepEqual(
    scenes.map((p) => p.scene),
    [15, 16, 17, 18, 19, 20, 21, 22],
  );
  for (const prompt of scenes) {
    const svg = readFileSync(
      new URL(`../public/scenes/${prompt.scene}.svg`, import.meta.url),
      "utf8",
    );
    assert.ok(svg.includes('viewBox="0 0 640 360"'));
    assert.ok(svg.includes("<title>") && svg.includes("<desc>"));
    assert.ok(Buffer.byteLength(svg) < 5000);
    assert.doesNotMatch(svg, /<script|<image|https?:\/\/(?!www\.w3\.org)/);
    assert.ok(prompt.sceneDirection);
  }
});

test("scheduled demo bots submit matching Team Meeting pitches/captions and complete votes", (t) => {
  t.mock.timers.enable({ apis: ["Date", "setTimeout"] });
  const room = new Room(
    "ABCDE",
    {
      ...DEFAULT_SETTINGS,
      playlist: ["sellout", "caption-this"],
      pack: TEAM_MEETING_PACK.id,
      rounds: 2,
      pace: "quick",
      autoAdvance: false,
    },
    "http://localhost:4310/join?room=ABCDE",
    () => {},
  );
  try {
    room.addBots(4);
    room.action("start");
    for (const game of ["sellout", "caption-this"] as const) {
      room.advance();
      for (let round = 0; round < 2; round++) {
        t.mock.timers.tick(22000);
        assert.equal(room.phase, "active");
        assert.equal(room.entries.size, 4);
        const source = TEAM_MEETING_CONTENT[game].find(
          (p) => p.title === room.prompt!.title,
        )!;
        for (const entry of room.entries.values()) {
          assert.ok("text" in entry.input);
          assert.ok(
            source.botResponses!.some(
              (text) =>
                "text" in entry.input && entry.input.text.startsWith(text),
            ),
          );
        }
        room.advance();
        assert.equal(room.phase, "voting");
        t.mock.timers.tick(10000);
        assert.equal(room.votes.size, 4);
        room.advance();
        assert.equal(room.phase, "results");
        room.advance();
      }
      if (room.phase === "intermission") room.advance();
    }
    assert.equal(room.phase, "final");
    assert.equal(room.stats.answers, 16);
    assert.equal(
      [...room.players.values()].reduce((sum, p) => sum + p.public.score, 0),
      4800,
    );
  } finally {
    room.dispose();
  }
});

test("Team Meeting plays five rounds of every Original, keeps answers private and rotates on rematch", () => {
  const room = new Room(
    "ABCDE",
    {
      ...DEFAULT_SETTINGS,
      playlist: [...GAME_IDS],
      pack: TEAM_MEETING_PACK.id,
      rounds: 5,
      autoAdvance: false,
    },
    "http://localhost:4310/join?room=ABCDE",
    () => {},
  );
  try {
    room.join("Maya", 0, "one");
    room.join("Jordan", 1, "two");
    room.action("start");
    let firstPrompt = "";
    for (const game of GAME_IDS) {
      room.advance();
      const seen = new Set<string>();
      for (let round = 0; round < 5; round++) {
        assert.equal(room.phase, "active");
        assert.ok(
          TEAM_MEETING_CONTENT[game].some(
            (p) => p.title === room.prompt!.title,
          ),
        );
        if (!firstPrompt) firstPrompt = room.prompt!.title;
        seen.add(room.prompt!.title);
        const publicPrompt = room.view().prompt!;
        assert.equal("answer" in publicPrompt, false);
        assert.equal("botResponses" in publicPrompt, false);
        assert.equal(publicPrompt.explanation, undefined);
        const ids = [...room.players.keys()];
        ids.forEach((id, index) =>
          room.submit(
            id,
            game === "scribble-shift"
              ? { drawing: botDrawing(index, room.prompt!.title) }
              : game === "sellout" || game === "caption-this"
                ? { text: botCreative(game, room.prompt!, index) }
                : {
                    choice:
                      game === "room-temperature"
                        ? index
                        : room.prompt!.answer!,
                  },
          ),
        );
        room.advance();
        if (room.phase === "voting") {
          assert.ok(room.view().submissions.every((s) => !s.author));
          ids.forEach((id) => {
            const view = room.view(id);
            room.submit(id, {
              vote: view.submissions.find((s) => s.id !== view.ownEntryId)!.id,
            });
          });
          room.advance();
        }
        assert.equal(room.phase, "results");
        for (const { public: player } of room.players.values()) {
          if (game === "hotwire") assert.ok(player.delta >= 500);
          else
            assert.equal(
              player.delta,
              game === "room-temperature"
                ? 600
                : game === "odd-one-in"
                  ? 700
                  : 300,
            );
        }
        room.advance();
      }
      assert.equal(seen.size, 5, game);
      if (room.phase === "intermission") room.advance();
    }
    assert.equal(room.phase, "final");
    assert.equal(room.stats.rounds, 30);
    room.action("rematch");
    assert.equal(room.settings.pack, TEAM_MEETING_PACK.id);
    assert.ok([...room.players.values()].every((p) => p.public.score === 0));
    room.action("start");
    room.advance();
    assert.notEqual(room.prompt!.title, firstPrompt);
    assert.ok(
      TEAM_MEETING_CONTENT.hotwire.some((p) => p.title === room.prompt!.title),
    );
  } finally {
    room.dispose();
  }
});
