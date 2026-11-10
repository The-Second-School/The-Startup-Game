// All game words and numbers live here. Change text or balance without touching the engine.
// Every effect is a plain plus or minus. {team} and {product} are filled in at reveal.

import type { AuctionTicket, RoleId, SceneId, Step } from './types';

// ---------- Scoring ----------
export const START = { customers: 5, happiness: 5, coins: 200 };
export const METER_MAX = 50;
export const SUCCESS_DIVISOR = 280;     // Success = (Customers + Happiness) x Coins / 280, capped at 100 (see docs/REVIEW.md)
export const TALK_MS = 60_000;
export const PAIR_TALK_MS = 90_000;
export const PITCH_MS = 45_000;

export const STAGES = [
  { id: 'stall', name: 'Tiny Stall', min: 0, max: 25 },
  { id: 'shop', name: 'Busy Shop', min: 26, max: 50 },
  { id: 'office', name: 'Big Office', min: 51, max: 75 },
  { id: 'tower', name: 'Sky Tower', min: 76, max: 100 },
] as const;
export type StageId = (typeof STAGES)[number]['id'];

// ---------- Colours ----------
// Team colours: flat, Duolingo-like. Each has 5 shades (light -> dark) for member avatars and layered borders.
export const TEAM_COLORS = [
  { name: 'Red', base: '#FF4B4B', shades: ['#FFB3B3', '#FF7A7A', '#FF4B4B', '#E03535', '#B82424'] },
  { name: 'Blue', base: '#1CB0F6', shades: ['#A6E0FC', '#5CC8F9', '#1CB0F6', '#1395D4', '#0C74A8'] },
  { name: 'Green', base: '#58CC02', shades: ['#BDEB8F', '#89DD45', '#58CC02', '#46A302', '#347A01'] },
  { name: 'Purple', base: '#CE82FF', shades: ['#EBCBFF', '#DCA6FF', '#CE82FF', '#B05EE8', '#8C3FC4'] },
  { name: 'Orange', base: '#FF9600', shades: ['#FFD199', '#FFB44D', '#FF9600', '#E07F00', '#B36500'] },
  { name: 'Pink', base: '#FF6FB5', shades: ['#FFC4E1', '#FF97C9', '#FF6FB5', '#E5539A', '#BF3A7B'] },
] as const;

// Number of distinct avatar shapes in src/ui/avatar.tsx. A team's avatarSeed % AVATAR_SHAPES picks its shape.
export const AVATAR_SHAPES = 20;

// Option colours + shapes (shape so colour-blind kids are fine)
export const OPTION_STYLES = [
  { name: 'Red', base: '#FF4B4B', dark: '#D93636', shape: 'circle' },
  { name: 'Blue', base: '#1CB0F6', dark: '#1290CC', shape: 'square' },
  { name: 'Green', base: '#58CC02', dark: '#45A302', shape: 'triangle' },
  { name: 'Purple', base: '#CE82FF', dark: '#A963DB', shape: 'star' },
] as const;

// ---------- Roles ----------
export const ROLES: Record<RoleId, { name: string; icon: string; job: string }> = {
  ceo: { name: 'CEO', icon: '👑', job: 'Has the final say after the team talks' },
  money: { name: 'Money Manager', icon: '💰', job: 'Watches coins and bids in the auction' },
  lock: { name: 'Lock Master', icon: '🔒', job: 'Taps the team’s choice on the big screen and locks it' },
  speaker: { name: 'Speaker', icon: '🎤', job: 'Answers at Mic Time and gives the final pitch' },
  time: { name: 'Timekeeper', icon: '⏱️', job: 'Watches the timer and makes sure every teammate shares one idea' },
};
// Which roles a team of N needs, in fill order. Team of 3: CEO is also Money Manager.
export const ROLE_PLAN: Record<number, RoleId[][]> = {
  3: [['ceo', 'money'], ['lock'], ['speaker']],
  4: [['ceo'], ['money'], ['lock'], ['speaker']],
  5: [['ceo'], ['money'], ['lock'], ['speaker'], ['time']],
};

