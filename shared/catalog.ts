import { TOPICS } from "./content/topics.js";
import { TEAM_MEETING_PACK } from "./content/packs.js";
import type { GameInfo, Settings } from "./types.js";
export const GAMES: GameInfo[] = [
  {
    id: "hotwire",
    name: "Hotwire",
    short: "Think fast. Tap faster.",
    description:
      "A little knowledge. A lot of adrenaline. Beat the clock on unexpected trivia, before your very confident coworker does.",
    rule: "Pick the right answer. Faster correct answers earn more points.",
    color: "#ff7448",
    icon: "bolt",
    category: "trivia",
    energy: "High voltage",
    minutes: 4,
  },
  {
    id: "room-temperature",
    name: "Room Temperature",
    short: "Read the room. Literally.",
    description:
      "Cold brew or hot coffee? Window seat or aisle? Predict the room’s collective taste. Being right is entirely beside the point.",
    rule: "Choose what you think most people will pick. The majority earns 600 points.",
    color: "#c0ee7b",
    icon: "eye",
    category: "voting",
    energy: "Low pressure",
    minutes: 4,
  },
  {
    id: "sellout",
    name: "Sellout",
    short: "Terrible idea. Excellent pitch.",
    description:
      "A luxury stapler. A printer that only prints compliments. Give a terrible product an irresistible name and a one-line pitch.",
    rule: "Write a product name and pitch. Vote for someone else. Each vote earns 300 points.",
    color: "#ffa9d2",
    icon: "megaphone",
    category: "creative",
    energy: "Big personality",
    minutes: 6,
  },
  {
    id: "caption-this",
    name: "Caption This",
    short: "The picture needs explaining.",
    description:
      "An office pigeon has called a meeting. You’re responsible for the caption. Write it, reveal it, and let the room decide.",
    rule: "Caption the illustration. Vote for your favorite. Each vote earns 300 points.",
    color: "#a9d9f6",
    icon: "bubble",
    category: "creative",
    energy: "Laugh out loud",
    minutes: 6,
  },
  {
    id: "odd-one-in",
    name: "Odd One In",
    short: "Three lies. One lovely fact.",
    description:
      "The truth has dressed up as nonsense. Find the real fact hiding among three very plausible inventions.",
    rule: "Spot the real answer among the bluffs. A correct pick earns 700 points.",
    color: "#ffcc67",
    icon: "asterisk",
    category: "trivia",
    energy: "Friendly suspicion",
    minutes: 4,
  },
  {
    id: "scribble-shift",
    name: "Scribble Shift",
    short: "Art skills strictly optional.",
    description:
      "Draw a coffee machine on vacation with one finger and a concerning lack of time. Vote for the masterpiece. Or the disaster.",
    rule: "Draw the prompt. Vote for someone else’s work. Each vote earns 300 points.",
    color: "#b7aff8",
    icon: "pencil",
    category: "creative",
    energy: "Creative chaos",
    minutes: 6,
  },
];
export const gameById = (id: string) =>
  GAMES.find((g) => g.id === id) ?? GAMES[0];
export const DEFAULT_SETTINGS: Settings = {
  playlist: ["room-temperature", "hotwire", "sellout"],
  rounds: 3,
  pace: "normal",
  pack: "mixed",
  lateJoins: true,
  reactions: true,
  autoAdvance: true,
};
export const PACKS = [
  ...Object.entries(TOPICS)
    .filter(
      ([id]) => !["food", "travel", "weird", "internet", "screen"].includes(id),
    )
    .map(([id, name]) => ({ id, name })),
  { id: "mixed", name: "Mixed signals" },
  { id: "work", name: "Out of office" },
  { id: "food", name: "Snack opinions" },
  { id: "travel", name: "Departure lounge" },
  { id: "weird", name: "Strangely true" },
  { id: "internet", name: "Browser history" },
  { id: "screen", name: "Screen time" },
  TEAM_MEETING_PACK,
];
export const AVATAR_NAMES = [
  "Orbit",
  "Bandit",
  "Boo",
  "Frogbert",
  "Toast",
  "Pidge",
  "Prickle",
  "Beep",
  "Jelly",
  "Peel",
  "Rex",
  "Espresso",
  "Shroom",
  "Fin",
  "Visitor",
  "Quack",
  "Noodle",
  "Miso",
  "Grizzly",
  "Nimbus",
];
export const AVATAR_COLORS = [
  "#ff7448",
  "#b7aff8",
  "#a9d9f6",
  "#c0ee7b",
  "#ffcc67",
  "#a9d9f6",
  "#c0ee7b",
  "#b7aff8",
  "#ffa9d2",
  "#f6ed51",
  "#c0ee7b",
  "#ff7448",
  "#ffa9d2",
  "#a9d9f6",
  "#b7aff8",
  "#ffcc67",
  "#ffa9d2",
  "#ff7448",
  "#ffcc67",
  "#a9d9f6",
];
export const REACTIONS = ["😂", "🔥", "👏", "🤯", "👀"];

export function gameForRoom(room: import("./types.js").RoomView): GameInfo {
  const game = gameById(room.settings.playlist[room.gameIndex]);
  return room.board
    ? {
        ...game,
        name: room.board.title,
        short: "Your questions. Their competitive side.",
        color: room.board.color,
        rule: "Read the question. Tap your answer. Let the room find its champion.",
      }
    : game;
}
