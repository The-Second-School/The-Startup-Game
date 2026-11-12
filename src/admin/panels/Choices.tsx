import { useState, type ReactNode } from 'react';
import { MEGA, OPTION_STYLES, PRICE, QUESTIONS, productById } from '../../game/content';
import { canAfford, currentStep, teamById } from '../../game/engine';
import type { Team } from '../../game/types';
import { useA } from '../ctx';
import { SHAPES, coinTag } from '../info';
import { Btn, Card, Label, Pill, TeamLine } from '../kit';
import { useHoldTimerWhenLocked } from '../../screen/components/TimerBadge';

const PRICES = Array.from({ length: (PRICE.max - PRICE.min) / PRICE.step + 1 }, (_, i) => PRICE.min + i * PRICE.step);

/** Questions, Price It Right and Mega Order. The only thing the host needs while teams choose is who has locked. */
export function ChoicePanel() {
  const { state, send } = useA();
  const [open, setOpen] = useState<string | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const step = currentStep(state);
  const st = state.step;
  // Everybody locked: the talk clock stops on the phone too (same rule as the big screen, which owns the shared state).
  const choosing = (st.type === 'question' || st.type === 'price' || st.type === 'megaorder') && st.phase === 'open';
  const everyoneLocked = st.type === 'megaorder'
    ? st.pairs.length > 0 && Object.keys(st.locks).filter(id => id !== st.solo).length >= st.pairs.length * 2
    : (st.type === 'question' || st.type === 'price') && state.teams.length > 0 && Object.keys(st.locks).length >= state.teams.length;
  useHoldTimerWhenLocked(state, send, everyoneLocked, choosing);
  if (st.type !== 'question' && st.type !== 'price' && st.type !== 'megaorder') return null;
  if (st.phase !== 'open') return null;
  const q = st.type === 'question' && step.kind === 'question' ? QUESTIONS[step.qId] : null;
  const { teams } = state;

  // Secret entry: a team's Lock Master whispers the shape to the host. 4 small shape buttons, then Lock to confirm.
  const shapes = (t: Team, opts: { ok: boolean; note: string }[]): ReactNode => (
    <>
      <div className="shapegrid">
        {opts.map((o, i) => (
          <Btn key={i} tone={sel === i ? 'sun' : 'soft'} disabled={!o.ok} onClick={() => setSel(i)} className="shape-btn" label={SHAPES[i]}>
            <span className="opt-shape" style={{ color: OPTION_STYLES[i].dark }}>{SHAPES[i]}</span>
            <small>{o.ok ? o.note : 'No coins'}</small>
          </Btn>
        ))}
      </div>
      <Btn tone="good" size="lg" disabled={sel === null} onClick={() => { if (sel !== null) { send({ type: 'LOCK', teamId: t.id, choice: sel }); setSel(null); setOpen(null); } }}>Lock it in</Btn>
    </>
  );

  const picker = (t: Team): ReactNode => {
    if (q) return shapes(t, q.options.map(o => ({ ok: canAfford(t, o.coins), note: coinTag(o.coins) })));
    if (st.type === 'price') {
      const p = productById(t.productId);
      // Jhootu's copy price, shown as a quiet reference on the grid (nearest ₹10 step).
      const rivalStep = p ? Math.min(PRICE.max, Math.max(PRICE.min, Math.round(p.rival / PRICE.step) * PRICE.step)) : null;
      return (
        <>
          {p && (
            <div className="hint">
              <div>{p.icon} <b>{p.name}</b>. One sale is {p.unit}.</div>
              <div>It costs <b>₹{p.cost}</b> to make one. Jhootu’s copy sells for <b>₹{p.rival}</b>.</div>
            </div>
          )}
          <div className="pricegrid">
            {PRICES.map(v => (
              <Btn key={v} tone="soft" onClick={() => { send({ type: 'LOCK', teamId: t.id, choice: v }); setOpen(null); }} className={v === rivalStep ? 'price-ref' : ''}>
                ₹{v}{v === rivalStep && <small>Jhootu</small>}
              </Btn>
            ))}
          </div>
        </>
      );
    }
    return shapes(t, MEGA.options.map(o => ({ ok: true, note: o.text })));
  };

  const row = (t: Team) => {
    const locked = st.locks[t.id] !== undefined;
    const choosing = st.selectedTeamId === t.id;
    return (
      <TeamLine key={t.id} team={t} hot={choosing} onTap={() => { setSel(null); setOpen(open === t.id ? null : t.id); }}
        right={locked ? <Pill tone="good">Locked</Pill> : choosing ? <Pill tone="sun">Choosing</Pill> : <Pill>Waiting</Pill>}
        below={open === t.id && (
          <div className="picker">
            {picker(t)}
            {locked && <Btn tone="soft" onClick={() => { send({ type: 'CLEAR_LOCK', teamId: t.id }); setOpen(null); }}>Clear their lock</Btn>}
          </div>
        )} />
    );
  };

  if (st.type === 'megaorder') {
    return (
      <>
        {st.pairs.map(([a, b], i) => (
          <Card key={i} className="list">
            <Label>Pair {i + 1}</Label>
            {[a, b].map(id => { const t = teamById(state, id); return t ? row(t) : null; })}
          </Card>
        ))}
        {st.solo && (() => { const t = teamById(state, st.solo!); return t ? (
          <Card className="list">
            <Label>No partner this time</Label>
            <TeamLine team={t} right={<Pill tone="good">Own mini order</Pill>} below={<span className="sub">No lock needed. {t.name} gets a small order of its own after the pairs.</span>} />
          </Card>
        ) : null; })()}
      </>
    );
  }
  return <Card className="list"><Label>Tap a team to lock for them</Label>{teams.map(row)}</Card>;
}