// ---------- Products (10 on the wheel) ----------
export interface Product {
  id: string;
  name: string;
  icon: string;
  does: string;
  unit: string;
  hint: string;
  bestPrice: number;
  color: string;
}
export const PRODUCTS: Product[] = [
  { id: 'tiffingo', name: 'TiffinGo', icon: '🍱', does: 'Hot lunch delivered to school', unit: 'per tiffin', hint: 'Vada pav costs ₹20. A full thali costs ₹80.', bestPrice: 40, color: '#FF9600' },
  { id: 'cycleshare', name: 'CycleShare', icon: '🚲', does: 'Rent a cycle by the hour', unit: 'per hour', hint: 'An auto ride costs ₹30.', bestPrice: 20, color: '#1CB0F6' },
  { id: 'mathmagic', name: 'MathMagic', icon: '🧮', does: 'A game that makes maths fun', unit: 'per month', hint: 'A comic book costs ₹50.', bestPrice: 50, color: '#CE82FF' },
  { id: 'farmfriend', name: 'FarmFriend', icon: '🌾', does: 'Tells farmers when to water crops', unit: 'per month', hint: 'It saves a farmer ₹500 a month. Farmers watch every rupee, so ask for a small slice.', bestPrice: 60, color: '#58CC02' },
  { id: 'petpal', name: 'PetPal', icon: '🐶', does: 'Walks and feeds your pet', unit: 'per walk', hint: 'A plate of samosa costs ₹30.', bestPrice: 30, color: '#FF86D0' },
  { id: 'homeworkbuddy', name: 'HomeworkBuddy', icon: '🤖', does: 'A robot that reminds you about homework', unit: 'per month', hint: 'Tuition costs ₹500 a month. Your robot only reminds, so charge much less.', bestPrice: 80, color: '#00CD9C' },
  { id: 'sipbottle', name: 'SipBottle', icon: '💧', does: 'A bottle that reminds you to drink water', unit: 'one bottle', hint: 'A normal bottle costs ₹80.', bestPrice: 100, color: '#1CB0F6' },
  { id: 'roombot', name: 'RoomBot', icon: '🧹', does: 'A robot that tidies your room', unit: 'per month', hint: 'A big pizza costs ₹300. Would you pay a third of that to never tidy up?', bestPrice: 90, color: '#FF4B4B' },
  { id: 'bookswap', name: 'BookSwap', icon: '📚', does: 'Swap old books with friends', unit: 'per swap', hint: 'A new storybook costs ₹200, but a swap is just a small favour between friends. Kids only have pocket money.', bestPrice: 10, color: '#FF9600' },
  { id: 'partypal', name: 'PartyPal', icon: '🎂', does: 'Plans your birthday party', unit: 'per party', hint: 'A birthday cake costs ₹500. Planning is a nice extra, not the cake.', bestPrice: 70, color: '#FF6FB5' },
];
export const productById = (id: string | null) => PRODUCTS.find(p => p.id === id) ?? null;

// ---------- Questions ----------
export interface Option {
  text: string;
  icon: string;
  coins: number;          // negative = cost, positive = gain
  customers: number;
  happiness: number;
  trap?: boolean;         // rAIvan's trick (shown with 😈 only after reveal)
  story: string;
  label: string;          // short label for the story strip
  // Word of mouth: happiness at or above `ifHappinessAtLeast` gives customers = `customers`, else `elseCustomers`
  ifHappinessAtLeast?: number;
  elseCustomers?: number;
  elseStory?: string;
  bonus?: string;         // extra rule shown after reveal
}
export interface Question {
  id: string;
  act: number;
  title: string;          // the big question
  sub?: string;           // short line under it
  boltIntro: string;      // Bolt line during the small intro animation
  introAnim: string;      // key for the small question intro animation
  options: [Option, Option, Option, Option];
}

