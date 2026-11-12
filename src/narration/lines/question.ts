import { currentStep } from '../../game/engine';
import { isSecretStep, BONUS_WHY, MEGA, QUESTIONS, WHY, WHY_ELSE } from '../../game/content';
import type { Deltas, GameState, MegaState, QuestionState } from '../../game/types';
import type { NarrLine, Narration } from '../types';
import { priceNarration } from './price';

/** Question + Mega Order narration lives here (question agent). Price It Right is delegated to price.ts (price agent). */
export function questionNarration(s: GameState): Narration | null {
  const step = currentStep(s);
  if (step.kind === 'price') return priceNarration(s);
  if (step.kind === 'question' && s.step.type === 'question') return choiceNarration(s, step.qId, step.id, s.step);
  if (step.kind === 'megaorder' && s.step.type === 'megaorder') return megaNarration(s, step.id, s.step);
  return null;
}

// ---------- shared helpers (the views use these too, so the screen and the voice always agree) ----------

/** Kid-simple reason WHY this option changed the meters (the word-of-mouth option has a second reason). */
export function whyText(qId: string, idx: number, d?: Deltas): string {
  const o = QUESTIONS[qId]?.options[idx];
  if (o && d && o.elseCustomers !== undefined && o.elseCustomers !== o.customers && d.customers === o.elseCustomers) {
    const e = WHY_ELSE[`${qId}_${idx}`];
    if (e) return e;
  }
  return WHY[qId]?.[idx] ?? '';
}

