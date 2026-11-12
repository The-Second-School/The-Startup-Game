// All game words and numbers live here. Change text or balance without touching the engine.
// Every effect is a plain plus or minus. {team} and {product} are filled in at reveal.

import type { AuctionTicket, RoleId, SceneId, Step } from './types';

// ---------- Scoring ----------
export const START = { customers: 5, happiness: 5, coins: 200 };
export const METER_MAX = 50;
export const SUCCESS_DIVISOR = 280;     // Success = (Customers + Happiness) x Coins / 280, capped at 100 (see docs/REVIEW.md)
export const TALK_MS = 300_000;          // team talk time: 5 minutes
export const PAIR_TALK_MS = 300_000;
export const TIMER_SHOW_MS = 60_000;     // the timer only appears on screen when this much time is left
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
  ceo: { name: 'CEO', icon: '👑', job: 'Makes the final decision after the team talks' },
  money: { name: 'Money Manager', icon: '💰', job: 'Keeps an eye on coins and bids in the auction' },
  lock: { name: 'Lock Master', icon: '🔒', job: 'Taps the team’s choice on the big screen and locks it' },
  speaker: { name: 'Speaker', icon: '🎤', job: 'Answers at Mic Time and gives the final pitch' },
  time: { name: 'Timekeeper', icon: '⏱️', job: 'Watches the timer and makes sure everyone shares an idea' },
};
// Which roles a team of N needs, in fill order. Team of 3: CEO is also Money Manager.
export const ROLE_PLAN: Record<number, RoleId[][]> = {
  3: [['ceo', 'money'], ['lock'], ['speaker']],
  4: [['ceo'], ['money'], ['lock'], ['speaker']],
  5: [['ceo'], ['money'], ['lock'], ['speaker'], ['time']],
};

// ---------- Products (10 on the wheel) ----------
export const PRICE_MIN = 10, PRICE_MAX = 100, PRICE_STEP = 10;
export interface Product {
  id: string;
  name: string;
  icon: string;
  does: string;      // one clear sentence: what the startup sells
  unit: string;      // WHAT one sale is ("one tiffin box"): the price you set is for exactly this
  cost: number;      // what it costs the team to make ONE unit
  fair: number;      // what a customer thinks one unit is worth (drives the demand curve)
  rival: number;     // what Jhootu charges for his copy: shown as the reference price
  hint: string;      // one line to help kids guess a price
  color: string;
}
const RAW_PRODUCTS: Product[] = [
  { id: 'tiffingo', name: 'TiffinGo', icon: '🍱', does: 'Delivers a hot lunch box to your school', unit: 'one tiffin box', cost: 25, fair: 50, rival: 35, hint: 'A school canteen meal costs about ₹40 to ₹60.', color: '#FF9600' },
  { id: 'cycleshare', name: 'CycleShare', icon: '🚲', does: 'Rent a smart cycle for an hour', unit: 'one hour of riding', cost: 5, fair: 20, rival: 10, hint: 'An auto ride costs about ₹30.', color: '#1CB0F6' },
  { id: 'mathmagic', name: 'MathMagic', icon: '🧮', does: 'A smart coach that turns maths practice into a game', unit: 'one month of the game', cost: 15, fair: 50, rival: 30, hint: 'A comic book costs about ₹50.', color: '#CE82FF' },
  { id: 'farmfriend', name: 'FarmFriend', icon: '🌾', does: 'A phone buddy that tells farmers when to water their crops', unit: 'one farmer for one month', cost: 20, fair: 60, rival: 40, hint: 'It saves a farmer ₹500 a month. Farmers count every rupee, so set a small price.', color: '#58CC02' },
  { id: 'petpal', name: 'PetPal', icon: '🐶', does: 'Walks and feeds pets when their families are busy', unit: 'one pet walk', cost: 10, fair: 30, rival: 20, hint: 'A plate of samosas costs about ₹30.', color: '#FF86D0' },
  { id: 'homeworkbuddy', name: 'HomeworkBuddy', icon: '🤖', does: 'A robot that plans your homework and helps you study for exams', unit: 'one month with the robot', cost: 25, fair: 70, rival: 50, hint: 'Tuition costs ₹500 a month. A reminder robot should cost much less.', color: '#00CD9C' },
  { id: 'sipbottle', name: 'SipBottle', icon: '💧', does: 'A smart bottle that lights up to remind you to drink water', unit: 'one bottle', cost: 30, fair: 60, rival: 45, hint: 'A plain bottle costs about ₹50.', color: '#1CB0F6' },
  { id: 'roombot', name: 'RoomBot', icon: '🧹', does: 'A robot that tidies your room while you play', unit: 'one month of tidying', cost: 30, fair: 70, rival: 55, hint: 'A big pizza costs ₹300. Would you pay a third of that to never tidy up?', color: '#FF4B4B' },
  { id: 'solarbuddy', name: 'SolarBuddy', icon: '☀️', does: 'Rents small solar lamps to homes with power cuts', unit: 'one lamp for one month', cost: 30, fair: 70, rival: 50, hint: 'Candles and batteries cost a family about ₹100 a month.', color: '#FFC800' },
  { id: 'cleanstreet', name: 'CleanStreet', icon: '♻️', does: 'Neighbours sort their trash, and we collect it so it can be reused', unit: 'one street pickup', cost: 10, fair: 40, rival: 25, hint: 'A neighbour would pay one cup of chai’s price to keep the street clean.', color: '#46A302' },
];

