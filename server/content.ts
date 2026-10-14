import type { GameId, Prompt } from "../shared/types.js";
export interface Question extends Prompt {
  answer?: number;
  pack?: string;
}
const q = (
  title: string,
  options: string[],
  answer: number,
  explanation: string,
  pack = "weird",
): Question => ({ title, options, answer, explanation, pack });
export const TRIVIA: Question[] = [
  q(
    "Which of these is a botanical berry?",
    ["Strawberry", "Banana", "Raspberry", "Blackberry"],
    1,
    "Botanically, bananas are berries. Strawberries are aggregate accessory fruits.",
    "food",
  ),
  q(
    "You’re in a lift in London. What do you press for street level?",
    ["1", "G", "B", "L"],
    1,
    "G stands for ground floor. The first floor is usually one level above.",
    "travel",
  ),
  q(
    "A standard URL starts with HTTP. What does the first T stand for?",
    ["Transfer", "Text", "Terminal", "Transport"],
    1,
    "HTTP is Hypertext Transfer Protocol.",
    "internet",
  ),
  q(
    "What is the tiny plastic tip of a shoelace called?",
    ["Ferrule", "Aglet", "Grommet", "Toggle"],
    1,
    "An aglet keeps the lace from fraying and makes threading easier.",
  ),
  q(
    "Which animal has three hearts?",
    ["Octopus", "Giraffe", "Penguin", "Dolphin"],
    0,
    "Two hearts pump blood to the gills. A third pumps it to the rest of the body.",
  ),
  q(
    "Which keyboard shortcut usually undoes your last action?",
    ["Ctrl / ⌘ + Z", "Ctrl / ⌘ + U", "Ctrl / ⌘ + R", "Ctrl / ⌘ + D"],
    0,
    "Z is your second chance. A very useful desk companion.",
    "work",
  ),
  q(
    "Which of these ingredients makes bread rise?",
    ["Salt", "Yeast", "Butter", "Vinegar"],
    1,
    "Yeast releases carbon dioxide, which expands the dough.",
    "food",
  ),
  q(
    "Which city has a famously leaning bell tower?",
    ["Pisa", "Paris", "Porto", "Prague"],
    0,
    "The Leaning Tower of Pisa began tilting during construction.",
    "travel",
  ),
  q(
    "What does the “incognito” browser window mainly avoid saving?",
    [
      "Your local browsing history",
      "Your IP address",
      "Your internet bill",
      "Every website’s logs",
    ],
    0,
    "Private windows limit local history. Websites and networks can still see activity.",
    "internet",
  ),
  q(
    "How many sides does a hexagon have?",
    ["Five", "Six", "Seven", "Eight"],
    1,
    "Hex means six. No calculator required.",
    "work",
  ),
  q(
    "Which of these is made from fermented tea?",
    ["Kombucha", "Kefir", "Espresso", "Horchata"],
    0,
    "Kombucha starts with sweetened tea and a culture of bacteria and yeast.",
    "food",
  ),
  q(
    "On a compass, which direction sits between south and west?",
    ["Northeast", "Northwest", "Southeast", "Southwest"],
    3,
    "Southwest divides the angle between south and west.",
    "travel",
  ),
  q(
    "What is the common name for the # symbol in social posts?",
    ["Hashtag", "Backslash", "Ampersand", "Caret"],
    0,
    "The hash symbol introduces a hashtag.",
    "internet",
  ),
  q(
    "Which film-making technique captures one frame at a time?",
    ["Stop motion", "Slow motion", "Motion blur", "Split screen"],
    0,
    "Stop motion moves objects a little between individual photographs.",
    "screen",
  ),
  q(
    "What does a Foley artist create for a film?",
    ["Sound effects", "Posters", "Costumes", "Subtitles"],
    0,
    "Foley artists perform everyday sounds to match on-screen action.",
    "screen",
  ),
  q(
    "In a spreadsheet, which symbol usually begins a formula?",
    ["=", "#", "&", "?"],
    0,
    "The equals sign tells the spreadsheet to calculate.",
    "work",
  ),
  q(
    "Which planet is famous for its prominent rings?",
    ["Mars", "Venus", "Saturn", "Mercury"],
    2,
    "Saturn’s rings are made mostly of ice particles.",
    "weird",
  ),
  q(
    "Which of these is a pasta shape?",
    ["Farfalle", "Focaccia", "Frittata", "Fontina"],
    0,
    "Farfalle is the bow-tie shape. The name means butterflies.",
    "food",
  ),
  q(
    "Which country uses the yen?",
    ["Japan", "Norway", "Brazil", "India"],
    0,
    "The yen is Japan’s currency.",
    "travel",
  ),
  q(
    "What does a browser bookmark save?",
    [
      "A link to a page",
      "A full internet backup",
      "Your screen brightness",
      "A copy of every image",
    ],
    0,
    "Bookmarks let you return to a saved URL.",
    "internet",
  ),
  q(
    "What is an establishing shot used to show?",
    ["The setting", "The credits", "A blooper", "The soundtrack"],
    0,
    "It orients the audience to the location of a scene.",
    "screen",
  ),
];
export const BLUFFS: Question[] = [
  q(
    "Bubble wrap was first developed as what?",
    [
      "Textured wallpaper",
      "Rainproof newspaper",
      "A swimming-pool cover",
      "A shoe lining",
    ],
    0,
    "Its inventors initially intended it to be textured wallpaper.",
  ),
  q(
    "What is a group of flamingos sometimes called?",
    ["A flamboyance", "A sparkle", "A pinkshift", "A flutter"],
    0,
    "A flamboyance is one collective name for flamingos.",
  ),
  q(
    "Which animal produces cube-shaped droppings?",
    ["Wombat", "Otter", "Panda", "Koala"],
    0,
    "The wombat’s intestinal structure forms distinctive cubes.",
  ),
  q(
    "The dot over a lowercase i or j is called what?",
    ["Tittle", "Niblet", "Dimple", "Pip"],
    0,
    "Tittle is the name for the small mark above those letters.",
  ),
  q(
    "What was the first webcam used to watch?",
    ["A coffee pot", "A sleeping dog", "A parking meter", "A weather balloon"],
    0,
    "Researchers at Cambridge watched the Trojan Room coffee pot.",
    "internet",
  ),
  q(
    "Which item has been used as currency on the island of Yap?",
    [
      "Large stone discs",
      "Painted feathers",
      "Glass pineapples",
      "Copper leaves",
    ],
    0,
    "Rai stones are large carved limestone discs.",
    "travel",
  ),
  q(
    "What color are most airplane flight recorder cases?",
    ["Bright orange", "Black", "Silver", "Dark blue"],
    0,
    "The bright color helps searchers find them after an incident.",
    "travel",
  ),
  q(
    "Which food can stay edible for an exceptionally long time when sealed?",
    ["Honey", "Fresh cheese", "Lettuce", "Cut avocado"],
    0,
    "Honey’s low water content and acidity inhibit microbial growth.",
    "food",
  ),
  q(
    "What is the smell after rain often called?",
    ["Petrichor", "Aerofrost", "Cloudmusk", "Drizzletone"],
    0,
    "Petrichor describes the earthy scent associated with rain.",
  ),
  q(
    "A croissant’s name refers to which shape?",
    ["Crescent", "Crown", "Spiral", "Wave"],
    0,
    "Croissant means crescent in French.",
    "food",
  ),
];
export const MAJORITY: Question[] = [
  {
    title: "One office snack survives five minutes. Which one?",
    options: ["Cookies", "Chips", "Fruit", "Granola bars"],
    pack: "food",
  },
  {
    title: "The meeting ends early. What’s your next move?",
    options: [
      "Coffee run",
      "Silent victory",
      "Walk outside",
      "Start another meeting?",
    ],
    pack: "work",
  },
  {
    title: "Your desk gets one upgrade. Choose wisely.",
    options: [
      "Better chair",
      "Tiny fridge",
      "Ocean view",
      "Mute button for the world",
    ],
    pack: "work",
  },
  {
    title: "Window seat or aisle? Settle it.",
    options: ["Window", "Aisle", "Whatever’s cheapest", "I’m taking the train"],
    pack: "travel",
  },
  {
    title: "Pick the superior potato format.",
    options: ["Fries", "Mash", "Roast", "Hash brown"],
    pack: "food",
  },
  {
    title: "Which superpower has the most office potential?",
    options: [
      "Teleportation",
      "Time freeze",
      "Perfect Wi-Fi",
      "Never lose a pen",
    ],
    pack: "work",
  },
  {
    title: "You can delete one internet inconvenience.",
    options: [
      "Cookie banners",
      "Autoplay videos",
      "Forgotten passwords",
      "Reply-all storms",
    ],
    pack: "internet",
  },
  {
    title: "Best way to watch a movie?",
    options: ["Cinema", "Sofa", "Outdoor screen", "On a flight"],
    pack: "screen",
  },
  {
    title: "Pick the office mascot.",
    options: ["Pigeon", "Raccoon", "Very tired robot", "Sentient stapler"],
    pack: "weird",
  },
  {
    title: "Your team gets a surprise day off. Where are you?",
    options: ["Beach", "Bed", "Mountains", "Snack aisle"],
    pack: "travel",
  },
  {
    title: "What’s the ideal coffee temperature?",
    options: ["Lava", "Hot", "Warm", "Iced"],
    pack: "food",
  },
  {
    title: "Best meeting start time?",
    options: ["9:05", "10:30", "After lunch", "Never o’clock"],
    pack: "work",
  },
];
export const PITCHES = [
  "Sell a luxury stapler to someone who doesn’t own paper.",
  "Name and pitch a subscription service for office chairs.",
  "Launch a holiday resort for very tired houseplants.",
  "Sell a printer that only prints compliments.",
  "Invent a sport played entirely in elevators.",
  "Pitch a productivity app for pigeons.",
  "Launch a coffee mug with an unnecessarily prestigious job title.",
  "Sell a wearable device that detects meetings that could have been emails.",
  "Create a premium brand of invisible sticky notes.",
  "Launch a talent agency for office plants.",
  "Pitch a desk lamp with a side hustle.",
  "Sell a subscription box containing exactly one surprise paperclip.",
];
export const DOODLES = [
  "A coffee machine on vacation",
  "A company run entirely by cats",
  "An office chair with superpowers",
  "The world’s least intimidating mascot",
  "A printer from the year 3026",
  "A pigeon delivering a keynote",
  "A stapler winning an award",
  "An office plant working from home",
  "A robot on its lunch break",
  "A duck who definitely read the brief",
  "A cactus in a job interview",
  "A cloud with too many meetings",
];
export const SCENE_TITLES = [
  "The pigeon has called an all-hands.",
  "Someone promoted the office plant.",
  "The coffee machine needs a coffee.",
  "A raccoon explains the quarterly numbers.",
  "The conference room has one attendee.",
  "A robot takes “working lunch” literally.",
  "The stapler has won Employee of the Month.",
  "A duck has booked every meeting room.",
  "A ghost tries to use the badge reader.",
  "The toaster presents its five-year plan.",
  "An alien discovers reply-all.",
  "The printer is on annual leave.",
  "The mushroom has a corner office.",
  "A cloud joins the video call.",
  "A banana gives a very serious keynote.",
];
export function getPrompt(
  game: GameId,
  round: number,
  pack: string,
  offset = 0,
): Question {
  const pick = (items: Question[]) => {
    const filtered = items.filter((x) => x.pack === pack);
    const pool = filtered.length ? filtered : items;
    return pool[(round + offset) % pool.length];
  };
  if (game === "hotwire") return pick(TRIVIA);
  if (game === "odd-one-in") return pick(BLUFFS);
  if (game === "room-temperature") return pick(MAJORITY);
  if (game === "sellout")
    return { title: PITCHES[(round + offset) % PITCHES.length] };
  if (game === "scribble-shift")
    return { title: DOODLES[(round + offset) % DOODLES.length] };
  const scene = (round + offset) % SCENE_TITLES.length;
  return { title: SCENE_TITLES[scene], scene };
}