/** "3 more customers, happiness up by 7 and 10 coins spent": the headline change, in words. */
export function headline(d: Deltas): string {
  const parts: string[] = [];
  if (d.customers > 0) parts.push(`${d.customers} more ${d.customers === 1 ? 'customer' : 'customers'}`);
  if (d.customers < 0) parts.push(`${-d.customers} ${d.customers === -1 ? 'customer' : 'customers'} left`);
  if (d.happiness > 0) parts.push(`happiness up by ${d.happiness}`);
  if (d.happiness < 0) parts.push(`happiness down by ${-d.happiness}`);
  if (d.coins > 0) parts.push(`${d.coins} coins earned`);
  if (d.coins < 0) parts.push(`${-d.coins} coins spent`);
  if (!parts.length) return 'nothing changed';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

const score = (d: Deltas) => d.customers + d.happiness + d.coins / 10;
const toneFor = (d: Deltas): NarrLine['tone'] => (score(d) >= 5 ? 'excited' : score(d) < 0 ? 'calm' : 'normal');
const upFirst = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const ZERO: Deltas = { coins: 0, customers: 0, happiness: 0 };

// ---------- multiple choice question ----------

function choiceNarration(s: GameState, qId: string, stepId: string, st: QuestionState): Narration | null {
  const q = QUESTIONS[qId];
  if (!q) return null;
  const teams = s.teams;
  switch (st.phase) {
    case 'intro':
      return null; // the intro animation narrates itself

    case 'open': {
      const allLocked = teams.length > 0 && teams.every(t => st.locks[t.id] !== undefined);
      if (allLocked) {
        return { id: `${stepId}-locked`, showText: false, lines: [{ text: 'Everyone is locked in! Waiting for the reveal.', tone: 'calm', pose: 'think' }] };
      }
      const tip = q.sub && /^tip/i.test(q.sub) ? q.sub : null;
      const ask = q.sub && !tip ? ` ${q.sub}` : '';
      const lines: NarrLine[] = [{ text: `${q.title}${ask}`, pose: 'talk', gap: tip ? 700 : 450 }];
      if (tip) lines.push({ text: tip, say: `Psst. ${tip}`, tone: 'whisper', pose: 'think' });
      if (isSecretStep(stepId)) lines.push({ text: 'This one is secret! Talk quietly in your team, then send your Lock Master to whisper the answer to the host.', tone: 'whisper', pose: 'think' });
      const first = qId === 'a1q1';
      if (first) {
        lines.push({ text: 'Some choices cost coins. Coins are your money: you spend them, you earn them back, and you need them to win.', pose: 'point', gap: 800 });
        lines.push({ text: 'Customers and Happiness are your two main goals. Customers means how many people use your startup. Happiness means how much they love it.', pose: 'point', gap: 800 });
        return { id: `${stepId}-open`, showText: true, lines, summary: 'Coins are your money. Customers (people using your startup) and Happiness (how much they love it) are your two main goals.' };
      }
      return { id: `${stepId}-open`, showText: false, lines, summary: isSecretStep(stepId) ? 'Secret choice: whisper your answer to the host.' : tip ?? q.title };
    }

    case 'revealed': {
      const traps = teams.filter(t => q.options[st.locks[t.id]]?.trap).length;
      if (traps > 0) {
        const text = traps === 1 ? 'Hehe! One of you fell for my trick!' : `Hehe! ${traps} of you fell for my trick!`;
        return { id: `${stepId}-rev`, mascot: 'fibbot', showText: false, lines: [{ text, tone: 'villain' }] };
      }
      return { id: `${stepId}-rev`, showText: false, lines: [{ text: 'Here is what everybody chose!', tone: 'excited', pose: 'point' }] };
    }

    case 'spotlight': {
      const team = teams[st.spotlight];
      if (!team) return null;
      const id = `${stepId}-spot-${st.spotlight}`;
      const idx = st.locks[team.id];
      const d = st.pending[team.id] ?? ZERO;
      const o = idx !== undefined ? q.options[idx] : null;
      if (!o) return { id, showText: true, lines: [{ text: `${team.name} did not lock an answer, so nothing changed.`, tone: 'calm', pose: 'sad' }] };
      const tone = toneFor(d);
      const why = whyText(qId, idx, d);
      const lines: NarrLine[] = [{ text: `${team.name} chose ${o.text}.`, tone, pose: 'point', gap: 500 }];
      if (why) lines.push({ text: why, tone, pose: tone === 'excited' ? 'cheer' : tone === 'calm' ? 'sad' : 'talk', gap: 700 });
      if (o.bonus && !why.includes('Bug Smash')) lines.push({ text: BONUS_WHY, tone: 'excited', pose: 'cheer' });
      return { id, showText: true, lines, summary: `${team.name}: ${headline(d)}.` };
    }

    case 'done':
      return { id: `${stepId}-done`, showText: false, lines: [{ text: 'That is it for this question. Keep an eye on Customers and Happiness!', tone: 'calm', pose: 'idle' }] };
  }
  return null;
}

// ---------- Mega Order ----------

function megaNarration(s: GameState, stepId: string, st: MegaState): Narration | null {
  const nameOf = (id: string) => s.teams.find(t => t.id === id)?.name ?? 'This team';
  switch (st.phase) {
    case 'intro':
      return null; // the intro animation narrates itself

    case 'open': {
      const pairedCount = st.pairs.length * 2;
      const lockedPairs = Object.keys(st.locks).filter(id => id !== st.solo).length;
      if (pairedCount > 0 && lockedPairs >= pairedCount) {
        return { id: `${stepId}-locked`, showText: false, lines: [{ text: 'All set! Every pair has locked its deal. Waiting for the reveal.', tone: 'calm', pose: 'think' }] };
      }
      const lines: NarrLine[] = [
        { text: 'Festival time! A giant order is too big for one team, so team up with your partner.', pose: 'talk', gap: 600 },
        { text: 'You can share fairly, take more, or go alone. Talk it out in your own team, and keep it super secret from your partner!', pose: 'point' },
        { text: 'Whisper your choice to the host. Nobody else may hear it.', tone: 'whisper', pose: 'think' },
      ];
      if (st.solo) lines.push({ text: `${nameOf(st.solo)} has no partner this time, so you get your own mini order. Just cheer!`, pose: 'wave' });
      return { id: `${stepId}-open`, showText: true, lines, summary: 'Team up with your partner: share fairly, take more or go alone. Both Lock Masters must lock the same deal.' };
    }

    case 'revealed':
      return { id: `${stepId}-rev`, showText: false, lines: [{ text: 'Did the partners agree? Let us find out!', tone: 'excited', pose: 'point' }] };

    case 'spotlight': {
      const pair = st.pairs[st.spotlight];
      const outcome = st.outcomes[st.spotlight];
      if (!pair || !outcome) return null;
      const [a, b] = pair;
      const da = st.pending[a] ?? ZERO, db = st.pending[b] ?? ZERO;
      const choice = (id: string) => (st.locks[id] !== undefined ? `“${MEGA.options[st.locks[id]].text}”` : 'nothing');
      const tone = outcome.kind === 'equal' ? 'cheer' : outcome.kind === 'broken' ? 'calm' : 'normal';
      const same = da.customers === db.customers && da.coins === db.coins && da.happiness === db.happiness;
      const result = same ? `Each team: ${headline(da)}.` : `${nameOf(a)}: ${headline(da)}. ${nameOf(b)}: ${headline(db)}.`;
      return {
        id: `${stepId}-pair-${st.spotlight}`,
        showText: true,
        lines: [
          { text: `${nameOf(a)} chose ${choice(a)}, and ${nameOf(b)} chose ${choice(b)}.`, pose: 'point', gap: 900 },
          { text: outcome.text, tone, pose: outcome.kind === 'broken' ? 'sad' : 'cheer', gap: 900 },
          { text: upFirst(result), tone, pose: 'talk' },
        ],
        summary: `${nameOf(a)} + ${nameOf(b)}: ${outcome.text}`,
      };
    }

    case 'done': {
      const solo = st.solo ? s.teams.find(t => t.id === st.solo) : null;
      if (solo) {
        const d = st.pending[solo.id] ?? ZERO;
        return {
          id: `${stepId}-done`, showText: true,
          lines: [
            { text: 'That is the Festival order done!', tone: 'excited', pose: 'cheer' },
            { text: `${solo.name} had no partner, so they got their own mini order: ${headline(d)}.`, pose: 'talk' },
          ],
          summary: `Festival done. ${solo.name} got their own mini order: ${headline(d)}.`,
        };
      }
      return { id: `${stepId}-done`, showText: false, lines: [{ text: 'That is the Festival order done! Well played, partners!', tone: 'excited', pose: 'cheer' }] };
    }
  }
  return null;
}