/** Customers per 10 interested people who actually buy at `price`. Cheap sells to everyone, too expensive sells to nobody. */
export const buyersAt = (p: { fair: number }, price: number) => Math.round(10 * Math.max(0, Math.min(1, (1.8 * p.fair - price) / (1.2 * p.fair))));
export const profitAt = (p: { fair: number; cost: number }, price: number) => buyersAt(p, price) * (price - p.cost);
/** The price (₹10 steps) that earns the team the most. */
function bestFor(p: { fair: number; cost: number }) {
  let best = PRICE_MIN, top = -Infinity;
  for (let price = PRICE_MIN; price <= PRICE_MAX; price += PRICE_STEP) { const v = profitAt(p, price); if (v > top) { top = v; best = price; } }
  return best;
}
export const PRODUCTS: (Product & { bestPrice: number })[] = RAW_PRODUCTS.map(p => ({ ...p, bestPrice: bestFor(p) }));
export const productById = (id: string | null) => PRODUCTS.find(p => p.id === id) ?? null;

// ---------- Questions ----------
export interface Option {
  text: string;
  icon: string;
  coins: number;          // negative = cost, positive = gain
  customers: number;
  happiness: number;
  trap?: boolean;         // Jhootu's trick (shown with 😈 only after reveal)
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
    title: 'How will you find out what people need?',
    boltIntro: 'The best startups first find out what people need. How will you find out?',
    options: [
      { text: 'Ask 10 people at the market', icon: '🗣️', coins: -10, customers: 3, happiness: 7, label: 'Asked 10 people', story: '{team} asked 10 real people. Now they know what Techistan wants! 💡' },
      { text: 'Guess it at home', icon: '🏠', coins: 0, customers: 3, happiness: 2, label: 'Guessed at home', story: '{team} guessed at home. Some guesses were right... some were not 🤔' },
      { text: 'Buy Jhootu’s “Secret Wish List”', icon: '📜', coins: -10, customers: 8, happiness: -5, trap: true, label: 'Bought Jhootu’s list', story: 'Jhootu’s list was FAKE! {team} made things nobody wanted 😱' },
      { text: 'Put an idea box at school', icon: '📦', coins: -20, customers: 6, happiness: 5, label: 'Idea box at school', story: '{team}’s idea box filled up with 100 notes! 📦' },
    ],
  },
  a1q2: {
    id: 'a1q2', act: 1, introAnim: 'spybot',
    title: 'Jhootu’s spy-bot wants to peek at your idea notebook!',
    sub: 'What do you do?',
    boltIntro: 'Uh oh! A sneaky spy-bot is knocking at your door. It wants to see your ideas!',
    options: [
      { text: 'Join Jhootu’s team for coins', icon: '🤝', coins: 20, customers: 0, happiness: -10, trap: true, label: 'Joined Jhootu', story: 'Jhootu paid {team}... then made them work all day 😩' },
      { text: 'Show it, he looks friendly', icon: '📖', coins: 0, customers: -7, happiness: 0, label: 'Showed the notebook', story: 'Oops! The spy-bot copied {team}’s idea and zoomed away 🏃' },
      { text: 'Lock it in a strong box', icon: '🔒', coins: -10, customers: 2, happiness: 2, label: 'Locked the notebook', story: '{team} bought a strong box with a lock. The ideas are safe! 🔒' },
      { text: 'Tell everyone your idea first!', icon: '📢', coins: -20, customers: 7, happiness: 1, label: 'Told everyone first', story: '{team} printed flyers for the whole town. Everyone knows who had the idea first! 📢' },
    ],
  },
  a2q1: {
    id: 'a2q1', act: 2, introAnim: 'toolbox',
    title: 'Time to build the first version of your product. How will you do it?',
    boltIntro: 'You know what people need. Now let’s build it! But how?',
    options: [
      { text: 'Build small, test with 5 friends', icon: '🧪', coins: -20, customers: 3, happiness: 9, label: 'Tested with friends', story: '{team}’s 5 friends found 3 problems. All fixed! 🔧', bonus: '+5 seconds in Bug Smash' },
      { text: 'Copy Jhootu’s design', icon: '📋', coins: 0, customers: 6, happiness: -8, trap: true, label: 'Copied Jhootu', story: 'People spotted the copy right away. “Hey, that’s Jhootu’s!” 😬' },
      { text: 'Build super fast, launch tomorrow', icon: '⚡', coins: 0, customers: 8, happiness: -2, label: 'Built super fast', story: '{team} launched in one night! A bit wobbly though 🫨' },
      { text: 'Add 20 cool extras', icon: '✨', coins: -20, customers: 6, happiness: 0, label: 'Added 20 extras', story: '20 new things! Customers are a little confused about which button does what 🤯' },
    ],
  },
  a3q1: {
    id: 'a3q1', act: 3, introAnim: 'megaphone',
    title: 'Your product works! How will Techistan hear about it?',
    sub: 'Tip: happy customers love to talk. Unhappy ones stay quiet.',
    boltIntro: 'Your product is ready... but nobody knows about it! Let’s tell everyone!',
    options: [
      { text: 'Posters all over Techistan', icon: '🪧', coins: -20, customers: 9, happiness: 0, label: 'Posters everywhere', story: '{team}’s posters are on every wall in Techistan! 🪧' },
      { text: 'Ask happy customers to tell friends', icon: '💬', coins: 0, customers: 10, happiness: 0, ifHappinessAtLeast: 20, elseCustomers: 3, label: 'Word of mouth', story: 'Happy customers told everyone! The news spread super fast 🔥', elseStory: 'Customers weren’t happy enough to talk about {team} yet 😐' },
      { text: 'Buy 100 fake 5-star reviews', icon: '⭐', coins: -10, customers: 12, happiness: -10, trap: true, label: 'Bought fake reviews', story: 'The Techistan Times found out the reviews were fake! 📰😱' },
      { text: 'Free samples at the school gate', icon: '🎁', coins: -40, customers: 6, happiness: 5, label: 'Free samples', story: 'Kids lined up at the school gate for free samples! 🎁' },
    ],
  },
  a4q2: {
    id: 'a4q2', act: 4, introAnim: 'investors',
    title: 'Investors want to give you money! Who do you pick?',
    sub: 'Investors are people who give money. But they always want something back.',
    boltIntro: 'Look! Investors are walking through the Techistan market with bags of coins. Each one wants a share of your startup!',
    options: [
      { text: 'Kind Mentor', icon: '🧑‍🏫', coins: 50, customers: 0, happiness: 3, label: 'Kind Mentor', story: 'The Kind Mentor gave {team} coins AND great advice 🧑‍🏫' },
      { text: 'Jhootu Ventures', icon: '💼', coins: 120, customers: -12, happiness: -8, trap: true, label: 'Jhootu Ventures', story: 'Jhootu gave lots of coins... then sold {team}’s customer info! 😡' },
      { text: 'Pushy Boss', icon: '🕴️', coins: 100, customers: 0, happiness: -6, label: 'Pushy Boss', story: 'The Pushy Boss wants results NOW. The team feels worried 😰' },
      { text: 'Mama-Mami Fund', icon: '👨‍👩‍👧', coins: 30, customers: 4, happiness: 0, label: 'Mama-Mami Fund', story: 'Mama-Mami gave coins and told the whole family! 👨‍👩‍👧' },
    ],
  },
  a5q1: {
    id: 'a5q1', act: 5, introAnim: 'copier',
    title: 'Jhootu copied ALL your products and sells them at half price!',
    sub: 'How do you fight back?',
    boltIntro: 'Jhootu is very angry! His copy machine is printing fake products everywhere!',
    options: [
      { text: 'Give old customers a reward card', icon: '💳', coins: -20, customers: 6, happiness: 5, label: 'Reward cards', story: 'Old customers love their reward cards and stayed! 💳' },
      { text: 'Cut our price to half too', icon: '✂️', coins: 0, customers: 6, happiness: -2, label: 'Cut price', story: 'Cheaper! More customers... but every sale earns half as much 🪙' },
      { text: 'Say his copy is dangerous (it isn’t)', icon: '🤥', coins: 0, customers: 8, happiness: -10, trap: true, label: 'Told a lie', story: 'People found out it was a lie. Not cool! 🙅' },
      { text: 'Make ours even better', icon: '💪', coins: -40, customers: 3, happiness: 10, label: 'Made it better', story: '{team}’s product got SO good, Jhootu’s copy looks silly now ✨' },
    ],
  },
};

