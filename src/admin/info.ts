import { AUCTION_OPEN, AUCTION_RESERVE, AUCTION_STEP, PAIR_TALK_MS, PITCH_MS, QUESTIONS, RECIPE, SCENES, SCRIPT, TALK_MS } from '../game/content';
import { currentStep, teamById } from '../game/engine';
import { makeTeams, micQuestionFor } from '../game/helpers';
import type { Action, GameState, Step, Team } from '../game/types';
import { MEGA_COACH, MIC_ASK, MIC_TOPIC, PRE_REVEAL, PRICE_PRE_REVEAL, PRICE_COACH, QUESTION_COACH, SCENE_COACH } from './coach';

const stripEmoji = (s: string) => s.replace(/\s*[^\w\s:!?'’.,]+\s*$/u, '').trim();

export function stepTitle(step: Step): string {
  switch (step.kind) {
    case 'lobby': return 'Lobby';
    case 'setup_players': return 'Add players';
    case 'setup_teams': return 'Make teams';
    case 'setup_roles': return 'Pick roles';
    case 'setup_products': return 'Product wheel';
    case 'setup_names': return 'Name the teams';
    case 'scene': return stripEmoji(SCENES[step.sceneId].title);
    case 'question': {
      const n = SCRIPT.filter(s => s.kind === 'question' && s.act === step.act).findIndex(s => s.id === step.id) + 1;
      return `Question ${step.act}.${n}`;
    }
    case 'price': return 'Price It Right';
    case 'bugsmash': return 'Bug Smash';
    case 'auction': return 'Auction';
    case 'megaorder': return 'Mega Order';
    case 'mood': return 'Customer mood';
    case 'mic': return 'Mic Time';
    case 'board': return step.recap ? 'Recap' : 'Leaderboards';
    case 'progress': return 'Progress';
    case 'break': return 'Break';
    case 'pitch': return 'Pitches and votes';
    case 'awards': return 'Awards';
    case 'end': return 'The end';
  }
}

/** Act number (0 = setup, 1..5 acts, 6 = Show Day) for any script index. */
export function actOf(index: number): number {
  for (let i = index; i >= 0; i--) {
    const s = SCRIPT[i];
    if ('act' in s) return s.act;
    if (s.kind === 'pitch' || s.kind === 'awards' || s.kind === 'end') return 6;
    if (s.kind.startsWith('setup') || s.kind === 'lobby') return 0;
  }
  return 0;
}
/** Plain act name without emoji. */
export function actLabel(act: number): string {
  if (act === 0) return 'Setup';
  const r = RECIPE.find(x => x.act === act);
  return r ? (act === 6 ? r.name : `Act ${act} · ${r.name}`) : '';
}

export function fmtTime(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export const SHAPES = ['●', '■', '▲', '★'];
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
export const coinTag = (c: number) => (c === 0 ? 'Free' : `${signed(c)} coins`);

export const teamLabel = (t?: Team | null) => (t?.name?.trim() ? t.name.trim() : 'a team');
export const isDefaultName = (n: string) => !n.trim() || /^Team \d+$/.test(n.trim());

// ---------- Host coaching: what to say, what to check, what kids ask, and the one thing to do now ----------
export interface HostNotes {
  /** What to talk about (short bullets). */
  say: string[];
  /** Questions to check the kids understand. */
  ask: string[];
  /** Common kid doubts with simple answers. */
  doubts: { q: string; a: string }[];
  /** What to watch for in the room. */
  watch: string[];
  /** The one thing to do right now (matches the big button). */
  doNow: string;
}

export interface Guide {
  notes: HostNotes;
  /** Exact label of the big bottom button. */
  label: string;
  disabled?: boolean;
  /** Action the big button sends. Default is NEXT. */
  action?: Action;
}

const N = (p: Partial<HostNotes> & Pick<HostNotes, 'say' | 'doNow'>): HostNotes => ({ ask: [], doubts: [], watch: [], ...p });
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
/** “+10 customers, +6 happiness” for a ticket (coins are never part of a ticket's gain). */
const ticketGain = (d: { customers: number; happiness: number }) =>
  [d.customers && `${signed(d.customers)} customers`, d.happiness && `${signed(d.happiness)} happiness`].filter(Boolean).join(', ');

export function guide(state: GameState): Guide {
  const step = currentStep(state);
  const st = state.step;
  const teams = state.teams;
  const upcoming = SCRIPT[state.stepIndex + 1];
  const goNext = upcoming ? `Next: ${stepTitle(upcoming)}` : 'Finish';
  const nm = (i: number) => teamLabel(teams[i]);

  switch (step.kind) {
    case 'lobby':
      return {
        notes: N({
          say: [
            'Welcome the kids to Techistan. The game is a startup race: build a company in 5 steps.',
            'Fibbot is the villain: a fibbing, copying, cheating robot. Honest, smart startups beat him.',
          ],
          ask: ['What do you think a startup does?'],
          doubts: [{ q: 'Is Fibbot real?', a: 'No, he is a game character. The lesson about copying and cheating is real.' }],
          watch: ['Kids who join late. They can add their name on the big screen.'],
          doNow: 'Start the game when the room is ready.',
        }),
        label: 'Start the game',
      };

    case 'scene': {
      const c = SCENE_COACH[step.sceneId];
      return { notes: N({ ...c, doNow: 'Let Bolt finish the story, or skip it.' }), label: goNext };
    }

    case 'setup_players': {
      const n = state.players.length, need = state.settings.teamCount;
      return {
        notes: N({
          say: [
            'Type every kid’s name. Each kid picks a class from 5 to 10.',
            'Class is only used to mix the teams evenly. It does not change any score.',
            `You need at least ${need} players for ${need} teams. Teams work best with 4 or 5 kids each.`,
          ],
          ask: ['Why do we mix classes in each team?'],
          doubts: [{ q: 'Does my class help my team win?', a: 'No. Class only helps mix the teams, so every team starts fair.' }],
          watch: ['Typos in names. Read them back with the kids.'],
          doNow: n < need ? `Add ${need - n} more ${need - n === 1 ? 'player' : 'players'} first.` : 'Add everyone, then move on.',
        }),
        label: n < need ? `Need ${need - n} more ${need - n === 1 ? 'player' : 'players'}` : 'Next: make teams',
        disabled: n < need,
      };
    }

    case 'setup_teams': {
      const count = state.settings.teamCount, n = state.players.length;
      if (teams.length === 0) {
        return {
          notes: N({
            say: [
              'Teams are made with a mix of classes 5 to 10, so no team is all older or all younger.',
              'Teams have 3 to 5 kids. 4 or 5 is the sweet spot.',
            ],
            ask: ['Who in your team likes talking? Who likes building?'],
            doubts: [{ q: 'Can we pick our own team?', a: 'Teams are mixed on purpose so every team is fair. Make the most of your team.' }],
            watch: ['A team with fewer than 3 kids.'],
            doNow: n < count ? 'Go back and add more players.' : `Make the ${count} teams.`,
          }),
          label: n < count ? 'Not enough players' : `Make ${count} teams`,
          disabled: n < count,
          action: { type: 'MAKE_TEAMS', teams: makeTeams(state.players, count) },
        };
      }
      return {
        notes: N({
          say: ['The teams are made. Each one has a mix of classes.', 'Shuffle if the kids want a different mix. Otherwise move on.'],
          ask: ['How many kids are in your team?'],
          watch: ['Kids who look unhappy with their team. Mixing is fair, so help them get on with it.'],
          doNow: `Next: pick roles for the ${plural(teams.length, 'team')}.`,
        }),
        label: 'Next: pick roles',
      };
    }

    case 'setup_roles':
      return {
        notes: N({
          say: [
            'Every kid gets one job. CEO has the final say after the team talks. Money Manager watches the coins and bids in the auction.',
            'Lock Master taps the team’s choice and locks it. Speaker answers at Mic Time and gives the final pitch. Timekeeper watches the timer.',
            'In a team of 3, the CEO and Money Manager are the same kid.',
          ],
          ask: ['What does the CEO do after the team talks?', 'Why should the Lock Master wait for the whole team?'],
          doubts: [{ q: 'Can one kid have two jobs?', a: 'Yes, in a team of 3 the CEO and Money Manager are one kid.' }],
          watch: ['A kid with no job. Make sure every kid has one.'],
          doNow: 'Let teams pick their jobs, or fill them in for them.',
        }),
        label: 'Next: spin for products',
      };

    case 'setup_products': {
      const left = teams.filter(t => !t.productId).length;
      return {
        notes: N({
          say: [
            'Each team spins for its product. No two teams get the same product.',
            'Every product has one clear job: what it does, what one sale is, and what it costs to make.',
          ],
          ask: ['What does your product do for customers?'],
          doubts: [{ q: 'Can we pick our product ourselves?', a: 'The wheel makes it fair. Every product can win.' }],
          watch: ['Teams that do not like their product. Remind them that every product has a chance.'],
          doNow: left ? `Spin for the ${plural(left, 'team')} still waiting.` : 'Move on, every team has a product.',
        }),
        label: left ? `${plural(left, 'team')} still to spin` : 'Next: name the teams',
        disabled: left > 0 || teams.length === 0,
      };
    }

    case 'setup_names': {
      const named = teams.filter(t => !isDefaultName(t.name)).length;
      return {
        notes: N({
          say: [
            'Ask each team for its name. The name shows on the big screen all game.',
            'The ideas are only there if a team is stuck. The name should be the team’s own.',
          ],
          ask: ['What does your startup do? Does your name tell people?'],
          doubts: [{ q: 'Can we change our name later?', a: 'Yes. The host can rename the team at any time.' }],
          watch: ['Rude or silly names. Ask for a name everyone is happy to say out loud.'],
          doNow: named === teams.length ? 'Every team has a name. Move on.' : `Type each team’s name. ${named} of ${teams.length} named.`,
        }),
        label: goNext,
      };
    }

    case 'question':
    case 'price': {
      if (st.type !== 'question' && st.type !== 'price') break;
      const isQ = step.kind === 'question';
      const c = isQ ? QUESTION_COACH[step.qId] : PRICE_COACH;
      const topic = isQ ? QUESTIONS[step.qId].title : 'Price It Right: pick the price for your product';
      const talkTime = `${TALK_MS / 60_000} min`;
      // Before the reveal the notes only help the host guide thinking. The answers and the tricks come after the reveal.
      const hidden = isQ ? PRE_REVEAL : PRICE_PRE_REVEAL;
      switch (st.phase) {
        case 'intro': return {
          notes: N({
            say: [`Read the question out loud: “${topic}”`, `Teams talk for ${talkTime} before they lock.`, ...hidden.say],
            ask: hidden.ask,
            doNow: 'Open choices when every team is ready to talk.',
          }),
          label: isQ ? `Open choices (${talkTime})` : `Open prices (${talkTime})`,
        };
        case 'open': return {
          notes: N({
            say: ['Teams talk, then each Lock Master locks the choice.', ...hidden.say],
            ask: hidden.ask,
            watch: hidden.watch,
            doNow: 'Reveal when every team has locked, or when time is up.',
          }),
          label: isQ ? 'Reveal the answers' : 'Reveal the prices',
        };
        case 'revealed': return {
          notes: N({
            say: ['Explain what each choice did for the teams, one team at a time.', ...c.say],
            ask: c.ask,
            doubts: c.doubts,
            doNow: `Show ${nm(0)}’s result first.`,
          }),
          label: `Show ${nm(0)}’s result`,
        };
        case 'spotlight': return {
          notes: N({
            say: [`Talk to ${nm(st.spotlight)}: what did they choose, and why?`, 'Praise good thinking. When a team fell for a trick, name the trick kindly.'],
            ask: c.ask,
            watch: c.watch,
            doNow: st.spotlight + 1 < teams.length ? `Then go to ${nm(st.spotlight + 1)}.` : 'Then finish the results.',
          }),
          label: st.spotlight + 1 < teams.length ? `Next team: ${nm(st.spotlight + 1)}` : 'Finish the results',
        };
        default: return { notes: N({ say: ['All results are shown.'], doNow: 'Move on to the next step.' }), label: goNext };
      }
    }

    case 'megaorder': {
      if (st.type !== 'megaorder') break;
      const soloName = st.solo ? teamLabel(teams.find(t => t.id === st.solo)) : '';
      const soloSay = st.solo ? [`${soloName} has no partner this time. It gets its own mini order and does not lock.`] : [];
      switch (st.phase) {
        case 'intro': return {
          notes: N({
            say: [...MEGA_COACH.say, ...soloSay],
            ask: MEGA_COACH.ask,
            doubts: MEGA_COACH.doubts,
            doNow: 'Start the pair talk (5 min).',
          }),
          label: `Start the pair talk (${PAIR_TALK_MS / 60_000} min)`,
        };
        case 'open': return {
          notes: N({ say: ['Pairs agree first, then each team locks one choice.', ...soloSay], watch: MEGA_COACH.watch, doNow: 'Reveal the deals when the pairs are ready.' }),
          label: 'Reveal the deals',
        };
        case 'revealed': return { notes: N({ say: ['Explain each deal: what each team gave up, and what each team got.', 'Ask the pairs why they chose what they did.'], doNow: 'Show the first pair.' }), label: 'Show the first pair' };
        case 'spotlight': return {
          notes: N({ say: ['Talk about the pair: was the deal fair? Did they agree?'], ask: MEGA_COACH.ask, doNow: st.spotlight + 1 < st.pairs.length ? 'Then show the next pair.' : 'Then finish the results.' }),
          label: st.spotlight + 1 < st.pairs.length ? `Show pair ${st.spotlight + 2}` : 'Finish the results',
        };
        default: return { notes: N({ say: ['All pairs are shown.', ...soloSay], doNow: 'Move on to the next step.' }), label: goNext };
      }
    }

    case 'bugsmash': {
      if (st.type !== 'bugsmash') break;
      const who = nm(st.turn);
      if (st.phase === 'intro') return {
        notes: N({
          say: [
            'Each team smashes Fibbot’s bugs for 15 seconds on the big screen.',
            'Smash more bugs, and fewer bugs reach customers. Under 10 bugs and customers get grumpy. 30 or more and customers love it.',
            'Teams that tested with 5 friends get 5 more seconds.',
          ],
          ask: ['Why do fewer bugs make customers happier?', 'What did testing with friends give the team?'],
          doubts: [{ q: 'What if the screen glitches?', a: 'Type the bug count yourself. The team still gets its points.' }],
          watch: ['A team that is not ready. Wait for them before you press START.'],
          doNow: 'Start the first turn.',
        }),
        label: 'Start the first turn',
      };
      if (st.phase === 'done') return { notes: N({ say: ['Every team has played.'], doNow: 'Move on to the next step.' }), label: goNext };
      if (st.turnPhase === 'ready') return {
        notes: N({
          say: [`Call on ${who} (turn ${st.turn + 1} of ${teams.length}). Their Lock Master presses START on the big screen.`],
          watch: ['Teams that rush the press. Let them settle first.'],
          doNow: `Ask ${who}’s Lock Master to press START.`,
        }),
        label: `Start ${who}’s round`,
        action: { type: 'BUG_START' },
      };
      if (st.turnPhase === 'playing') return {
        notes: N({ say: ['Cheer them on, but do not give hints.', 'Bugs keep coming, so every smash counts.'], doNow: 'Wait for the round to finish.' }),
        label: 'Round in progress',
        disabled: true,
      };
      const n = st.results[teams[st.turn]?.id ?? ''];
      return {
        notes: N({
          say: [`Tell ${who} what its ${n ?? 0} smashed bugs mean: fewer bugs reach customers, so a smoother product.`, 'Name the effect on happiness and customers, and why.'],
          doNow: st.turn + 1 < teams.length ? `Then go to ${nm(st.turn + 1)}.` : 'Then finish Bug Smash.',
        }),
        label: st.turn + 1 < teams.length ? `Next team: ${nm(st.turn + 1)}` : 'Finish Bug Smash',
      };
    }

    case 'auction': {
      if (st.type !== 'auction') break;
      const tk = st.tickets[st.ticket];
      const top = st.bid.by === 'fibbot' ? 'Fibbot' : teamLabel(teamById(state, st.bid.by));
      const last = st.ticket + 1 >= st.tickets.length;
      const rules = [
        `Bidding starts at ${AUCTION_OPEN} coins and goes up in steps of ${AUCTION_STEP}.`,
        `Every team keeps ${AUCTION_RESERVE} coins in reserve. Nobody can bid their last ${AUCTION_RESERVE} coins.`,
        'Fibbot bids too, by himself. He wins about half the tickets. Nobody knows his limit, not even you.',
      ];
      if (st.phase === 'intro') return {
        notes: N({
          say: [
            `${plural(st.tickets.length, 'ad ticket')} for sale, one at a time. Each ticket brings the winner customers and happiness, not coins.`,
            ...st.tickets.map(t => `${t.title}: ${ticketGain(t.deltas)}.`),
            ...rules,
          ],
          ask: ['Why is it smart to keep some coins?', 'Which ticket brings the most customers?'],
          doubts: [
            { q: 'Can Fibbot win?', a: 'Yes. Sometimes he wins. When he does not, a team can win for less than its limit.' },
            { q: 'Can one team win two tickets?', a: 'No. Each team wins only one ticket.' },
          ],
          watch: ['Teams that spend everything on the first ticket. Ask what the next steps will cost.'],
          doNow: 'Open bidding.',
        }),
        label: 'Open bidding',
      };
      if (st.phase === 'bidding') return {
        notes: N({
          say: [
            `Ticket “${tk.title}” is up for sale.`,
            'A team says its bid out loud, then the host enters it. Fibbot may raise on his own after a team bids.',
            ...rules.slice(0, 2),
          ],
          watch: ['Teams that are out of coins. They cannot bid any more.'],
          doNow: 'When nobody bids more, tap SOLD.',
        }),
        label: `SOLD to ${top}, ${st.bid.amount} coins`,
      };
      if (st.phase === 'sold') return {
        notes: N({
          say: [
            st.bid.by === 'fibbot' ? 'Fibbot won this ticket. Nobody gets it.' : `${top} won the ticket and paid ${st.bid.amount} coins.`,
            'The coins paid do not come back. That is how a real auction works.',
          ],
          doNow: last ? 'Then finish the auction.' : 'Then sell the next ticket.',
        }),
        label: last ? 'Finish the auction' : `Next ticket (${st.ticket + 2} of ${st.tickets.length})`,
      };
      return { notes: N({ say: ['The auction is over.'], doNow: 'Move on to the next step.' }), label: goNext };
    }

    case 'mood': {
      if (st.type !== 'mood') break;
      const checks = step.act === 2 ? 'This check looks at Acts 1 and 2.' : 'This check looks at all 5 acts. Later acts count double.';
      const base = N({
        say: [
          'This check happens only twice: after Act 2 and after Act 5.',
          'Customers who are NOT happy get bored and leave. Very happy customers bring their friends.',
          'It depends on the team’s own decisions. Each team is looked at on its own.',
          checks,
        ],
        ask: ['Why do unhappy customers leave, even after we won them?', 'Why do happy customers bring friends?'],
        doubts: [{ q: 'We won lots of customers but still lost some. Why?', a: 'Winning customers is not enough. If they are not happy, they leave.' }],
        watch: ['Teams that are surprised. Read the reason out loud for them.'],
        doNow: 'Start the mood check.',
      });
      if (st.phase === 'intro') return { notes: base, label: 'Start the mood check' };
      if (st.phase === 'team') return {
        notes: N({ ...base, say: [`Go to ${nm(st.index)}. Read its reason out loud, then let it land before you go on.`, ...base.say.slice(0, 2)], doNow: 'Read the reason, then go on.' }),
        label: st.index + 1 < teams.length ? `Skip ahead to ${nm(st.index + 1)}` : 'Skip to the leaderboard',
      };
      return { notes: N({ say: ['All teams have been shown.'], doNow: 'Move on to the next step.' }), label: goNext };
    }

    case 'mic': {
      if (st.type !== 'mic') break;
      const act = step.act;
      const topic = MIC_TOPIC[act] ?? 'What did your team learn so far?';
      const ask = [MIC_ASK[act] ?? 'What did your team learn so far?'];
      // Acts 1 and 3: Bolt's question depends on what the team chose. Act 4 always asks the same thing.
      const choiceBased = act !== 4;
      const shared = {
        say: [
          `Bolt’s question is about: ${topic}.`,
          choiceBased
            ? 'The question depends on the team’s own choices. If the team fell for a trick, Bolt asks why it was risky. If the team made a good choice, Bolt asks why it was a good idea.'
            : 'Every team gets the same question this act.',
        ],
        ask,
        doubts: [{ q: 'What if the Speaker does not know?', a: 'The team can help. Let them think it through together.' }],
      };
      if (st.phase === 'spin') return {
        notes: N({ ...shared, say: [...shared.say, 'Each team gets a turn before any team goes twice.'], watch: ['A team that has not had a turn yet.'], doNow: 'Wait for the wheel. If it is stuck, pick a team yourself.' }),
        label: 'Waiting for the wheel',
        disabled: true,
      };
      if (st.phase === 'picked') {
        const team = teams.find(t => t.id === st.teamId);
        // The exact question this team gets (its own choice decides it in acts 1 and 3).
        const q = team && choiceBased ? micQuestionFor(team, act) : (MIC_ASK[act] ?? topic);
        return {
          notes: N({
            ...shared,
            say: [`Bolt asks ${teamLabel(team)}: “${q}”`, 'Let the Speaker answer in their own words. The team can help.', 'Ask one follow-up if the answer is short.'],
            ask: [q],
            watch: ['A short answer. Ask “why?” once to help them go further.'],
            doNow: 'When they are done, tap Done talking.',
          }),
          label: 'Done talking',
        };
      }
      return { notes: N({ say: ['Give a clap for a good answer.'], doNow: 'Move on to the next step.' }), label: goNext };
    }

    case 'board': {
      if (step.recap) return {
        notes: N({
          say: [
            'A quick recap of Acts 1 to 3: what each team did, and what it earned.',
            'Ask each team for its biggest choice so far, good or tricky.',
            'Which meter grew the most? Which one needs help?',
          ],
          ask: ['What would you do again, and what would you change?'],
          doubts: [{ q: 'Can we change old choices now?', a: 'No. The game keeps what happened. Use it to learn for the next acts.' }],
          watch: ['Kids who went quiet. Give them a turn.'],
          doNow: 'Tell the recap, then take the break.',
        }),
        label: goNext,
      };
      return {
        notes: N({
          say: [
            'Coins are the money box. Customers and happiness are the people side. Success mixes all three.',
            'Success = (customers + happiness) x coins / 280, capped at 100. Stages: Tiny Stall (0 to 25), Busy Shop (26 to 50), Big Office (51 to 75), Sky Tower (76 to 100).',
            'Talk about who is ahead and why, not only the number.',
          ],
          ask: ['Which team has the most coins? Does that mean it is winning?'],
          doubts: [{ q: 'Why are we not top when we have the most customers?', a: 'Success multiplies customers plus happiness by coins. A team needs all three.' }],
          watch: ['Teams that feel far behind. Show them the one meter they can grow fastest.'],
          doNow: 'Talk about the leaders, then move on.',
        }),
        label: goNext,
      };
    }

    case 'progress':
      return {
        notes: N({
          say: [
            `End of Act ${step.act}. Take a moment: what did this act teach us?`,
            'Each act builds on the last one. Every team can still change its story.',
            'Want a full-screen pause? Turn on Progress view in More. It pauses the game while it is on.',
          ],
          ask: ['What is one thing your team learned in this act?'],
          doubts: [{ q: 'Are we too far behind to win?', a: 'No. Every act and Show Day gives new chances.' }],
          watch: ['Teams that feel stuck. Ask what they can grow next.'],
          doNow: 'When the room is ready, go to the next step.',
        }),
        label: goNext,
      };

    case 'break':
      return {
        notes: N({
          say: ['Break time. Nothing is scored.', 'Take a breath. Walk around, stretch, and get some water.', 'When the break ends, we look back at what happened so far.'],
          ask: ['What was your team’s best move so far?'],
          doubts: [{ q: 'Can we change our answers during the break?', a: 'No. Scores stay as they are.' }],
          watch: ['Tired kids. Keep the break short.'],
          doNow: 'End the break when the room is ready.',
        }),
        label: 'End the break',
      };

    case 'pitch': {
      if (st.type !== 'pitch') break;
      const p = teams[st.index];
      if (!p) return { notes: N({ say: ['There are no teams to pitch.'], doNow: 'Move on.' }), label: goNext };
      const shared = {
        say: [
          'Each team gets 45 seconds to pitch on the big stage. The Speaker gives the pitch.',
          'A good pitch says: the problem you solve, what your product does, and why customers love it.',
          'Other teams then give 1 to 5 stars. 1 is a quiet clap, 5 is a standing ovation.',
        ],
        ask: ['What problem does your startup solve?', 'What makes a pitch easy to follow?'],
        doubts: [
          { q: 'Can we vote for ourselves?', a: 'No. A team only gives stars to the other teams.' },
          { q: 'What if our Speaker is shy?', a: 'The team can help, but the Speaker gives the pitch.' },
        ],
      };
      if (st.phase === 'ready') return {
        notes: N({ ...shared, say: [`Call on ${p.name} (pitch ${st.index + 1} of ${teams.length}). Their Speaker goes up.`, ...shared.say], watch: ['A nervous Speaker. A clap first helps.'], doNow: `Start the ${PITCH_MS / 1000}-second clock.` }),
        label: `Start ${PITCH_MS / 1000}s timer`,
      };
      if (st.phase === 'talking') return {
        notes: N({ say: [`${p.name} is pitching. Keep the room quiet.`, 'Watch the clock, and be ready to call time.'], doNow: 'Stop the pitch when time is up.' }),
        label: 'Stop the pitch, go to votes',
      };
      if (st.phase === 'voting') return {
        notes: N({
          say: [`Each other team gives ${p.name} 1 to 5 stars. Read the stars out loud, then enter them.`, 'The average stars decide the Best Pitch award.'],
          ask: shared.ask,
          watch: ['Teams that give everyone 5 stars. Ask them to think about what they heard.'],
          doNow: st.index + 1 < teams.length ? `Then go to ${nm(st.index + 1)}.` : 'Then finish the pitches.',
        }),
        label: st.index + 1 < teams.length ? `Next team: ${nm(st.index + 1)}` : 'Finish the pitches',
      };
      return { notes: N({ say: ['All pitches are done.'], doNow: 'Move on to the next step.' }), label: goNext };
    }

    case 'awards': {
      if (st.type !== 'awards') break;
      const nxt = st.results[st.reveal];
      const shared = N({
        say: [
          'Five awards, revealed from 5 to 1: Banana Peel, Best Pitch, Customer Hero, Happiness Hero and Ultimate Champion.',
          'Banana Peel goes to the startup that slipped the most, and still smiled. The Champion has the best Success score.',
        ],
        ask: ['Which meter mattered most for the champion: customers, happiness or coins?'],
        doubts: [{ q: 'We won another award. Why are we not the champion?', a: 'Each award is for one thing. The champion is the best overall Success score.' }],
        watch: ['Keep the suspense. The winners list is for you only, so do not show it early.'],
        doNow: nxt ? `Reveal award #${nxt.rank} next.` : 'Congratulate the champion.',
      });
      return nxt
        ? { notes: shared, label: `Reveal award #${nxt.rank}` }
        : { notes: N({ ...shared, say: ['All five awards are out. Congratulate the champion.'], doNow: 'Finish the awards.' }), label: 'Finish' };
    }

    case 'end':
      return {
        notes: N({
          say: ['That is a wrap. Thank everyone for playing.', 'Praise the honest choices the teams made.'],
          ask: ['What will you remember from the game?', 'What will you do differently next time?'],
          doubts: [{ q: 'Can we play again?', a: 'Yes. Start a new game from More, in the Danger zone.' }],
          watch: ['Kids who are sad they did not win. Name one good move they made.'],
          doNow: 'Thank everyone. The game is over.',
        }),
        label: 'The game is over',
        disabled: true,
      };
  }
  return { notes: N({ say: ['Tap the big button to continue.'], doNow: 'Tap the big button.' }), label: goNext };
}