export const QUESTIONS: Record<string, Question> = {
  a1q1: {
    id: 'a1q1', act: 1, introAnim: 'magnifier',
    title: 'How will you find out what people really need?',
    boltIntro: 'Big secret: the best startups first find out what people need. How will you find out?',
    options: [
      { text: 'Ask 10 people at the market', icon: '🗣️', coins: -10, customers: 3, happiness: 7, label: 'Asked 10 people', story: '{team} asked 10 real people. Now they know exactly what Techistan wants! 💡' },
      { text: 'Guess it at home', icon: '🏠', coins: 0, customers: 3, happiness: 2, label: 'Guessed at home', story: '{team} guessed at home. Some guesses were right... some were not 🤔' },
      { text: 'Buy rAIvan’s “Secret Wish List”', icon: '📜', coins: -10, customers: 8, happiness: -5, trap: true, label: 'Bought rAIvan’s list', story: 'rAIvan’s list was FAKE! {team} made things nobody really wanted 😱' },
      { text: 'Put an idea box at school', icon: '📦', coins: -20, customers: 6, happiness: 5, label: 'Idea box at school', story: '{team}’s idea box filled up with 100 notes! 📦' },
    ],
  },
  a1q2: {
    id: 'a1q2', act: 1, introAnim: 'spybot',
    title: 'rAIvan’s spy-bot wants to peek at your idea notebook!',
    sub: 'What do you do?',
    boltIntro: 'Uh oh! A sneaky spy-bot is knocking at your door. It wants to see your ideas!',
    options: [
      { text: 'Join rAIvan’s team for coins', icon: '🤝', coins: 20, customers: 0, happiness: -10, trap: true, label: 'Joined rAIvan', story: 'rAIvan paid {team}... then bossed them around all day 😩' },
      { text: 'Show it, he looks friendly', icon: '📖', coins: 0, customers: -7, happiness: 0, label: 'Showed the notebook', story: 'Oops! The spy-bot copied {team}’s idea and zoomed away 🏃' },
      { text: 'Lock it in a strong box', icon: '🔒', coins: -10, customers: 2, happiness: 2, label: 'Locked the notebook', story: '{team} bought a strong box with a lock. The ideas are safe! 🔒' },
      { text: 'Tell everyone your idea first!', icon: '📢', coins: -20, customers: 7, happiness: 1, label: 'Told everyone first', story: '{team} printed flyers for the whole town. Everyone knows who had the idea first! 📢' },
    ],
  },
  a2q1: {
    id: 'a2q1', act: 2, introAnim: 'toolbox',
    title: 'Time to build the first version of your product. How?',
    boltIntro: 'You know what people need. Now let’s build it! But how?',
    options: [
      { text: 'Build small, test with 5 friends', icon: '🧪', coins: -20, customers: 3, happiness: 9, label: 'Tested with friends', story: '{team}’s 5 friends found 3 problems. All fixed! 🔧', bonus: '+5 seconds in Bug Smash' },
      { text: 'Copy rAIvan’s design', icon: '📋', coins: 0, customers: 6, happiness: -8, trap: true, label: 'Copied rAIvan', story: 'People spotted the copy right away. “Hey, that’s rAIvan’s!” 😬' },
      { text: 'Build super fast, launch tomorrow', icon: '⚡', coins: 0, customers: 8, happiness: -2, label: 'Built super fast', story: '{team} launched in one night! A bit wobbly though 🫨' },
      { text: 'Add 20 cool features', icon: '✨', coins: -20, customers: 6, happiness: 0, label: 'Added 20 features', story: '20 features! Customers are a little confused about which button does what 🤯' },
    ],
  },
  a3q1: {
    id: 'a3q1', act: 3, introAnim: 'megaphone',
    title: 'Your product works! How will Techistan hear about it?',
    sub: 'Tip: happy customers love to talk. Unhappy ones stay quiet.',
    boltIntro: 'Your product is ready... but nobody knows it exists! Let’s make some noise!',
    options: [
      { text: 'Posters all over Techistan', icon: '🪧', coins: -20, customers: 9, happiness: 0, label: 'Posters everywhere', story: '{team}’s posters are on every wall in Techistan! 🪧' },
      { text: 'Ask happy customers to tell friends', icon: '💬', coins: 0, customers: 10, happiness: 0, ifHappinessAtLeast: 20, elseCustomers: 3, label: 'Word of mouth', story: 'Happy customers told everyone! The news spread super fast 🔥', elseStory: 'Customers weren’t happy enough to talk about {team} yet 😐' },
      { text: 'Buy 100 fake 5-star reviews', icon: '⭐', coins: -10, customers: 12, happiness: -10, trap: true, label: 'Bought fake reviews', story: 'The Techistan Times found out the reviews were fake! 📰😱' },
      { text: 'Free samples at the school gate', icon: '🎁', coins: -40, customers: 6, happiness: 5, label: 'Free samples', story: 'Kids lined up at the school gate for free samples! 🎁' },
    ],
  },
  a4q2: {
    id: 'a4q2', act: 4, introAnim: 'sharks',
    title: 'Investors want to give you money! Who do you pick?',
    sub: 'Investors give money, but they always want something back.',
    boltIntro: 'Look at the harbour! Investors have arrived with bags of coins!',
    options: [
      { text: 'Friendly Dolphin', icon: '🐬', coins: 50, customers: 0, happiness: 3, label: 'Friendly Dolphin', story: 'The Dolphin gave {team} coins AND great advice 🐬' },
      { text: 'rAIvan Ventures', icon: '💼', coins: 120, customers: -12, happiness: -8, trap: true, label: 'rAIvan Ventures', story: 'rAIvan gave lots of coins... then sold {team}’s customer secrets! 😡' },
      { text: 'Big Shark', icon: '🦈', coins: 100, customers: 0, happiness: -6, label: 'Big Shark', story: 'The Big Shark wants results NOW. The team is stressed 😰' },
      { text: 'Mama-Mami Fund', icon: '👨‍👩‍👧', coins: 30, customers: 4, happiness: 0, label: 'Mama-Mami Fund', story: 'Mama-Mami gave coins and told the whole family! 👨‍👩‍👧' },
    ],
  },
  a5q1: {
    id: 'a5q1', act: 5, introAnim: 'copier',
    title: 'rAIvan copied ALL your products and sells them at half price!',
    sub: 'How do you fight back?',
    boltIntro: 'rAIvan is furious! His copy machine is printing fake products everywhere!',
    options: [
      { text: 'Give old customers a loyalty card', icon: '💳', coins: -20, customers: 6, happiness: 5, label: 'Loyalty cards', story: 'Old customers love their loyalty cards and stayed! 💳' },
      { text: 'Cut our price to half too', icon: '✂️', coins: 0, customers: 6, happiness: -2, label: 'Cut price', story: 'Cheaper! More customers... but every sale earns half as much 🪙' },
      { text: 'Say his copy is dangerous (it isn’t)', icon: '🤥', coins: 0, customers: 8, happiness: -10, trap: true, label: 'Told a lie', story: 'People found out it was a lie. Not cool! 🙅' },
      { text: 'Make ours even better', icon: '💪', coins: -40, customers: 3, happiness: 10, label: 'Made it better', story: '{team}’s product got SO good, rAIvan’s copy looks silly now ✨' },
    ],
  },
};