// ---------- Bug Smash ----------
export const BUG = {
  seconds: 15,
  testedBonusSeconds: 5,
  testedOption: { qId: 'a2q1', index: 0 },
  // Bugs smashed -> what the customers feel. Fewer bugs left = a smoother product = happier customers (and more of them stay).
  tiers: [
    { min: 0, max: 9, happiness: -5, customers: -2, text: 'Too many bugs got through. Customers hit problems and got grumpy' },
    { min: 10, max: 19, happiness: 0, customers: 0, text: 'Phew! The bugs are not too bad. Customers noticed nothing wrong' },
    { min: 20, max: 29, happiness: 4, customers: 2, text: 'Bug buster! A smooth product makes customers happy and brings new ones' },
    { min: 30, max: 999, happiness: 7, customers: 3, text: 'BUG LEGEND! Super smooth. Customers love it and tell their friends' },
  ],
};

// ---------- Price It Right ----------
// 10 interested people look at the product. A price that is low sells to all 10, a price that is too high sells to none.
// Every sale earns (price - cost). Coins gained = 80 x (your profit / the best possible profit), so every product pays the same for its best price.
// Customers gained = buyers - 4. Happiness depends on fairness.
export const PRICE = {
  min: PRICE_MIN, max: PRICE_MAX, step: PRICE_STEP,
  interested: 10,
  /** The best possible price always pays this many coins; other prices pay in proportion to their profit. */
  bestCoins: 80,
  customersBase: 4,
  text: {
    right: 'Perfect price! Lots of people bought, and you kept good money on each sale',
    close: 'Nearly right! Good sales, and you keep a fair amount of money',
    high: 'Too expensive! Many people walked away, so your coin box stayed small',
    low: 'So cheap that everyone bought... but each sale earned almost nothing',
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
    broken: 'Deal broken! They could not agree, so the Mayor gave the order to someone else.',
  },
  combos: (a: string, b: string) => `${a} + ${b} = Super Combo!`,
};

