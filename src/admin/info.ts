import { PAIR_TALK_MS, PITCH_MS, RECIPE, SCENES, SCRIPT, TALK_MS } from '../game/content';
import { currentStep } from '../game/engine';
import { makeTeams, memberWithRole } from '../game/helpers';
import type { Action, GameState, Step, Team } from '../game/types';

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
    case 'board': return 'Leaderboards';
    case 'break': return 'Snack break';
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

// ---------- What is happening, what to do, and what the big button does ----------
export interface Guide {
  /** One plain sentence or two: what is happening and what the host should do. */
  say: string;
  /** Exact label of the big bottom button. */
  label: string;
  disabled?: boolean;
  /** Action the big button sends. Default is NEXT. */
  action?: Action;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function guide(state: GameState): Guide {
  const step = currentStep(state);
  const st = state.step;
  const teams = state.teams;
  const upcoming = SCRIPT[state.stepIndex + 1];
  const goNext = upcoming ? `Next: ${stepTitle(upcoming)}` : 'Finish';
  const nm = (i: number) => teamLabel(teams[i]);

  switch (step.kind) {
    case 'lobby':
      return { say: 'The title screen is up. Start the game when the room is ready.', label: 'Start the game' };
    case 'scene':
      return { say: 'Bolt is telling the story on the big screen. Tap below when it ends, or to skip it.', label: goNext };

    case 'setup_players': {
      const n = state.players.length, need = state.settings.teamCount;
      return {
        say: n === 0 ? 'No players yet. Type each name below, or let the kids add themselves on the big screen.'
          : n < need ? `${plural(n, 'player')} so far. You need at least ${need} for ${need} teams.`
          : `${plural(n, 'player')} so far. Add everyone, then move on.`,
        label: n < need ? `Need ${need - n} more ${need - n === 1 ? 'player' : 'players'}` : 'Next: make teams',
        disabled: n < need,
      };
    }
    case 'setup_teams': {
      const count = state.settings.teamCount, n = state.players.length;
      if (teams.length === 0) {
        return {
          say: n < count ? 'Not enough players for teams yet. Go back and add more.' : 'Teams are not made yet. Make them here or on the big screen.',
          label: n < count ? 'Not enough players' : `Make ${count} teams`,
          disabled: n < count,
          action: { type: 'MAKE_TEAMS', teams: makeTeams(state.players, count) },
        };
      }
      return { say: `${plural(teams.length, 'team')} made. Tap Shuffle if the kids want a different mix, or move on.`, label: 'Next: pick roles' };
    }
    case 'setup_roles': {
      const lacking = teams.filter(t => t.members.some(m => m.roles.length === 0)).length;
      return {
        say: teams.length === 0 ? 'There are no teams yet. Go back and make teams.'
          : lacking ? `Kids are choosing roles on the big screen. ${plural(lacking, 'team')} still ${lacking === 1 ? 'has' : 'have'} kids without a job.`
          : 'Every kid has a role. Move on when the room is ready.',
        label: 'Next: spin for products',
      };
    }
    case 'setup_products': {
      const left = teams.filter(t => !t.productId).length;
      return {
        say: teams.length === 0 ? 'There are no teams yet. Go back and make teams.'
          : left ? `Each team spins for its product on the big screen. ${left} of ${teams.length} still to spin.`
          : 'Every team has a product. Move on when the room is ready.',
        label: left ? `${plural(left, 'team')} still to spin` : 'Next: name the teams',
        disabled: left > 0 || teams.length === 0,
      };
    }
    case 'setup_names': {
      const named = teams.filter(t => !isDefaultName(t.name)).length;
      return {
        say: teams.length === 0 ? 'There are no teams yet. Go back and make teams.'
          : named === teams.length ? 'Every team has a name. Move on when the room is ready.'
          : `Ask each team for its name and type it here. ${named} of ${teams.length} named.`,
        label: goNext,
      };
    }

    case 'question':
    case 'price': {
      if (st.type !== 'question' && st.type !== 'price') break;
      const what = step.kind === 'price' ? 'Each team picks a price' : 'Each team picks an answer';
      const lockedN = teams.filter(t => st.locks[t.id] !== undefined).length;
      switch (st.phase) {
        case 'intro': return { say: `Bolt is reading it out. ${what} once you open choices.`, label: `Open choices (${TALK_MS / 1000}s timer)` };
        case 'open': return {
          say: lockedN === teams.length ? 'Every team has locked in. Reveal when you are ready.'
            : `${lockedN} of ${teams.length} teams locked. Wait for the rest, or reveal now.`,
          label: step.kind === 'price' ? 'Reveal the prices' : 'Reveal the answers',
        };
        case 'revealed': return { say: 'Everyone’s choices are on the big screen. Now show each team’s result, one by one.', label: `Show ${nm(0)}’s result` };
        case 'spotlight': return {
          say: `Showing ${nm(st.spotlight)} (${st.spotlight + 1} of ${teams.length}).`,
          label: st.spotlight + 1 < teams.length ? `Next team: ${nm(st.spotlight + 1)}` : 'Finish the results',
        };
        default: return { say: 'All results are shown. Time for the next thing.', label: goNext };
      }
    }
    case 'megaorder': {
      if (st.type !== 'megaorder') break;
      const pairTeams = st.pairs.length * 2;
      const lockedN = Object.keys(st.locks).filter(id => id !== st.solo).length;
      const soloName = st.solo ? teamLabel(teams.find(t => t.id === st.solo)) : '';
      const soloNote = st.solo ? ` ${soloName} has no partner this time and gets its own mini order, so it does not lock.` : '';
      switch (st.phase) {
        case 'intro': return { say: `Teams are paired up. Each pair will agree how to share one big order.${soloNote}`, label: `Start the pair talk (${PAIR_TALK_MS / 1000}s timer)` };
        case 'open': return { say: `${lockedN} of ${pairTeams} paired teams locked. Pairs should agree before they lock.${soloNote}`, label: 'Reveal the deals' };
        case 'revealed': return { say: 'All deals are ready. Show them pair by pair.', label: 'Show the first pair' };
        case 'spotlight': return {
          say: `Showing pair ${st.spotlight + 1} of ${st.pairs.length}.`,
          label: st.spotlight + 1 < st.pairs.length ? `Show pair ${st.spotlight + 2}` : 'Finish the results',
        };
        default: return { say: st.solo ? `All pairs are shown. ${soloName} got its own mini order.` : 'All pairs are shown.', label: goNext };
      }
    }
    case 'bugsmash': {
      if (st.type !== 'bugsmash') break;
      if (st.phase === 'intro') return { say: 'Each team gets a turn to smash rAIvan’s bugs on the big screen.', label: 'Start the first turn' };
      if (st.phase === 'done') return { say: 'Every team has played.', label: goNext };
      const who = nm(st.turn);
      if (st.turnPhase === 'ready') return { say: `${who} is up (turn ${st.turn + 1} of ${teams.length}). Their Lock Master taps START on the big screen.`, label: `Start ${who}’s round`, action: { type: 'BUG_START' } };
      if (st.turnPhase === 'playing') return { say: `${who} is smashing bugs right now. The result saves by itself.`, label: 'Round in progress', disabled: true };
      const n = st.results[teams[st.turn]?.id ?? ''];
      return {
        say: `${who} smashed ${n ?? 0} bugs.`,
        label: st.turn + 1 < teams.length ? `Next team: ${nm(st.turn + 1)}` : 'Finish Bug Smash',
      };
    }
    case 'auction': {
      if (st.type !== 'auction') break;
      const tk = st.tickets[st.ticket];
      const top = st.bid.by === 'raivan' ? 'rAIvan' : teamLabel(teams.find(t => t.id === st.bid.by));
      const last = st.ticket + 1 >= st.tickets.length;
      if (st.phase === 'intro') return { say: `${plural(st.tickets.length, 'ticket')} to sell. rAIvan opens every bid at ${st.bid.amount} coins.`, label: 'Open bidding' };
      if (st.phase === 'bidding') return {
        say: `Selling “${tk.title}”. Top bid: ${top}, ${st.bid.amount} coins. Enter new bids below.`,
        label: `Sold to ${top}, ${st.bid.amount} coins`,
      };
      if (st.phase === 'sold') return {
        say: st.bid.by === 'raivan' ? 'rAIvan won it. Nobody gets this ticket.' : `${top} paid ${st.bid.amount} coins for “${tk.title}”.`,
        label: last ? 'Finish the auction' : `Next ticket (${st.ticket + 2} of ${st.tickets.length})`,
      };
      return { say: 'The auction is over.', label: goNext };
    }
    case 'mood': {
      if (st.type !== 'mood') break;
      if (st.phase === 'intro') return { say: 'Customers walk out or dance in, depending on how happy they are. One tap starts it, then the screen goes team by team and ends on the leaderboard. The maths stays hidden from the kids.', label: `Start the mood check (${nm(0)} first)` };
      if (st.phase === 'team') return {
        say: `Showing ${nm(st.index)} (${st.index + 1} of ${teams.length}). The screen moves on by itself every few seconds, you do not need to tap.`,
        label: st.index + 1 < teams.length ? `Skip ahead to ${nm(st.index + 1)}` : 'Skip to the leaderboard',
      };
      return { say: 'All teams have been shown.', label: goNext };
    }
    case 'mic': {
      if (st.type !== 'mic') break;
      if (st.phase === 'spin') return { say: 'A kid spins the wheel on the big screen to pick who talks. Wheel stuck? Pick a team below.', label: 'Waiting for the wheel', disabled: true };
      const team = teams.find(t => t.id === st.teamId);
      const sp = team ? memberWithRole(team, 'speaker') : null;
      if (st.phase === 'picked') return { say: `${teamLabel(team)} answers Bolt’s question. Speaker: ${sp?.name ?? 'not set, ask the team'}.`, label: 'Done talking' };
      return { say: 'Great answer. Give them a clap.', label: goNext };
    }
    case 'board':
      return { say: 'The leaderboards are on the big screen. Talk about who is ahead and why.', label: goNext };
    case 'break':
      return { say: 'Snack time. The screen plays a calm animation until you continue.', label: 'End the break' };
    case 'pitch': {
      if (st.type !== 'pitch') break;
      const p = teams[st.index];
      const sp = p ? memberWithRole(p, 'speaker') : null;
      if (!p) return { say: 'There are no teams to pitch.', label: goNext };
      if (st.phase === 'ready') return { say: `Up next: ${p.name} (pitch ${st.index + 1} of ${teams.length}). Speaker: ${sp?.name ?? 'not set'}.`, label: `Start ${PITCH_MS / 1000}s timer` };
      if (st.phase === 'talking') return { say: `${p.name} is pitching. The clock is on the big screen.`, label: 'Stop the pitch, go to votes' };
      if (st.phase === 'voting') {
        const given = state.votes[p.id] ?? {};
        const voters = teams.filter(t => t.id !== p.id);
        const n = voters.filter(v => given[v.id] !== undefined).length;
        return {
          say: `Each other team shows 1 to 5 stars for ${p.name}. Enter them below. ${n} of ${voters.length} in.`,
          label: st.index + 1 < teams.length ? `Next team: ${nm(st.index + 1)}` : 'Finish the pitches',
        };
      }
      return { say: 'All pitches are done.', label: goNext };
    }
    case 'awards': {
      if (st.type !== 'awards') break;
      const nxt = st.results[st.reveal];
      return nxt
        ? { say: `Award #${nxt.rank} is next (${st.reveal} of ${st.results.length} shown). Build the suspense first.`, label: `Reveal award #${nxt.rank}` }
        : { say: 'All five awards are out. Congratulate the champion.', label: 'Finish' };
    }
    case 'end':
      return { say: 'That is a wrap. Thank the kids!', label: 'The game is over', disabled: true };
  }
  return { say: 'Tap the big button to continue.', label: goNext };
}
