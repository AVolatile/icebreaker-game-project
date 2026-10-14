import type { CustomBoard, CustomQuestion } from "../boards.js";

type CollectionQuestion = Pick<
  CustomQuestion,
  "prompt" | "difficulty" | "explanation"
> & {
  category: string;
  options: string[];
  answerIndex: number;
};

// Host-supplied punchline keys are intentional: this collection includes playful opinions.
const questions: CollectionQuestion[] = [
  {
    category: "Football",
    difficulty: "easy",
    prompt:
      "Which position is most likely to celebrate a routine first down like they just won an Oscar?",
    options: ["Offensive lineman", "Quarterback", "Wide receiver", "Punter"],
    answerIndex: 2,
    explanation:
      "Wide receivers have made dramatic first-down celebrations a respected art form.",
  },
  {
    category: "Football",
    difficulty: "easy",
    prompt: "In football, a 'pick-six' is best described as:",
    options: [
      "A bad fantasy draft strategy",
      "An interception returned for a touchdown",
      "Six penalty flags on one play",
      "A QB getting sacked six times",
    ],
    answerIndex: 1,
    explanation: "A pick-six is an interception brought back to the end zone.",
  },
  {
    category: "Football",
    difficulty: "medium",
    prompt:
      "Which NFL day has the strongest emotional support-group energy every year?",
    options: [
      "Week 1",
      "Thanksgiving games",
      "The Monday after fantasy playoffs",
      "The NFL Draft",
    ],
    answerIndex: 2,
    explanation:
      "The Monday after fantasy playoff losses has ruined many otherwise productive mornings.",
  },
  {
    category: "Football",
    difficulty: "medium",
    prompt:
      "If someone says, 'My team just needs an O-line,' what they really mean is:",
    options: [
      "Everything is fine",
      "They need a new mascot",
      "Their quarterback is being folded like laundry",
      "They want to run trick plays",
    ],
    answerIndex: 2,
    explanation: "Bad offensive line play turns every game into survival mode.",
  },
  {
    category: "Baseball",
    difficulty: "easy",
    prompt: "What is a baseball 'walk-off'?",
    options: [
      "A player leaving mid-game",
      "A game-ending hit or play by the home team",
      "An argument with the umpire",
      "A batter refusing to swing all game",
    ],
    answerIndex: 1,
    explanation:
      "A walk-off ends the game immediately with the home team winning.",
  },
  {
    category: "Baseball",
    difficulty: "easy",
    prompt:
      "Which baseball statistic is the easiest way to sound smart at lunch while only half-knowing what you're talking about?",
    options: ["ERA", "OPS", "RBI", "Wins"],
    answerIndex: 1,
    explanation:
      "OPS is a classic 'I definitely listen to baseball podcasts' stat.",
  },
  {
    category: "Baseball",
    difficulty: "medium",
    prompt: "A player batting .300 is generally considered:",
    options: [
      "Terrible",
      "Solid to very good",
      "Automatically MVP",
      "Probably a pitcher",
    ],
    answerIndex: 1,
    explanation: "Hitting .300 is still widely viewed as excellent.",
  },
  {
    category: "Baseball",
    difficulty: "medium",
    prompt:
      "What’s the most accurate description of a baseball manager slowly walking to the mound?",
    options: [
      "Cardio",
      "A vibe shift",
      "A casual hello",
      "An invitation to chaos",
    ],
    answerIndex: 1,
    explanation:
      "The slow mound walk means the whole emotional temperature of the inning just changed.",
  },
  {
    category: "Sports Mix",
    difficulty: "medium",
    prompt:
      "Which sport has the greater ability to make you check your phone, zone out, then suddenly scream?",
    options: [
      "Football only",
      "Baseball only",
      "Both equally",
      "Neither, that’s basketball",
    ],
    answerIndex: 2,
    explanation:
      "Football and baseball both contain long stretches of 'nothing' followed by instant panic.",
  },
  {
    category: "Sports Mix",
    difficulty: "easy",
    prompt: "Which phrase feels more threatening in a sports bar?",
    options: [
      "It's only preseason",
      "He's day-to-day",
      "We need to establish the run",
      "Let's go to VAR",
    ],
    answerIndex: 1,
    explanation: "'Day-to-day' has destroyed hope across every fan base.",
  },
  {
    category: "Pop Culture",
    difficulty: "easy",
    prompt:
      "Which platform is most likely to convince you a 19-second clip is a major life event?",
    options: ["LinkedIn", "TikTok", "Google Sheets", "Weather app"],
    answerIndex: 1,
    explanation: "TikTok can turn anything into breaking emotional news.",
  },
  {
    category: "Pop Culture",
    difficulty: "medium",
    prompt:
      "If someone born in the early 2000s says a song 'healed them,' there is a strong chance they found it:",
    options: [
      "On a burned CD",
      "On a movie soundtrack from 2004",
      "On TikTok",
      "On AM radio",
    ],
    answerIndex: 2,
    explanation: "TikTok has become a chaotic cultural A&R department.",
  },
  {
    category: "Pop Culture",
    difficulty: "medium",
    prompt:
      "What is the universal meaning of 'I’m just going to watch one episode'?",
    options: [
      "A healthy boundary",
      "A lie",
      "A productivity method",
      "An athletic warmup",
    ],
    answerIndex: 1,
    explanation:
      "Nobody respects the 'one episode' lie, especially not streaming services.",
  },
  {
    category: "Pop Culture",
    difficulty: "easy",
    prompt: "Which phrase best describes the cultural role of a group chat?",
    options: [
      "Formal communication channel",
      "Digital democracy",
      "Emotional support system and comedy club",
      "A place where plans definitely happen",
    ],
    answerIndex: 2,
    explanation:
      "Mostly memes, mild crisis management, and exactly one useful message.",
  },
  {
    category: "Movies",
    difficulty: "easy",
    prompt: "Which movie snack has the strongest 'I deserve this' energy?",
    options: [
      "Plain pretzel",
      "Small water",
      "Popcorn the size of a toddler",
      "A single mint",
    ],
    answerIndex: 2,
    explanation:
      "A giant popcorn bucket is less a snack and more a declaration.",
  },
  {
    category: "Movies",
    difficulty: "medium",
    prompt: "Which movie-night friend is the greatest threat to peace?",
    options: [
      "The one who arrives early",
      "The one who guesses the ending in 12 minutes",
      "The one who brings snacks",
      "The one who says 'this soundtrack is actually great'",
    ],
    answerIndex: 1,
    explanation:
      "Nothing destroys a movie faster than someone acting like a human spoiler algorithm.",
  },
  {
    category: "Movies",
    difficulty: "medium",
    prompt: "What is the most honest review of a very long movie?",
    options: [
      "Tight 98 minutes",
      "Could have been an email",
      "Visually stunning and emotionally expensive",
      "Basically a short film",
    ],
    answerIndex: 2,
    explanation:
      "The best long movies still cost you emotionally, spiritually, and in bladder endurance.",
  },
  {
    category: "Movies",
    difficulty: "easy",
    prompt:
      "Which genre is most likely to make someone say, 'Wait… what actually happened?'",
    options: [
      "Sports documentary",
      "Animated musical",
      "Psychological thriller",
      "Romantic comedy",
    ],
    answerIndex: 2,
    explanation:
      "Psychological thrillers love ending with a trust exercise you did not ask for.",
  },
  {
    category: "Music",
    difficulty: "easy",
    prompt: "What is the strongest sign a song has become a personal anthem?",
    options: [
      "You know one word",
      "You save it once",
      "You suddenly become the main character on the commute",
      "You hear it in a store",
    ],
    answerIndex: 2,
    explanation: "A true anthem turns ordinary commuting into cinema.",
  },
  {
    category: "Music",
    difficulty: "medium",
    prompt:
      "Which is the most dangerous sentence before a road trip playlist starts?",
    options: [
      "I brought snacks",
      "Let me get the aux",
      "Traffic looks light",
      "We’ll only stop once",
    ],
    answerIndex: 1,
    explanation: "The aux can create memories or war.",
  },
  {
    category: "Music",
    difficulty: "medium",
    prompt: "A song qualifies as 'throwback' once it makes the group say:",
    options: [
      "Who is this?",
      "This came out five years ago?!",
      "Skip it",
      "My parents probably know this",
    ],
    answerIndex: 1,
    explanation: "Time moves weirdly once songs enter the nostalgia zone.",
  },
  {
    category: "Music",
    difficulty: "easy",
    prompt:
      "Which setting has the highest likelihood of turning one person into a full concert performer?",
    options: [
      "Library",
      "Elevator",
      "Car with friends",
      "Dentist waiting room",
    ],
    answerIndex: 2,
    explanation:
      "The car creates confidence levels unsupported by the actual vocal quality.",
  },
  {
    category: "Workplace Chaos",
    difficulty: "easy",
    prompt: "Which phrase causes the most immediate emotional damage at work?",
    options: [
      "Quick question",
      "Can you hop on a call?",
      "Per my last email",
      "Circle back",
    ],
    answerIndex: 2,
    explanation: "'Per my last email' is business warfare in one sentence.",
  },
  {
    category: "Workplace Chaos",
    difficulty: "medium",
    prompt: "What is the most suspicious sentence in office history?",
    options: [
      "No rush",
      "This should be easy",
      "We’re almost done",
      "Can everyone stay on for a minute?",
    ],
    answerIndex: 1,
    explanation:
      "'This should be easy' has launched many unnecessary adventures.",
  },
  {
    category: "Workplace Chaos",
    difficulty: "medium",
    prompt: "What is the adult version of hearing the school bell ring?",
    options: [
      "A microwave ding",
      "Slack notification",
      "The laptop fan stopping",
      "Calendar invite ending early",
    ],
    answerIndex: 3,
    explanation: "Nothing hits like an early meeting ending.",
  },
  {
    category: "Mixed Bag",
    difficulty: "easy",
    prompt: "Which situation feels most like a plot twist?",
    options: [
      "Your package arriving on time",
      "A meeting ending early",
      "Your sports bet hitting",
      "All of the above",
    ],
    answerIndex: 3,
    explanation: "Modern life has trained us to distrust good news.",
  },
  {
    category: "Mixed Bag",
    difficulty: "medium",
    prompt: "What is the best definition of 'delulu but employed'?",
    options: [
      "Unrealistic but optimistic",
      "Chronically offline",
      "Overqualified for snacks",
      "A strong LinkedIn presence",
    ],
    answerIndex: 0,
    explanation:
      "A little delusion is often just ambition with better branding.",
  },
  {
    category: "Mixed Bag",
    difficulty: "medium",
    prompt:
      "Which friend is most likely to win trivia despite acting confused the entire time?",
    options: [
      "The loud one",
      "The quiet one",
      "The one eating fries",
      "The one who says 'I’m bad at this'",
    ],
    answerIndex: 3,
    explanation: "The 'I’m bad at this' person is almost always lying.",
  },
  {
    category: "Final Round",
    difficulty: "hard",
    prompt: "What is the true champion skill for adult team-building games?",
    options: [
      "Raw intelligence",
      "Fast thumbs",
      "Being weird in a useful way",
      "Knowing sports box scores",
    ],
    answerIndex: 2,
    explanation:
      "The best players are usually just creative, quick, and slightly unhinged in a productive direction.",
  },
];

