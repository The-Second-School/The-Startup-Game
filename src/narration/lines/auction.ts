// Billboard Auction narration. Ids matter: the screen reads the narrator's progress (useNarr) to time the gavel and the
// "who won what" cards, so keep the line ORDER of `auction-sold-*` and `auction-done` in step with AuctionView.
import { AUCTION_OPEN, AUCTION_RESERVE, AUCTION_STEP } from '../../game/content';
import { maxBid } from '../../game/engine';
import type { AuctionState, AuctionTicket, GameState, Team } from '../../game/types';
import type { Narration, NarrLine } from '../types';

const nameOf = (t: Team | undefined | null) => (t ? t.name.trim() || 'This team' : 'Jhootu');
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "10 new customers and 6 happiness" for a ticket. */
export function prizeText(tk: AuctionTicket): string {
  const parts: string[] = [];
  if (tk.deltas.customers) parts.push(plural(tk.deltas.customers, 'new customer'));
  if (tk.deltas.happiness) parts.push(`${tk.deltas.happiness} happiness`);
  return parts.join(' and ') || 'a nice surprise';
}

/** The line index in `auction-sold-<ticket>` where each beat is spoken (AuctionView reads these). */
export const SOLD_BEAT = { once: 0, twice: 1, sold: 2, who: 3 } as const;

export function auctionNarration(s: GameState): Narration | null {
  const st = s.step as AuctionState;
  if (st.type !== 'auction') return null;
  const team = (id: string) => s.teams.find(t => t.id === id);

  if (st.phase === 'intro') {
    const lines: NarrLine[] = [
      { text: 'Welcome to the Billboard Auction!', tone: 'excited', pose: 'cheer', gap: 1000 },
      { text: 'Each billboard is an ad. Whoever wins it gets the ad. The ad brings new customers and happiness.', tone: 'normal', pose: 'point', gap: 1200 },
      { text: 'Your Money Manager says a number, and the host types it in. The highest bid wins. The winner pays that many coins.', tone: 'normal', pose: 'talk', gap: 1200 },
      { text: 'Jhootu bids too! If he wins, nobody gets the ad.', tone: 'normal', pose: 'shock', gap: 1200 },
      { text: `But keep ${AUCTION_RESERVE} coins safe. You can only bid the coins above ${AUCTION_RESERVE}. Each team can win just one billboard.`, tone: 'normal', pose: 'point', gap: 1000 },
      { text: 'Talk it over with your team, and good luck!', tone: 'cheer', pose: 'cheer' },
    ];
    return { id: 'auction-intro', lines, summary: `Highest bid wins the ad and pays that many coins. Beat Jhootu, keep ${AUCTION_RESERVE} coins safe, one billboard per team.` };
  }

  const tk = st.tickets[st.ticket];

  if (st.phase === 'bidding' && tk) {
    if (st.bidLog.length === 0) {
      const canBid = s.teams.some(t => !Object.values(st.winners).some(w => w.by === t.id) && maxBid(t) >= AUCTION_OPEN + AUCTION_STEP);
      const lines: NarrLine[] = [
        { text: `Billboard ${st.ticket + 1}: the ${tk.title}!`, tone: 'excited', pose: 'point', gap: 700 },
        { text: `The winner gets ${prizeText(tk)}.`, tone: 'normal', gap: 700 },
        canBid
          ? { text: `Bids start at ${AUCTION_OPEN} coins. Who wants it?`, tone: 'excited', pose: 'cheer' }
          : { text: 'No team can bid on this one, so Jhootu keeps it.', tone: 'normal', pose: 'sad' },
      ];
      return { id: `auction-ticket-${st.ticket}`, lines, summary: `Billboard ${st.ticket + 1}: ${tk.title}. Win it for ${prizeText(tk)}. Bids start at ${AUCTION_OPEN}.`, showText: false };
    }
    const log = st.bidLog;
    const last = log[log.length - 1];
    const id = `auction-bid-${st.ticket}-${log.length}`;
    if (last.by === 'fibbot' && log.length >= 2) {
      const mine = log[log.length - 2];
      const who = nameOf(team(mine.by));
      return {
        id,
        lines: [
          { text: `${who} bids ${mine.amount}!`, tone: 'excited', pose: 'point', gap: 1300 },
          { text: `Jhootu says ${last.amount}!`, tone: 'villain', pose: 'shock' },
        ],
        summary: `${who} bid ${mine.amount}, Jhootu says ${last.amount}.`, showText: false,
      };
    }
    const who = nameOf(team(last.by));
    return {
      id,
      lines: [
        { text: `${who} bids ${last.amount}!`, tone: 'excited', pose: 'point', gap: 1400 },
        { text: 'Jhootu gives up!', tone: 'cheer', pose: 'cheer' },
      ],
      summary: `${who} bid ${last.amount} and Jhootu gave up.`, showText: false,
    };
  }

  if (st.phase === 'sold' && tk) {
    const w = st.winners[tk.id];
    const t = w && w.by !== 'fibbot' ? team(w.by) : undefined;
    const lines: NarrLine[] = [
      { text: 'Going once...', tone: 'excited', gap: 500 },
      { text: 'Going twice...', tone: 'excited', gap: 700 },
      { text: 'SOLD!', tone: 'cheer', pose: 'cheer', gap: 400 },
      t && w
        ? { text: `${nameOf(t)} wins the ${tk.title} for ${plural(w.amount, 'coin')}!`, tone: 'cheer', pose: 'cheer', gap: 600 }
        : { text: 'Jhootu keeps it. Nobody gets this ad!', tone: 'villain', pose: 'sad', gap: 600 },
    ];
    if (t) lines.push({ text: `Their startup gets ${prizeText(tk)}!`, tone: 'excited', pose: 'cheer' });
    return { id: `auction-sold-${st.ticket}`, lines, summary: t && w ? `${nameOf(t)} won the ${tk.title} for ${w.amount} coins.` : `Jhootu kept the ${tk.title}.`, showText: false };
  }

  // done: announce every item
  const lines: NarrLine[] = [{ text: 'Sold, sold, sold! Here is who won each billboard.', tone: 'excited', pose: 'cheer', gap: 800 }];
  let kept = 0;
  st.tickets.forEach(x => {
    const w = st.winners[x.id];
    const t = w && w.by !== 'fibbot' ? team(w.by) : undefined;
    if (t && w) lines.push({ text: `The ${x.title} goes to ${nameOf(t)} for ${plural(w.amount, 'coin')}!`, tone: 'cheer', pose: 'cheer', gap: 700 });
    else { kept++; lines.push({ text: `Jhootu kept the ${x.title}. Nobody got it!`, tone: 'villain', pose: 'sad', gap: 700 }); }
  });
  lines.push({
    text: kept === 0 ? 'Every billboard found a winner. Your meters are updated!' : kept === st.tickets.length ? 'Jhootu kept them all this time. Next time, bid bigger!' : 'The winners paid coins and got their customers. Your meters are updated!',
    tone: 'normal', pose: 'point',
  });
  const won = st.tickets.length - kept;
  return { id: 'auction-done', lines, summary: `${plural(won, 'billboard')} won by teams, ${kept} kept by Jhootu. Winners paid coins and got customers.` };
}
