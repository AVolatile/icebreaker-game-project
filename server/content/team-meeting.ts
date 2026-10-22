import type { GameId } from "../../shared/types.js";
import type { Question } from "../content.js";

export interface PackPrompt extends Question {
  botResponses?: string[];
  sceneDirection?: string;
}

// A complete override: these prompts never enter another pack's fallback pools.
export const TEAM_MEETING_CONTENT: Record<GameId, PackPrompt[]> = {
  hotwire: [
    {
      title:
        "Who do the Patriots face in their 2026 Week 7 Thursday night game?",
      options: ["Bills", "Bears", "Jets", "Dolphins"],
      answer: 1,
      explanation: "New England's Week 7 Thursday night opponent is Chicago.",
      pack: "team-meeting",
    },
    {
      title: "Which teams made the 2026 World Series?",
      options: [
        "Yankees and Dodgers",
        "Guardians and Brewers",
        "Rays and Brewers",
        "Rays and Dodgers",
      ],
      answer: 2,
      explanation:
        "The 2026 World Series matchup is Tampa Bay versus Milwaukee.",
      pack: "team-meeting",
    },
    {
      title: "Milwaukee swept which team to win the 2026 NL pennant?",
      options: ["Padres", "Braves", "Cubs", "Dodgers"],
      answer: 3,
      explanation: "Milwaukee advanced by sweeping Los Angeles.",
      pack: "team-meeting",
    },
    {
      title:
        "Which Series 7 position can theoretically produce unlimited loss?",
      options: [
        "Long put",
        "Long call",
        "Covered call",
        "Uncovered short call",
      ],
      answer: 3,
      explanation:
        "An uncovered short call has theoretically unlimited upside risk.",
      pack: "team-meeting",
    },
    {
      title:
        "A municipal issuer wants the right to retire bonds early. What feature lets them do it?",
      options: [
        "Conversion",
        "Put provision",
        "Call provision",
        "Preemptive right",
      ],
      answer: 2,
      explanation:
        "A call provision allows the issuer to redeem bonds before maturity.",
      pack: "team-meeting",
    },
    {
      title:
        "As an option approaches expiration, what generally happens to its time value?",
      options: [
        "It doubles",
        "It becomes intrinsic value",
        "It erodes",
        "FINRA decides",
      ],
      answer: 2,
      explanation:
        "Time decay reduces an option's time value as expiration approaches.",
      pack: "team-meeting",
    },
    {
      title:
        "Before pumpkins became the Halloween standard, jack-o'-lanterns were commonly carved from what?",
      options: ["Potatoes", "Apples", "Turnips", "Coconuts"],
      answer: 2,
      explanation:
        "Turnips were commonly carved in earlier Halloween traditions.",
      pack: "team-meeting",
    },
    {
      title:
        "You hear someone yell 'FORE!' What hobby should immediately concern you?",
      options: ["Pickleball", "Baseball", "Golf", "Bowling"],
      answer: 2,
      explanation: "Fore is the traditional warning shout in golf.",
      pack: "team-meeting",
    },
  ],
  "room-temperature": [
    {
      title: "Halloween candy draft. You have the first pick.",
      options: ["Reese's", "Twix", "Kit Kat", "Sour Patch Kids"],
      pack: "team-meeting",
    },
    {
      title: "Football is on. What food is carrying the night?",
      options: ["Wings", "Pizza", "Nachos", "Buffalo chicken dip"],
      pack: "team-meeting",
    },
    {
      title: "Pick the true Series 7 final boss.",
      options: ["Options", "Munis", "Margin", "Taxation"],
      pack: "team-meeting",
    },
    {
      title: "You unexpectedly get one completely free hour.",
      options: ["Pickleball", "Golf", "Gym", "Absolutely nothing"],
      pack: "team-meeting",
    },
    {
      title: "Pick your sports-fan personality.",
      options: [
        "Quiet analyst",
        "Screaming coach",
        "Fantasy-stat goblin",
        "Just here for food",
      ],
      pack: "team-meeting",
    },
    {
      title: "Thanksgiving plate gets ONE first-round pick.",
      options: ["Turkey", "Stuffing", "Mashed potatoes", "Mac and cheese"],
      pack: "team-meeting",
    },
    {
      title: "Your golf ball disappears into the woods. Your official ruling?",
      options: [
        "Search party",
        "Drop another",
        "Blame the club",
        "It lives there now",
      ],
      pack: "team-meeting",
    },
    {
      title: "Patriots-Bears is on. What are we actually rooting for?",
      options: ["Patriots", "Bears", "Fantasy points", "Maximum chaos"],
      pack: "team-meeting",
    },
  ],
  sellout: [
    {
      title:
        "Invent and pitch a Series 7 study guide that physically prevents you from choosing the wrong answer.",
      pack: "team-meeting",
      botResponses: [
        "Gut Check — The study guide that slaps the wrong answer out of your hand.",
        "Pass Guard — Four choices enter. Only one gets past the bouncer.",
        "Nope Notes — Your pencil now has a second opinion.",
      ],
    },
    {
      title:
        "Sell a fantasy-football app that personally apologizes when someone on your bench scores 40 points.",
      pack: "team-meeting",
      botResponses: [
        "Bench Regrets — Your substitute scored forty. We brought tissues.",
        "Sorry, Coach — Push notifications with handwritten apologies.",
        "Hindsight Premium — Yesterday’s perfect lineup, delivered today.",
      ],
    },
    {
      title:
        "Launch a premium Halloween service for adults who remembered they need a costume 45 minutes before the party.",
      pack: "team-meeting",
      botResponses: [
        "Costume Ambulance — From plain clothes to suspicious vampire in twelve minutes.",
        "Last Minute Legend — A cape, a hat, and a completely invented backstory.",
        "Boo Rush — Emergency costumes. Extra charges for convincing excuses.",
      ],
    },
    {
      title: "Sell a golf ball that texts you after you lose it in the woods.",
      pack: "team-meeting",
      botResponses: [
        "Finders Beepers — Your golf ball sends its location and a strongly worded complaint.",
        "Wood You Look — The ball that texts, “Warmer. Warmer. Wrong tree.”",
        "Lost & Fore — Unlimited texts. Absolutely no signal in that one bush.",
      ],
    },
    {
      title: "Create the world's unnecessarily advanced pickleball paddle.",
      pack: "team-meeting",
      botResponses: [
        "Paddle Royale — Built-in air conditioning for your backhand.",
        "Dink Tank — A pickleball paddle with a snack compartment and no off switch.",
        "Kitchen Commander — Twelve sensors. Still cannot keep you out of the kitchen.",
      ],
    },
    {
      title:
        "Launch a subscription box containing only the objectively best pieces of Halloween candy. Convince everyone your choices are correct.",
      pack: "team-meeting",
      botResponses: [
        "Candy Court — Reese’s, Twix, and the right to overrule everyone else.",
        "Treat Elite — A candy subscription with absolutely no mystery raisins.",
        "First Pick Club — The good candy arrives before your family finds it.",
      ],
    },
    {
      title:
        "Pitch an emotional-support product for sports fans watching the final two minutes of a close game.",
      pack: "team-meeting",
      botResponses: [
        "Clutch Cushion — A pillow that absorbs fourth-quarter screaming.",
        "Two Minute Blanket — Keeps you warm when your team goes ice cold.",
        "Fan First Aid — A stress ball and someone to say, “That was definitely a foul.”",
      ],
    },
    {
      title:
        "Invent a World Series stadium food that absolutely should not exist, then convince us it belongs in every ballpark.",
      pack: "team-meeting",
      botResponses: [
        "Grand Slamwich — A hot dog inside a pretzel inside a tiny batting helmet.",
        "Seventh-Inning Sundae — Ice cream, nachos, and a waiver you can eat.",
        "Walk-Off Waffle — A waffle taco full of ballpark snacks. No rain checks.",
      ],
    },
  ],
  "caption-this": [
    {
      title: "Coach has changed the playbook.",
      pack: "team-meeting",
      scene: 15,
      sceneDirection:
        "A football coach on the sideline holding a giant Series 7 textbook instead of a playbook.",
      botResponses: [
        "We’re running the covered-call formation.",
        "Fourth down. Eighty-six questions to go.",
        "The audible is apparently municipal bonds.",
      ],
    },
    {
      title: "Nobody tell him what the concession stand sells.",
      pack: "team-meeting",
      scene: 16,
      sceneDirection:
        "A baseball mascot secretly eating a hot dog in the dugout.",
      botResponses: [
        "The mascot has eaten the competition.",
        "This is strictly a dugout matter.",
        "Somewhere, a concession stand has filed a missing-hot-dog report.",
      ],
    },
    {
      title: "Camera on was a tactical error.",
      pack: "team-meeting",
      scene: 17,
      sceneDirection:
        "One person wearing an absurd full Halloween costume on a video call while everyone else looks normal.",
      botResponses: [
        "I thought you said costume-optional, not costume-discouraged.",
        "The camera has chosen violence.",
        "I can explain the cape. The fog machine is a longer story.",
      ],
    },
    {
      title: "He swears it landed right here.",
      pack: "team-meeting",
      scene: 18,
      sceneDirection:
        "A golfer searching the woods while the golf ball visibly hides behind a tree.",
      botResponses: [
        "The ball has entered witness protection.",
        "It’s not lost. It’s taking a personal day.",
        "That tree is definitely covering for someone.",
      ],
    },
    {
      title: "There was a disagreement about the kitchen.",
      pack: "team-meeting",
      scene: 19,
      sceneDirection:
        "Two pickleball paddles arguing dramatically at the kitchen line.",
      botResponses: [
        "They were told to stay out of the kitchen. They took it personally.",
        "One more dink and this becomes a cooking show.",
        "The kitchen line has requested a mediator.",
      ],
    },
    {
      title: "Negotiations have broken down.",
      pack: "team-meeting",
      scene: 20,
      sceneDirection:
        "One Reese's cup remains in a giant candy bowl while several hands slowly reach toward it.",
      botResponses: [
        "One cup. Four hands. Zero treaties.",
        "The last Reese’s has retained legal counsel.",
        "We have reached the peanut-butter portion of negotiations.",
      ],
    },
    {
      title: "Thanksgiving priorities.",
      pack: "team-meeting",
      scene: 21,
      sceneDirection:
        "A turkey intensely studying a fantasy-football lineup before Thanksgiving dinner.",
      botResponses: [
        "The turkey is starting two running backs and avoiding all sides.",
        "Thanksgiving dinner has been delayed by a waiver claim.",
        "He drafted the stuffing in the first round.",
      ],
    },
    {
      title: "Question 84 has entered the chat.",
      pack: "team-meeting",
      scene: 22,
      sceneDirection:
        "A Series 7 test-taker surrounded by floating CALLS, PUTS, MUNIS, MARGIN, and YTM notes looking completely defeated.",
      botResponses: [
        "The calls are coming from inside the textbook.",
        "I have intrinsic value. I just cannot calculate it.",
        "Question 84 has requested another emotional-support snack.",
      ],
    },
  ],
  "odd-one-in": [
    {
      title: "Which ridiculous food fact is botanically true?",
      options: [
        "Strawberries are berries",
        "Bananas are berries",
        "Pineapples grow on trees",
        "Peanuts are nuts",
      ],
      answer: 1,
      explanation: "Botanically, bananas qualify as berries.",
      pack: "team-meeting",
    },
    {
      title: "Which animal fact is real?",
      options: [
        "Sharks sleep upside down",
        "Penguins have knees outside their body",
        "Octopuses have three hearts",
        "Dolphins breathe underwater",
      ],
      answer: 2,
      explanation: "Octopuses have three hearts.",
      pack: "team-meeting",
    },
    {
      title: "Which Halloween fact is actually true?",
      options: [
        "Candy corn was invented in 1992",
        "Pumpkins glow naturally after midnight",
        "Early jack-o'-lanterns were carved from turnips",
        "Halloween originated in Florida",
      ],
      answer: 2,
      explanation: "Turnips were used for early jack-o'-lantern traditions.",
      pack: "team-meeting",
    },
    {
      title: "Which candy fact is real?",
      options: [
        "Twix originally contained peanuts",
        "Snickers was named for a baseball player",
        "M&M refers to Mars and Murrie",
        "Kit Kats were invented for astronauts",
      ],
      answer: 2,
      explanation: "M&M refers to Mars and Murrie.",
      pack: "team-meeting",
    },
    {
      title: "Which old-school golf fact is real?",
      options: [
        "Golf balls were once wooden cubes",
        "Courses originally had 23 holes",
        "Some early golf balls were leather stuffed with feathers",
        "Golf clubs were originally called bats",
      ],
      answer: 2,
      explanation:
        "Feather-filled leather golf balls, known as featheries, were historically used.",
      pack: "team-meeting",
    },
    {
      title: "Which baseball fact is real?",
      options: [
        "Bases were originally circular",
        "Pitchers once stood behind second base",
        "A baseball uses 108 double stitches",
        "Home plate was originally blue",
      ],
      answer: 2,
      explanation: "A regulation baseball has 108 double stitches.",
      pack: "team-meeting",
    },
    {
      title: "Which Series 7 statement is unfortunately very real?",
      options: [
        "Long calls have unlimited loss",
        "Bonds never fluctuate",
        "Options cannot expire worthless",
        "An uncovered short call can have unlimited loss",
      ],
      answer: 3,
      explanation:
        "An uncovered short call carries theoretically unlimited loss.",
      pack: "team-meeting",
    },
    {
      title: "Which food fact sounds fake but isn't?",
      options: [
        "Cashews grow attached to a fruit called a cashew apple",
        "Marshmallows grow underground",
        "Popcorn is a type of nut",
        "Chocolate comes from coffee beans",
      ],
      answer: 0,
      explanation: "Cashew nuts grow attached to the cashew apple.",
      pack: "team-meeting",
    },
  ],
  "scribble-shift": [
    {
      title: "A quarterback trying to take the Series 7 exam",
      pack: "team-meeting",
    },
    {
      title: "A golf ball hiding from its owner in the woods",
      pack: "team-meeting",
    },
    {
      title: "A pickleball paddle on a tropical vacation",
      pack: "team-meeting",
    },
    {
      title: "The last piece of Halloween candy escaping the bowl",
      pack: "team-meeting",
    },
    {
      title: "A turkey coaching an NFL team",
      pack: "team-meeting",
    },
    {
      title: "A hot dog celebrating a walk-off home run",
      pack: "team-meeting",
    },
    {
      title: "Santa attempting a hole-in-one",
      pack: "team-meeting",
    },
    {
      title:
        "A fantasy-football manager watching the player on their bench score 40 points",
      pack: "team-meeting",
    },
  ],
};