const topics: Record<string, string> = {
  Football: "sports",
  Baseball: "sports",
  "Sports Mix": "sports",
  "Pop Culture": "pop-culture",
  Movies: "screen",
  Music: "music",
  "Workplace Chaos": "office",
  "Mixed Bag": "general",
  "Final Round": "general",
};

export const AFTER_HOURS_BOARD: CustomBoard = {
  id: "after-hours-hot-takes",
  title: "After Hours: Hot Takes & Highlights",
  description:
    "Sports, screens, soundtracks, and spectacularly debatable takes. A tongue-in-cheek party quiz with punchline answers and plenty of friendly arguments.",
  category: "After-hours party quiz",
  coverStyle: { color: "#ff7448", icon: "trophy" },
  questions: questions.map((q, order) => ({
    id: `after-hours-${order + 1}`,
    type: "multiple-choice",
    prompt: q.prompt,
    answers: [...q.options],
    correctAnswer: q.answerIndex,
    explanation: q.explanation,
    difficulty: q.difficulty,
    topic: topics[q.category],
    timer: 20,
    scoreMode: "casual",
    order,
  })),
  settings: {
    defaultTimer: 20,
    scoreMode: "casual",
    randomizeAnswers: true,
    showCorrectAnswer: true,
    showExplanation: true,
    leaderboardFrequency: "every-5",
  },
  createdAt: "2026-10-14T12:00:00.000Z",
  updatedAt: "2026-10-14T12:00:00.000Z",
  version: 1,
};