// ---------- Bug Smash ----------
export const BUG = {
  seconds: 15,
  testedBonusSeconds: 5,
  testedOption: { qId: 'a2q1', index: 0 },
  tiers: [
    { min: 0, max: 9, happiness: -5, text: 'The bugs won this time' },
    { min: 10, max: 19, happiness: 0, text: 'Phew! Bugs under control' },
    { min: 20, max: 29, happiness: 4, text: 'Bug buster! Customers are happy' },
    { min: 30, max: 999, happiness: 7, text: 'BUG LEGEND! Not a single bug left' },
  ],
};

// ---------- Price It Right ----------
export const PRICE = {
  min: 10, max: 100, step: 10,
  tiers: [
    { off: 0, coins: 80, happiness: 3, verdict: 'right' as const },
    { off: 10, coins: 60, happiness: 0, verdict: 'close' as const },
    { off: 20, coins: 40, happiness: 0, verdict: 'close' as const },
    { off: 999, coins: 20, happiness: 0, verdict: null },
  ],
  text: {
    right: 'Perfect price! A happy crowd is buying',
    close: 'Nearly right! Good sales 👍',
    high: 'Too expensive! Few people bought, so the cash box stayed small 🚶',
    low: 'So cheap the shop is packed... but each sale earns almost nothing',
  },
};

