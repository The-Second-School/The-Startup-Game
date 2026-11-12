// Narration for the teams, roles and products setup screens.
// Ids stay stable while kids tap around (counts, selected team ...), so nothing is re-spoken by accident.
import { currentStep } from '../../game/engine';
import { productById } from '../../game/content';
import type { GameState, Team } from '../../game/types';
import { roleCycle, teamName } from '../../screen/lib/game';
import type { Narration } from '../types';

/** Identity of a team split (ids, avatars and who is in which team). A shuffle gives a new signature. */
export function teamsSig(teams: Team[]): string {
  return teams.map(t => `${t.id}:${t.avatarSeed}:${t.members.map(m => m.playerId).join(',')}`).join('|');
}

/** True when every team has filled all the jobs it can (a team of 2 only has two jobs to give out). */
export function allJobsTaken(teams: Team[]): boolean {
  if (!teams.length) return false;
  return teams.every(t => {
    const bundles = roleCycle(t).slice(1);
    const have = new Set(t.members.flatMap(m => m.roles));
    const taken = bundles.filter(b => b.some(r => have.has(r))).length;
    return taken >= Math.min(bundles.length, t.members.length);
  });
}

// ---------------------------------------------------------------- teams
function teamsNarration(s: GameState): Narration {
  if (s.players.length < 3) {
    return { id: 'teams-need', lines: [{ text: 'We need a few more players before we can make teams!', tone: 'normal', pose: 'think' }] };
  }
  if (!s.teams.length) {
    return {
      id: 'teams-intro',
      lines: [
        { text: 'Time to make teams!', tone: 'excited', pose: 'cheer' },
        { text: 'I deal the kids out like cards, from the biggest class down to the smallest. So every team gets big kids AND small kids.', gap: 700 },
        { text: 'Pick how many teams you want, then press the big button!', pose: 'point' },
      ],
      summary: 'Every team mixes big and small kids. Pick how many teams, then press the button.',
    };
  }
  return {
    id: `teams-made-${teamsSig(s.teams)}`,
    lines: [
      { text: 'Drumroll please! Who will land in which team?', tone: 'excited', pose: 'think', gap: 4200 },
      { text: 'Ta-da! Here are your teams!', tone: 'cheer', pose: 'cheer', gap: 700 },
      { text: 'Look at the coloured dots. Every team has kids from different classes, so you can all learn from each other!', pose: 'point' },
    ],
    summary: 'Every team mixes classes: big and small kids learn together.',
  };
}

// ---------------------------------------------------------------- roles
let rolesDoneSeen = false;

function rolesNarration(s: GameState): Narration {
  if (!s.teams.some(t => t.members.some(m => m.roles.length))) rolesDoneSeen = false;   // fresh start
  if (allJobsTaken(s.teams)) {
    rolesDoneSeen = true;
    return { id: 'roles-done', lines: [{ text: 'Every team has every job! Wonderful teamwork!', tone: 'cheer', pose: 'cheer' }] };
  }
  if (rolesDoneSeen) {
    // Someone changed a job after the cheer: do not repeat the whole speech.
    return { id: 'roles-open', lines: [{ text: 'Pick a free job for every kid.', pose: 'point' }] };
  }
  const big = s.teams.some(t => t.members.length >= 5);
  const lines: Narration['lines'] = [
    { text: 'Pick your jobs!', tone: 'excited', pose: 'cheer' },
    { text: 'The CEO has the final say after the team talks.' },
    { text: 'The Money Manager watches the coins and bids in the auction.' },
    { text: 'The Lock Master taps the team’s choice and locks it.' },
    { text: 'The Speaker answers at Mic Time and gives the final pitch.', gap: big ? 450 : 800 },
  ];
  if (big) lines.push({ text: 'Big teams also have a Timekeeper, who watches the clock.', gap: 800 });
  lines.push({ text: 'Every kid picks one job. A job that is taken disappears, so pick a free one!', pose: 'point' });
  return { id: 'roles-intro', lines, summary: 'Every kid picks one job. Jobs that are taken disappear from the list.' };
}

// ---------------------------------------------------------------- products
const PRODUCT_LINES: Record<string, string> = {
  tiffingo: 'TiffinGo! Hot lunch boxes, delivered right to your school. Yummy!',
  cycleshare: 'CycleShare! Smart cycles that anybody can rent by the hour. Ring ring!',
  mathmagic: 'MathMagic! An A.I. maths coach that turns practice into a game. Maths just got fun!',
  farmfriend: 'FarmFriend! A phone buddy that tells farmers exactly when to water their crops. Super useful!',
  petpal: 'PetPal! You will walk and feed pets while their families are busy. Woof woof!',
  homeworkbuddy: 'HomeworkBuddy! A robot that plans your homework and exam revision. Every kid wants one!',
  sipbottle: 'SipBottle! A smart bottle that lights up to remind you to drink water. Glug glug!',
  roombot: 'RoomBot! A robot that tidies your room while you play. What a dream!',
  solarbuddy: 'SolarBuddy! Small solar lamps for homes that face power cuts. What a bright idea!',
  cleanstreet: 'CleanStreet! Neighbours sort their waste and you collect it for recycling. Clean and green!',
};

function productsNarration(s: GameState): Narration {
  const got = s.teams.filter(t => t.productId);
  const next = s.teams.find(t => !t.productId) ?? null;
  const last = got[got.length - 1];
  if (!last) {
    const lines: Narration['lines'] = [
      { text: 'Spin your product!', tone: 'excited', pose: 'cheer' },
      { text: 'Each team spins the wheel and gets a real startup idea to build. Taken ideas turn grey, so every team gets a different one!', gap: 700 },
    ];
    if (next) lines.push({ text: `${teamName(next)}, you spin first. Press SPIN!`, tone: 'excited', pose: 'point' });
    return { id: 'prod-0', lines, summary: 'Every team spins for a startup idea. Taken ideas turn grey.' };
  }
  const p = productById(last.productId);
  const who = teamName(last);
  const idea = p ? (PRODUCT_LINES[p.id] ?? `${p.name}! ${p.does}.`) : 'What a great idea!';
  const lines: Narration['lines'] = [
    { text: `${who} got ${idea}`, tone: 'excited', pose: 'cheer', gap: 700 },
  ];
  if (next) lines.push({ text: `Next up: ${teamName(next)}! Press SPIN!`, tone: 'excited', pose: 'point' });
  else lines.push({ text: 'Every team has a startup idea! Great job, founders!', tone: 'cheer', pose: 'cheer' });
  return { id: `prod-${got.length}`, lines, summary: next ? `${who} got ${p?.name ?? 'an idea'}. Next: ${teamName(next)} spins.` : `${who} got ${p?.name ?? 'an idea'}. Every team has a startup!` };
}

export function setupTeamsNarration(s: GameState): Narration | null {
  switch (currentStep(s).kind) {
    case 'setup_teams': return teamsNarration(s);
    case 'setup_roles': return rolesNarration(s);
    case 'setup_products': return productsNarration(s);
    default: return null;
  }
}