export const BOT_PITCH_ROUNDS = [
  [
    "Staple Society — Hold it together, expensively.",
    "Paperless Prestige — You don’t need it. That’s the point.",
    "Clasp Class — For documents you haven’t invented yet.",
  ],
  [
    "Chairbnb — A different seat for every meeting.",
    "Seat Treat — Your monthly subscription to sitting pretty.",
    "Sit Happens — Upgrade your outlook, one chair at a time.",
  ],
  [
    "Leaf Me Alone — Five stars. Zero watering deadlines.",
    "Rest & Repot — Come back with better roots.",
    "Palm Springs — Finally, a holiday with actual palms.",
  ],
  [
    "Prints Charming — The only printer that believes in you.",
    "Toner of Voice — “You’re doing great” on demand.",
    "Positive Feed — Paper jams, but make them encouraging.",
  ],
  [
    "Lift League — Competitive standing, between floors.",
    "Buttonball — Peak athleticism. Minimum square footage.",
    "Going Up — Every match has its ups and downs.",
  ],
  [
    "PidgeOS — Fewer crumbs. More outcomes.",
    "CooDo — Turn your to-coo list into a done list.",
    "Wing It — Productivity, without the pecking order.",
  ],
  [
    "Chief Mug Officer — Promoted before your first sip.",
    "Vice President of Steam — Executive warmth.",
    "Head of Pourformance — A leadership vessel.",
  ],
  [
    "Meeting Meter — Find out before you find out.",
    "Agenda Bender — Your wrist knows this could be an email.",
    "Wrist Assured — A gentle buzz when the meeting gets circular.",
  ],
  [
    "Invisible Ink Inc. — See the potential.",
    "Clear Priorities — The notes you forgot are now invisible.",
    "Ghost-it — Reminder technology you cannot see.",
  ],
  [
    "Branch Manager — Talent with roots.",
    "Leaf Agency — Representation for the photosynthetically gifted.",
    "Growth Potential — We only sign rising stems.",
  ],
  [
    "LampCamp — Bright ideas after dark.",
    "Afterglow — Freelance illumination with main-character energy.",
    "Moonlighter — Literally doing the most.",
  ],
  [
    "Clip Club — One small attachment. One big commitment.",
    "Paperclip of the Month — Your documents deserve suspense.",
    "Bend & Send — The surprise is that it’s another paperclip.",
  ],
];
export const BOT_CAPTION_ROUNDS = [
  [
    "This could have been a coo.",
    "Per my last carrier pigeon.",
    "The agenda is mostly snacks.",
  ],
  [
    "The branch manager has arrived.",
    "Promoted for outstanding growth.",
    "This role comes with excellent benefits and indirect sunlight.",
  ],
  [
    "Even the coffee needs a coffee.",
    "The machine has requested a human break.",
    "Running on fumes, and technically also espresso.",
  ],
  [
    "We’ve diversified into the snack bin.",
    "The numbers are mostly crumbs.",
    "Our growth strategy is finding an unlocked lid.",
  ],
  [
    "Meeting attendance is looking buoyant.",
    "The balloon was the only one who accepted.",
    "One attendee. Still somehow over capacity.",
  ],
  [
    "Technically a byte to eat.",
    "Lunch has been optimized. Morale has not.",
    "Recharging counts as a working lunch.",
  ],
  [
    "Finally recognized for holding it all together.",
    "A binding commitment to excellence.",
    "The only employee with actual staples in their workflow.",
  ],
  [
    "Every room is now a duck pond.",
    "Booked for a quick quack.",
    "This reservation has no reasonable explanation.",
  ],
  [
    "The badge reader has trust issues.",
    "Transparent about attendance. Invisible to security.",
    "I’m here in spirit. Literally.",
  ],
  [
    "Our pipeline is mostly bread.",
    "A toast to the five-year plan.",
    "Strong outlook. Slightly burned margins.",
  ],
  [
    "The alien has learned our least advanced technology.",
    "First contact. Forty-seven recipients.",
    "Take me to your unsubscribe button.",
  ],
  [
    "The printer is finally out of office.",
    "Even the paper tray needs a break.",
    "No jams. Just sunshine.",
  ],
  [
    "The corner office has excellent room for growth.",
    "There’s not mushroom for another promotion.",
    "Quietly becoming the most cultured employee.",
  ],
  [
    "Joining from the cloud.",
    "Camera on. Forecast uncertain.",
    "Sorry, a little atmospheric interference.",
  ],
  [
    "A presentation with real appeal.",
    "Slipping into a leadership role.",
    "The keynote is going bananas.",
  ],
];
const BOT_ASIDES = [
  "",
  " Please advise.",
  " Send snacks.",
  " Calendar invite pending.",
];
export function botCreative(
  game: "sellout" | "caption-this",
  prompt: Question,
  index: number,
): string {
  const rows = game === "sellout" ? BOT_PITCH_ROUNDS : BOT_CAPTION_ROUNDS;
  const round =
    game === "sellout"
      ? Math.max(0, PITCHES.indexOf(prompt.title))
      : (prompt.scene ?? 0);
  const row = rows[round % rows.length];
  return `${row[index % row.length]}${BOT_ASIDES[Math.floor(index / row.length) % BOT_ASIDES.length]}`.slice(
    0,
    160,
  );
}