// ---------- Auction ----------
export const AUCTION_TICKETS: AuctionTicket[] = [
  { id: 'cartoon', title: 'Cartoon Channel ad', icon: '🎬', deltas: { coins: 0, customers: 10, happiness: 0 } },
  { id: 'cricket', title: 'A cricket star’s selfie with your product', icon: '🏏', deltas: { coins: 0, customers: 6, happiness: 6 } },
  { id: 'tv', title: 'Techistan TV show', icon: '📺', deltas: { coins: 0, customers: 8, happiness: 3 } },
];
export const AUCTION_OPEN = 20;
export const AUCTION_STEP = 10;
// A team can never bid below this many coins left, so nobody goes broke and drops out of the race.
export const AUCTION_RESERVE = 50;

// ---------- Mega Order (team-up) ----------
export const MEGA = {
  prize: { customers: 20, coins: 100 },
  options: [
    { text: 'Share equally', icon: '🤝', detail: '10 customers + 50 coins each' },
    { text: 'We take more', icon: '😏', detail: 'Us 14 + 70 coins, them 6 + 30' },
    { text: 'You take more', icon: '🎁', detail: 'Us 6 + 30 coins, them 14 + 70' },
    { text: 'No deal, we go alone', icon: '🚶', detail: 'No shared order' },
  ] as const,
  equal: { customers: 10, coins: 50, happiness: 5 },
  big: { customers: 14, coins: 70 },
  small: { customers: 6, coins: 30 },
  noDeal: { customers: 3 },
  solo: { customers: 10, coins: 50 },   // odd team out: a fair solo order, about as good as a perfect team-up
  broken: { happiness: -3 },
  text: {
    equal: 'Best Partners! They shared fairly and the Festival was a hit!',
    split: 'Deal done! They agreed on who gets more.',
    nodeal: 'No deal. Each team did a small part alone.',
    solo: 'No partner this time: {team} got its own mini order from the Mayor!',
    broken: 'Deal broken! They couldn’t agree, so the Mayor gave the order to someone else.',
  },
  combos: (a: string, b: string) => `${a} + ${b} = Super Combo!`,
};

// ---------- Customer Mood ----------
// Plain plus/minus. Never shown as maths on screen.
export const MOOD = {
  rules: [
    { when: 'happyBehind10', customers: -5 },
    { when: 'happyBehind1', customers: -2 },
    { when: 'happyAhead10', customers: 3 },
  ],
  text: {
    left: (n: number) => `${n} customers got bored and left`,
    joined: (n: number) => `${n} happy customers brought their friends!`,
    same: 'Customers are sticking around',
  },
};

// ---------- Mic Time ----------
export const MIC_QUESTIONS: Record<number, string> = {
  1: 'Why is asking real people better than guessing?',
  2: 'Why is testing with 5 friends better than adding 20 features?',
  3: 'Is it okay to buy fake reviews? Why not?',
  4: 'You sold a tiffin for ₹50 and it cost ₹30 to make. How much profit did you make? What does profit mean?',
  5: 'Why do partners have to be fair with each other?',
};

// ---------- Acts & the Startup Recipe ----------
export const RECIPE = [
  { act: 1, icon: '🔍', name: 'Problem' },
  { act: 2, icon: '🛠️', name: 'Build' },
  { act: 3, icon: '📣', name: 'Launch' },
  { act: 4, icon: '💰', name: 'Money' },
  { act: 5, icon: '🚀', name: 'Grow' },
  { act: 6, icon: '🏆', name: 'Show Day' },
];