// ---------- Customer Mood ----------
// Only twice: after Act 2 (looks at acts 1 to 2) and after Act 5 (looks at all 5 acts). Later acts count double.
// Rule in one line: customers who are NOT happy leave, and very happy customers bring friends.
// gap = weighted average over the acts of (customers won - happiness earned). Big positive gap = unhappy crowd.
export const MOOD = {
  weights: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2 } as Record<number, number>,
  checkActs: [2, 5],
  // gap thresholds -> customers change
  rules: [
    { minGap: 6, customers: -6 },
    { minGap: 3, customers: -3 },
    { maxGap: -5, customers: 4 },
    { maxGap: -2, customers: 2 },
  ] as { minGap?: number; maxGap?: number; customers: number }[],
  text: {
    left: (n: number) => `${n} customers got bored and left`,
    joined: (n: number) => `${n} happy customers brought their friends!`,
    same: 'Customers are staying with you',
  },
};

// ---------- Mic Time ----------
export const MIC_QUESTIONS: Record<number, string> = {
  1: 'Why is asking real people better than guessing?',
  2: 'Why is testing with 5 friends better than adding 20 new things?',
  3: 'Is it okay to buy fake reviews? Why not?',
  4: 'You sold one tiffin box for ₹50, and it cost ₹30 to make. How much profit did you keep? What does profit mean?',
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
// Art indices follow beat indices: keep the art file in step when a beat is added, moved or removed.
// `summary` is the one-line "Summary" shown and spoken after the last beat (scenes with 2+ beats).
export const SCENES: Record<SceneId, { title: string; beats: string[]; summary?: string }> = {
  welcome: {
    title: 'Welcome to Techistan!',
    beats: [
      'Hi! I’m Bolt, the friendliest robot in Techistan! 👋',
      'Techistan is a city full of ideas. Flying buses, singing streetlights, robot chaiwalas!',
      'Today the Mayor has a big announcement...',
      '“The Startup Festival begins! Build a startup in 5 steps and win the Golden Trophy!”',
      'But wait... who is that?! 😱',
      'It’s Jhootu, a naughty robot! He tells lies and copies other people’s ideas. He wants every startup to copy him or work for him.',
      'Don’t worry. Smart, honest startups always beat him. Let’s build yours!',
    ],
    summary: 'Build a startup in 5 steps, win the Golden Trophy, and beat naughty Jhootu!',
  },
  howto: {
    title: 'How to play',
    beats: [
      'How to play! Your startup has 3 things: 👥 Customers, 😊 Happiness and 🪙 Coins.',
      'Let’s start with Coins. Coins are your money. You spend coins to make and buy things. You earn coins when customers buy from you.',
      'Spend too much and your coin box gets empty. Earn more and your startup can grow bigger!',
      'Next, Customers. Customers are the people who buy from you. More customers means more sales.',
      'Customers change after every choice. A good idea brings new customers. A bad choice or a trick makes them leave.',
      'Next, Happiness. Happiness is how much your customers like you. Happy customers come back and tell their friends. 😊',
      'Happiness goes up with good products and fair prices. It goes down with bugs and tricks.',
      'Why both? Customers bring the sales. Happiness keeps them coming back. You need both!',
      'Your Success score adds customers and happiness. Then it multiplies by your coins. Grow all three!',
      'As you grow, your startup grows too. Tiny Stall, Busy Shop, Big Office, Sky Tower!',
      'Every question, talk with your team. Then your Lock Master taps your choice and locks it 🔒',
      'When everyone has locked, I show what happened, one team at a time! Sometimes I pick a team for Mic Time too 🎤',
      'Careful: some options are Jhootu’s tricks. They look great... but are they? 😈',
      'So the whole game is simple. Grow coins, customers and happiness. Lock your choices, then watch the reveal. Keep all three growing and win!',
    ],
    summary: 'Coins are your money. Customers and happiness make your Success score. Grow all three!',
  },
  act1: {
    title: 'Step 1: The Problem 🔍',
    beats: [
      'Act 1: The Problem. Every great startup starts with a problem.',
      'Like this kid. Cold lunch again. Yuck! 🥶',
      'One day she thought: “What if hot lunch came to school?” 💡 That’s how a startup begins!',
      'You have your products. But who needs them? What do they want?',
      'Step 1 of the Startup Recipe: find the problem!',
    ],
    summary: 'Find a real problem first. Ask who needs help and what they want.',
  },
  act2: {
    title: 'Step 2: Build it 🛠️',
    beats: [
      'Here’s what happened last time... (story so far)',
      'Act 2: Build it. You know what people need. Now it’s time to build!',
      'Welcome to the Techistan Workshop. Hammers, screws and a lot of glue! 🔨',
      'But psst... Jhootu’s bug is hiding in the corner. It loves breaking things!',
      'Step 2 of the Startup Recipe: build version 1!',
    ],
    summary: 'Build version 1 of your product, and watch out for bugs.',
  },
  act3: {
    title: 'Step 3: Launch it 📣',
    beats: [
      'Here’s what happened last time... (story so far)',
      'Act 3: Launch it. Your product works! But look at your shop... it is empty. Not one customer yet 🦗',
      'A great product nobody knows about is like a party with no guests!',
      'Step 3 of the Startup Recipe: tell Techistan about it! Billboards, megaphones and customers come running!',
    ],
    summary: 'A great product needs customers. So tell everyone about it!',
  },
  act4: {
    title: 'Step 4: Money 💰',
    beats: [
      'Here’s what happened last time... (story so far)',
      'Act 4: Money. Customers are coming to your market stall! Now your startup must earn money.',
      'Too expensive and people walk away. Too cheap and you earn nothing. Tricky! 🤔',
      'Later, investors will walk by. They give money to startups that are winning! 💼',
      'Step 4 of the Startup Recipe: money!',
    ],
    summary: 'Set a fair price. Too high loses customers. Too low earns no money.',
  },
  act5: {
    title: 'Step 5: Grow 🚀',
    beats: [
      'Here’s what happened last time... (story so far)',
      'Act 5: Grow. Your startups are growing fast! Techistan loves you!',
      'But Jhootu is very angry. Smoke is coming out of his antennas! 😤',
      'He’s planning something big. And the Mayor has a huge order for the Festival...',
      'Step 5 of the Startup Recipe: grow bigger and stronger!',
    ],
    summary: 'Keep growing and stay honest. Jhootu is planning a trick, and a big Festival order is coming.',
  },
  showday: {
    title: 'Show Day',
    beats: [
      'Show Day! The Startup Festival is here, and all of Techistan has come to watch 🎪',
      'Every startup will tell its story on the big stage.',
      'Then every team gives stars. Be fair, and cheer for each other!',
      'And then... the Golden Trophy! 🏆',
    ],
    summary: 'Tell your story, give fair stars, and see who wins the Golden Trophy.',
  },
  finale: {
    title: 'The end of Jhootu?',
    beats: [
      'Jhootu tried copying, cheating and tricking...',
      'But Techistan’s startups were smarter, kinder and more honest!',
      'One by one, his robot brain got dizzy... and poof! 💥',
      'Jhootu runs away shouting “I’ll be back next year!” 😂',
      'Now... who wins the Golden Trophy?',
    ],
    summary: 'Honest startups beat Jhootu. Now let’s find the winner!',
  },
};

// ---------- Awards (revealed 5 -> 1) ----------
export const AWARDS = {
  banana: { rank: 5 as const, title: 'Banana Peel Award', icon: '🍌', sub: 'The startup that slipped the most (and still smiled!)' },
  pitch: { rank: 4 as const, title: 'Best Pitch', icon: '🎤', sub: 'Highest stars from the other teams' },
  customer: { rank: 3 as const, title: 'Customer Hero', icon: '👥', sub: 'Most customers' },
  happiness: { rank: 2 as const, title: 'Happiness Hero', icon: '😊', sub: 'Happiest customers' },
  champion: { rank: 1 as const, title: 'Ultimate Champion', icon: '🏆', sub: 'Highest Success score' },
};

// ---------- The script ----------
// Rhythm of every act: story scene -> main choice(s) -> at most ONE or TWO side activities -> leaderboard -> progress.
export const SCRIPT: Step[] = [
  { kind: 'lobby', id: 'lobby' },
  { kind: 'scene', id: 'welcome', sceneId: 'welcome', act: 0 },
  { kind: 'setup_players', id: 'players' },
  { kind: 'setup_teams', id: 'teams' },
  { kind: 'setup_names', id: 'names' },
  { kind: 'setup_roles', id: 'roles' },
  { kind: 'setup_products', id: 'products' },
  { kind: 'scene', id: 'howto', sceneId: 'howto', act: 0 },
  // Act 1 Problem
  { kind: 'scene', id: 'act1', sceneId: 'act1', act: 1 },
  { kind: 'question', id: 'a1q1', qId: 'a1q1', act: 1 },
  { kind: 'question', id: 'a1q2', qId: 'a1q2', act: 1 },
  { kind: 'mic', id: 'mic1', act: 1 },
  { kind: 'board', id: 'board1', act: 1 },
  { kind: 'progress', id: 'progress1', act: 1 },
  // Act 2 Build
  { kind: 'scene', id: 'act2', sceneId: 'act2', act: 2 },
  { kind: 'question', id: 'a2q1', qId: 'a2q1', act: 2 },
  { kind: 'bugsmash', id: 'bugs', act: 2 },
  { kind: 'mood', id: 'mood2', act: 2 },
  { kind: 'board', id: 'board2', act: 2 },
  { kind: 'progress', id: 'progress2', act: 2 },
  // Act 3 Launch
  { kind: 'scene', id: 'act3', sceneId: 'act3', act: 3 },
  { kind: 'question', id: 'a3q1', qId: 'a3q1', act: 3 },
  { kind: 'auction', id: 'auction', act: 3 },
  { kind: 'mic', id: 'mic3', act: 3 },
  { kind: 'board', id: 'board3', act: 3 },
  { kind: 'progress', id: 'progress3', act: 3 },
  { kind: 'break', id: 'break' },
  { kind: 'board', id: 'recap', act: 3, recap: true },
  // Act 4 Money
  { kind: 'scene', id: 'act4', sceneId: 'act4', act: 4 },
  { kind: 'price', id: 'price', act: 4 },
  { kind: 'question', id: 'a4q2', qId: 'a4q2', act: 4 },
  { kind: 'mic', id: 'mic4', act: 4 },
  { kind: 'board', id: 'board4', act: 4 },
  { kind: 'progress', id: 'progress4', act: 4 },
  // Act 5 Grow
  { kind: 'scene', id: 'act5', sceneId: 'act5', act: 5 },
  { kind: 'question', id: 'a5q1', qId: 'a5q1', act: 5 },
  { kind: 'megaorder', id: 'mega', act: 5 },
  { kind: 'mood', id: 'mood5', act: 5 },
  { kind: 'board', id: 'board5', act: 5 },
  { kind: 'progress', id: 'progress5', act: 5 },
  // Show Day
  { kind: 'scene', id: 'showday', sceneId: 'showday', act: 6 },
  { kind: 'pitch', id: 'pitch' },
  { kind: 'scene', id: 'finale', sceneId: 'finale', act: 6 },
  { kind: 'awards', id: 'awards' },
  { kind: 'end', id: 'end' },
];

/**
 * Decisions that must stay SECRET: the team's Lock Master whispers the answer to the host, who enters it on the phone
 * (4 shape buttons + Lock). The big screen shows the options but nobody taps them there, so nothing leaks.
 * Needs secrecy: temptations and trade-offs other teams could copy (a1q2, a3q1, a4q2, a5q1) and the partner deal in Mega Order
 * (partners must not see each other's pick). Open on screen: a1q1 and a2q1 (harmless method choices) and Price It Right (slider).
 */
export const SECRET_STEPS = ['a1q2', 'a3q1', 'a4q2', 'a5q1', 'mega'];
export const isSecretStep = (id: string) => SECRET_STEPS.includes(id);

/** Index of the first act scene: the header and progress rail only show from here on ("the game has started"). */
export const GAME_START_ID = 'act1';

// ---------- Why each choice does what it does (kid-friendly; spoken at the reveal) ----------
// Order = the question's options. Explains the direction of each change (coin costs are exact; customer and happiness
// numbers are NOT repeated here because meters stop at 0 and 50: the pills on screen show the real change).
export const WHY: Record<string, string[]> = {
  a1q1: [
    'Asking real people cost 10 coins. They told you what they need. So you built something they love. Happiness goes up a lot, and a few became your first customers.',
    'Guessing is free. But you only half know what people need. So a few customers came, and some were happy, but not many.',
    'The fake list cost 10 coins. It made big promises, so lots of people came to look. But the product was wrong for them. They were unhappy, so happiness goes down.',
    'The idea box cost 20 coins. Lots of kids wrote what they want. People noticed you, so new customers came and happiness goes up.',
  ],
  a1q2: [
    'Jhootu paid you 20 coins, so your coins go up. But he made your team work all day. Everyone felt unhappy, so happiness goes down a lot.',
    'Showing it was free. But the spy-bot copied your idea and ran off. Jhootu’s copy took some of your customers away.',
    'The strong box cost 10 coins. Your ideas stayed safe, so customers trusted you. Your team felt calm. A few more customers came, and happiness went up a little.',
    'The flyers cost 20 coins. But the whole town heard about you first. So lots of new customers came. Nobody could say you copied, so happiness goes up a little.',
  ],
  a2q1: [
    'Testing cost 20 coins. Your friends found problems before launch. So customers are very happy, and some came. Bonus: fewer bugs means 5 extra seconds in Bug Smash!',
    'Copying is free and fast, so customers came. But people spotted the copy. They stopped trusting you, so happiness goes down.',
    'Launching fast is free, and lots of customers came to see. But the product was a bit wobbly, so happiness goes down a little.',
    'Twenty extra things cost 20 coins. Customers were curious and came. But too many buttons confused them, so happiness stayed the same.',
  ],
  a3q1: [
    'Posters cost 20 coins. Everyone in Techistan saw them, so lots of new customers came. Posters do not change how happy people are.',
    'This is free. Happy customers love to tell their friends, so lots of new customers came!',
    'The fake reviews cost 10 coins. They looked great, so many customers came. Then the Techistan Times found out. Everybody felt tricked, so happiness goes down a lot.',
    'The free samples cost 40 coins. Kids loved trying it first: new customers came and happiness goes up.',
  ],
  a4q2: [
    'The Kind Mentor gave you 50 coins and good advice. Good advice helps the team feel cared for: happiness goes up a little.',
    'Jhootu gave the most coins, 120! But he sold your customers’ info. You lost customers, and happiness went down.',
    'The Pushy Boss gave 100 coins. But he wants results right now. The team feels worried, so happiness goes down.',
    'Mama-Mami gave only 30 coins. But the whole family heard about you, so a few new customers came.',
  ],
  a5q1: [
    'Reward cards cost 20 coins. Old customers felt special and stayed: more customers and more happiness.',
    'Cutting your price is free, and cheap things bring customers. But you earn less on every sale. The team feels worried: happiness goes down a little.',
    'Lying is free, and the scary story made people come. But people found out it was a lie. They felt cheated, so happiness goes down a lot.',
    'Making your product better cost 40 coins. Customers loved it: happiness goes up a lot and a few more customers came.',
  ],
};
/** Explanation for the word-of-mouth option when customers were NOT happy enough to talk. */
export const WHY_ELSE: Record<string, string> = {
  a3q1_1: 'This is free. But your customers were not happy enough to talk about you. So only a few new customers came. Happy customers tell friends. Unhappy ones stay quiet.',
};
/** One line explaining the Bug Smash time bonus. */
export const BONUS_WHY = 'Your team tested early, so there are fewer bugs to fix. That gives you 5 extra seconds in Bug Smash!';
