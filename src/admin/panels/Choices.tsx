import { useState, type ReactNode } from 'react';
import { MEGA, OPTION_STYLES, PRICE, QUESTIONS, productById } from '../../game/content';
import { canAfford, currentStep, teamById } from '../../game/engine';
import type { Team } from '../../game/types';
import { useA } from '../ctx';
import { SHAPES, coinTag } from '../info';
import { Btn, Card, Label, Pill, TeamLine } from '../kit';

const PRICES = Array.from({ length: (PRICE.max - PRICE.min) / PRICE.step + 1 }, (_, i) => PRICE.min + i * PRICE.step);

/** Questions, Price It Right and Mega Order. The only thing the host needs while teams choose is who has locked. */
export function ChoicePanel() {
  const { state, send } = useA();
  const [open, setOpen] = useState<string | null>(null);
  const step = currentStep(state);
  const st = state.step;
  if (st.type !== 'question' && st.type !== 'price' && st.type !== 'megaorder') return null;
  if (st.phase !== 'open') return null;
  const q = st.type === 'question' && step.kind === 'question' ? QUESTIONS[step.qId] : null;
  const { teams } = state;

  const picker = (t: Team): ReactNode => {
    if (q) {
      return q.options.map((o, i) => {
        const ok = canAfford(t, o.coins);
        return (
          <Btn key={i} tone="soft" disabled={!ok} onClick={() => { send({ type: 'LOCK', teamId: t.id, choice: i }); setOpen(null); }} className="opt-btn">
            <span className="opt-shape" style={{ color: OPTION_STYLES[i].dark }}>{SHAPES[i]}</span>
            <span className="opt-text">{o.text}<small>{ok ? coinTag(o.coins) : 'Not enough coins'}</small></span>
          </Btn>
        );
      });
    }
    if (st.type === 'price') {
      const p = productById(t.productId);
      return (
        <>
          {p && <div className="hint">{p.icon} {p.name} {p.unit}. {p.hint}</div>}
          <div className="pricegrid">
            {PRICES.map(v => <Btn key={v} tone="soft" onClick={() => { send({ type: 'LOCK', teamId: t.id, choice: v }); setOpen(null); }}>₹{v}</Btn>)}
          </div>
        </>
      );
    }
    return MEGA.options.map((o, i) => (
      <Btn key={i} tone="soft" onClick={() => { send({ type: 'LOCK', teamId: t.id, choice: i }); setOpen(null); }} className="opt-btn">
        <span className="opt-shape" style={{ color: OPTION_STYLES[i].dark }}>{SHAPES[i]}</span>
        <span className="opt-text">{o.text}<small>{o.detail}</small></span>
      </Btn>
    ));
  };

  const row = (t: Team) => {
    const locked = st.locks[t.id] !== undefined;
    const choosing = st.selectedTeamId === t.id;
    return (
      <TeamLine key={t.id} team={t} hot={choosing} onTap={() => setOpen(open === t.id ? null : t.id)}
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