// Bolt's narration beats for each big scene. The scene component animates one beat at a time.
export const SCENES: Record<SceneId, { title: string; beats: string[] }> = {
  welcome: {
    title: 'Welcome to Techistan!',
    beats: [
      'Hi! I’m Bolt, the friendliest robot in Techistan! 👋',
      'Techistan is a city full of ideas. Flying buses, singing streetlights, robot chaiwalas!',
      'Today the Mayor has a big announcement...',
      '“The Startup Festival begins! Build a startup in 5 steps and win the Golden Trophy!”',
      'But wait... who is THAT?! 😱',
      'It’s rAIvan, the 10-headed AI! He wants every startup to copy him, cheat, or sell to him.',
      'Don’t worry. Smart, honest startups always beat him. Let’s build yours!',
    ],
  },
  howto: {
    title: 'How to play',
    beats: [
      'Your startup has 3 things: 👥 Customers, 😊 Happiness and 🪙 Coins.',
      'Success needs ALL three. Lots of happy customers AND money in the box! Unhappy customers walk away, so keep them smiling.',
      'As you grow, your startup grows too: Tiny Stall, Busy Shop, Big Office, Sky Tower!',
      'Every question: talk with your team, then your Lock Master taps your choice and locks it 🔒',
      'When everyone has locked, I reveal what happened to each team, one by one! Sometimes I pick a team for Mic Time too 🎤',
      'Careful: some options are rAIvan’s tricks. They look great... but are they? 😈',
    ],
  },
  act1: {
    title: 'Step 1: The Problem 🔍',
    beats: [
      'Every great startup starts with a PROBLEM.',
      'Like this kid. Cold lunch AGAIN. Yuck! 🥶',
      'One day she thought: “What if hot lunch came to school?” 💡 That’s how a startup is born!',
      'You have your products. But WHO needs them? And what do they really want?',
      'Step 1 of the Startup Recipe: find the problem!',
    ],
  },
  act2: {
    title: 'Step 2: Build it 🛠️',
    beats: [
      'Here’s what happened last time... (story so far)',
      'You know what people need. Now it’s time to BUILD!',
      'Welcome to the Techistan Workshop. Hammers, screws and a lot of glue! 🔨',
      'But psst... rAIvan’s Bug Head is hiding in the corner. He loves breaking things',
      'Step 2 of the Startup Recipe: build version 1!',
    ],
  },
  act3: {
    title: 'Step 3: Launch it 📣',
    beats: [
      'Here’s what happened last time... (story so far)',
      'Your product works! But look at your shop... empty. Crickets chirping 🦗',
      'A great product nobody knows about is like a party with no guests!',
      'Step 3 of the Startup Recipe: tell Techistan about it!',
    ],
  },
  act4: {
    title: 'Step 4: Money 💰',
    beats: [
      'Here’s what happened last time... (story so far)',
      'Customers are coming! Now your startup must EARN money.',
      'Too expensive and people walk away. Too cheap and you earn nothing. Tricky! 🤔',
      'And later today... strange boats will sail into Techistan harbour. 🦈',
      'Step 4 of the Startup Recipe: money!',
    ],
  },
  act5: {
    title: 'Step 5: Grow 🚀',
    beats: [
      'Here’s what happened last time... (story so far)',
      'Your startups are growing fast! Techistan loves you!',
      'But rAIvan is FURIOUS. Smoke is coming out of all 10 heads 😤',
      'He’s up to something big. And the Mayor has a huge order for the Festival...',
      'Step 5 of the Startup Recipe: grow bigger and stronger!',
    ],
  },
  showday: {
    title: 'Show Day',
    beats: [
      'The Startup Festival is here! All of Techistan has come to watch 🎪',
      'Every startup will tell its story on the big stage.',
      'Then every team gives stars. Be fair, real founders cheer each other on!',
      'And then... the Golden Trophy!',
    ],
  },
  finale: {
    title: 'The end of rAIvan?',
    beats: [
      'rAIvan tried copying, cheating and tricking...',
      'But Techistan’s startups were smarter, kinder and more honest!',
      'One by one, his heads got dizzy... and POOF! 💥',
      'rAIvan runs away shouting “I’ll be back next year!” 😂',
      'Now... who wins the Golden Trophy?',
    ],
  },
};

