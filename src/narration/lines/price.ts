// Price It Right narration (Act 4): intro, whispered tip, reveal, one spotlight per team, cash box check.
// Also home of the "shoppers" maths the screen uses to show WHY each of the 10 customers bought or walked away.
import { buyersAt, productById } from '../../game/content';
import type { GameState, PriceOutcome } from '../../game/types';
import type { NarrLine, Narration } from '../types';

// ---------- the 10 customers ----------
export type ShopperReason = 'great' | 'ok' | 'pricey' | 'fibbot';
export interface Shopper { k: number; limit: number; buys: boolean; reason: ShopperReason }

export const REASON_TEXT: Record<ShopperReason, string> = {
  great: 'Great deal!',
  ok: 'Okay price',
  pricey: 'Too expensive',
  fibbot: 'Fibbot’s copy is cheaper',
};

/**
 * Customer k (1..10) is willing to pay up to 1.8 x fair - 1.2 x fair x (k - 0.5) / 10, so customer 1 is the easiest to please and
 * customer 10 the hardest. This is exactly the maths behind buyersAt(): customer k buys when k <= buyersAt(price), so the faces on
 * screen always add up to the real number of buyers.
 */
export function shoppersAt(p: { fair: number; rival: number }, price: number): Shopper[] {
  const buyers = buyersAt(p, price);
  return Array.from({ length: 10 }, (_, i) => {
    const k = i + 1;
    const limit = 1.8 * p.fair - (1.2 * p.fair * (k - 0.5)) / 10;
    const buys = k <= buyers;
    const reason: ShopperReason = buys
      ? (limit - price >= 0.3 * p.fair ? 'great' : 'ok')
      : (price > p.rival && limit >= p.rival ? 'fibbot' : 'pricey');
    return { k, limit, buys, reason };
  });
}

// ---------- words ----------
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
const rs = (n: number) => (n < 0 ? `−₹${-n}` : `₹${n}`);
const flair = { right: 'Perfect price!', close: 'Nearly perfect!', high: 'That is a high price.', low: 'That is a very low price.' } as const;

function spotlightLines(name: string, unit: string, o: PriceOutcome, verdict: keyof typeof flair, coins: number, customers: number, happiness: number, fibbotWalkers: number): { lines: NarrLine[]; summary: string } {
  const walked = o.interested - o.buyers;
  const earn = o.profitPerUnit;
  const eachSale = earn > 0 ? `each sale earns ₹${earn}` : earn < 0 ? `each sale LOSES ₹${-earn}` : 'each sale earns nothing';
  const sold = o.buyers === 0 ? 'Nobody bought it.' : walked === 0 ? 'All 10 people bought!' : `${o.buyers} of 10 people bought and ${walked} walked away${fibbotWalkers > 0 ? `, ${fibbotWalkers === 1 ? 'one' : fibbotWalkers} of them to Fibbot’s cheaper copy` : ''}.`;
  const total = o.totalProfit;
  const money = o.buyers === 0
    ? 'No sales means no profit, so no new coins.'
    : earn < 0
      ? `${o.buyers} sales losing ₹${-earn} each is ₹${-total} lost, so ${Math.abs(coins)} coins leave your coin box.`
      : earn === 0
        ? `${o.buyers} sales earning nothing each, so no new coins.`
        : `${o.buyers} sales times ₹${earn} is ₹${total}, so ${coins} coins go into your coin box.`;
  const cust = customers > 0 ? `${customers} more customers, because more than 4 people bought.` : customers < 0 ? `${-customers} fewer customers, because fewer than 4 people bought.` : 'Exactly 4 people bought, so your customers stay the same.';
  const happy = happiness > 0 ? 'A fair price makes people happy.' : happiness < 0 ? 'A greedy price makes people grumpy.' : 'Happiness stays the same.';
  return {
    lines: [
      { text: `${name} priced ${unit} at ₹${o.price}. ${flair[verdict]}`, tone: verdict === 'right' ? 'excited' : 'normal', pose: verdict === 'right' ? 'cheer' : verdict === 'close' ? 'talk' : 'think' },
      { text: `One costs ₹${o.cost} to make, so ${eachSale}. ${sold}`, gap: 600 },
      { text: money, gap: 600, tone: 'normal' },
      { text: `${cust} ${happy}`, gap: 900 },
    ],
    summary: `${rs(earn)} × ${o.buyers} sales = ${rs(total)}. Coins ${signed(coins)}, customers ${signed(customers)}, happiness ${signed(happiness)}.`,
  };
}

export function priceNarration(s: GameState): Narration | null {
  const st = s.step;
  if (st.type !== 'price') return null;

  if (st.phase === 'intro') {
    return {
      id: 'price-intro',
      lines: [
        { text: 'Welcome to the money act! Every team now sets a price for what it sells.', tone: 'excited', pose: 'wave', gap: 700 },
        { text: 'Your product card shows what ONE sale is, and what it costs you to make one.', pose: 'point', gap: 700 },
        { text: 'Slide to pick your price. Too high, and people walk away. Too low, and you earn almost nothing on each sale.', pose: 'talk', gap: 900 },
        { text: 'Each sale puts coins in your coin box. Coins are your team’s money. Customers and happiness are your two big scores: a good price wins customers and keeps them happy.', pose: 'think', gap: 900 },
        { text: 'Talk it over as a team. Then tap your team again to lock your price.', pose: 'point', gap: 600 },
      ],
      summary: 'Pick a price for ONE product. Too high, people leave. Too low, you earn nothing. Sales fill your coin box.',
    };
  }

  if (st.phase === 'open') {
    const all = s.teams.length > 0 && Object.keys(st.locks).length >= s.teams.length;
    if (all) {
      return { id: 'price-all-set', showText: false, lines: [{ text: 'All prices are set! Let’s see how the customers like them.', tone: 'calm', pose: 'cheer' }] };
    }
    return {
      id: 'price-open',
      showText: false,
      lines: [{ text: 'Psst, here is a secret. Think of what one costs you to make, then what a customer would happily pay.', tone: 'whisper', pose: 'think' }],
    };
  }

  if (st.phase === 'revealed') {
    return {
      id: 'price-revealed',
      mascot: 'fibbot',
      lines: [{ text: 'Hehehe! The price tags are out. My copies are cheaper than yours, so watch out for your customers!', tone: 'villain' }],
    };
  }

  if (st.phase === 'spotlight') {
    const team = s.teams[st.spotlight];
    if (!team) return null;
    const id = `price-spot-${st.spotlight}-${team.id}`;
    const o = st.outcomes[team.id];
    const prod = productById(team.productId);
    if (!o || !prod) {
      return { id, lines: [{ text: `${team.name} fell asleep and forgot to set a price. No price, no sales!`, tone: 'normal', pose: 'sad' }] };
    }
    const d = st.pending[team.id] ?? { coins: 0, customers: 0, happiness: 0 };
    const fibbotWalkers = shoppersAt(prod, o.price).filter(x => x.reason === 'fibbot').length;
    const { lines, summary } = spotlightLines(team.name, prod.unit, o, st.verdict[team.id] ?? 'low', d.coins, d.customers, d.happiness, fibbotWalkers);
    return { id, lines, summary };
  }

  // done: the leaderboard moment
  return { id: 'price-done', showText: false, lines: [{ text: 'Cash box check! Let’s see who has the most coins now.', tone: 'excited', pose: 'cheer' }] };
}