// ---------- Awards (revealed 5 -> 1) ----------
export const AWARDS = {
  banana: { rank: 5 as const, title: 'Banana Peel Award', icon: '🍌', sub: 'The startup that slipped the most (and still smiled!)' },
  pitch: { rank: 4 as const, title: 'Best Pitch', icon: '🎤', sub: 'Highest stars from the other teams' },
  customer: { rank: 3 as const, title: 'Customer Hero', icon: '👥', sub: 'Most customers' },
  happiness: { rank: 2 as const, title: 'Happiness Hero', icon: '😊', sub: 'Happiest customers' },
  champion: { rank: 1 as const, title: 'Ultimate Champion', icon: '🏆', sub: 'Most Success' },
};

// ---------- The script ----------
export const SCRIPT: Step[] = [
  { kind: 'lobby', id: 'lobby' },
  { kind: 'scene', id: 'welcome', sceneId: 'welcome', act: 0 },
  { kind: 'setup_players', id: 'players' },
  { kind: 'setup_teams', id: 'teams' },
  { kind: 'setup_roles', id: 'roles' },
  { kind: 'setup_products', id: 'products' },
  { kind: 'setup_names', id: 'names' },
  { kind: 'scene', id: 'howto', sceneId: 'howto', act: 0 },
  // Act 1 Problem
  { kind: 'scene', id: 'act1', sceneId: 'act1', act: 1 },
  { kind: 'question', id: 'a1q1', qId: 'a1q1', act: 1 },
  { kind: 'question', id: 'a1q2', qId: 'a1q2', act: 1 },
  { kind: 'mood', id: 'mood1', act: 1 },
  { kind: 'mic', id: 'mic1', act: 1 },
  { kind: 'board', id: 'board1', act: 1 },
  // Act 2 Build
  { kind: 'scene', id: 'act2', sceneId: 'act2', act: 2 },
  { kind: 'question', id: 'a2q1', qId: 'a2q1', act: 2 },
  { kind: 'bugsmash', id: 'bugs', act: 2 },
  { kind: 'mood', id: 'mood2', act: 2 },
  { kind: 'mic', id: 'mic2', act: 2 },
  { kind: 'board', id: 'board2', act: 2 },
  // Act 3 Launch
  { kind: 'scene', id: 'act3', sceneId: 'act3', act: 3 },
  { kind: 'question', id: 'a3q1', qId: 'a3q1', act: 3 },
  { kind: 'auction', id: 'auction', act: 3 },
  { kind: 'mood', id: 'mood3', act: 3 },
  { kind: 'mic', id: 'mic3', act: 3 },
  { kind: 'board', id: 'board3', act: 3 },
  { kind: 'break', id: 'break' },
  // Act 4 Money
  { kind: 'scene', id: 'act4', sceneId: 'act4', act: 4 },
  { kind: 'price', id: 'price', act: 4 },
  { kind: 'question', id: 'a4q2', qId: 'a4q2', act: 4 },
  { kind: 'mood', id: 'mood4', act: 4 },
  { kind: 'mic', id: 'mic4', act: 4 },
  { kind: 'board', id: 'board4', act: 4 },
  // Act 5 Grow
  { kind: 'scene', id: 'act5', sceneId: 'act5', act: 5 },
  { kind: 'question', id: 'a5q1', qId: 'a5q1', act: 5 },
  { kind: 'megaorder', id: 'mega', act: 5 },
  { kind: 'mood', id: 'mood5', act: 5 },
  { kind: 'mic', id: 'mic5', act: 5 },
  { kind: 'board', id: 'board5', act: 5 },
  // Show Day
  { kind: 'scene', id: 'showday', sceneId: 'showday', act: 6 },
  { kind: 'pitch', id: 'pitch' },
  { kind: 'scene', id: 'finale', sceneId: 'finale', act: 6 },
  { kind: 'awards', id: 'awards' },
  { kind: 'end', id: 'end' },
];
