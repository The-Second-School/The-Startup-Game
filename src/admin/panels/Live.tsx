import { useState } from 'react';
import { AUCTION_RESERVE, AUCTION_STEP, BUG } from '../../game/content';
import { maxBid, teamById } from '../../game/engine';
import { Num } from '../../ui/primitives';
import { useA } from '../ctx';
import { Btn, Card, Chip, Fold, Label, TeamDot, TeamLine } from '../kit';

// ---------- Bug Smash ----------
const BUG_CHOICES = [0, 5, 10, 15, 20, 25, 30, 35];
const tierOf = (n: number) => BUG.tiers.find(x => n >= x.min && n <= x.max)!;

export function BugPanel() {
  const { state, send } = useA();
  const st = state.step;
  const [custom, setCustom] = useState('');
  if (st.type !== 'bugsmash' || st.phase !== 'turn') return null;
  const team = state.teams[st.turn];
  if (!team) return null;
  if (st.turnPhase === 'result') {
    const n = st.results[team.id] ?? 0;
    return <Card><div className="sub">{tierOf(n).text}</div></Card>;
  }
  const save = (n: number) => send({ type: 'BUG_RESULT', teamId: team.id, bugs: n });
  return (
    <Fold title="The game glitched?" hint={`Enter ${team.name}'s bug count yourself`}>
      <div className="chips">
        {BUG_CHOICES.map(n => <Chip key={n} onClick={() => save(n)} style={{ flex: '1 0 20%' }}>{n}</Chip>)}
      </div>
      <form className="row" style={{ marginTop: 10 }} onSubmit={e => { e.preventDefault(); const n = parseInt(custom, 10); if (Number.isFinite(n) && n >= 0) { save(n); setCustom(''); } }}>
        <input className="input" inputMode="numeric" pattern="[0-9]*" placeholder="Other number" value={custom} onChange={e => setCustom(e.target.value.replace(/\D/g, '').slice(0, 3))} />
        <Btn type="submit" tone="good" disabled={custom === ''}>Save</Btn>
      </form>
    </Fold>
  );
}

// ---------- Auction ----------
// Jhootu bids by himself inside the engine (his limit is secret and never shown). The host only enters team bids.
export function AuctionPanel() {
  const { state, send } = useA();
  const st = state.step;
  const [by, setBy] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  if (st.type !== 'auction' || st.phase !== 'bidding') return null;

  const minNext = st.bid.amount + AUCTION_STEP;
  const wonBy = (id: string) => Object.values(st.winners).some(w => w.by === id);
  const canBid = (id: string) => {
    const t = teamById(state, id);
    return !!t && !wonBy(id) && maxBid(t) >= minNext;
  };
  const team = by ? teamById(state, by) : null;
  const max = team ? maxBid(team) : 0;
  // Keep the amount inside the legal range even if Jhootu raised the bid while the host was choosing.
  const amount = team ? Math.min(max, Math.max(minNext, picked ?? minNext)) : 0;
  const ok = !!team && canBid(team.id) && amount >= minNext && amount <= max;

  const tk = st.tickets[st.ticket];
  const nameOf = (id: string) => (id === 'fibbot' ? 'Jhootu' : teamById(state, id)?.name ?? 'a team');
  const top = st.bid.by === 'fibbot' && st.bidLog.length === 0 ? 'Opening price' : nameOf(st.bid.by);
  const recent = st.bidLog.slice(-3).reverse();

  const pick = (id: string) => { setBy(id === by ? null : id); setPicked(null); };
  const place = () => {
    if (!team || !ok) return;
    send({ type: 'BID', by: team.id, amount });
    setBy(null);
    setPicked(null);
  };

  return (
    <>
      <Card>
        <div className="auc-ticket"><span aria-hidden>{tk.icon}</span><b>{tk.title}</b></div>
        <div className="sub">Ticket {st.ticket + 1} of {st.tickets.length}</div>
        <div className="auc-stats">
          <div><small>Top bid</small><b><Num value={st.bid.amount} /></b><small>{top}</small></div>
          <div><small>Next minimum</small><b><Num value={minNext} /></b><small>coins</small></div>
        </div>
        {recent.length > 0 && (
          <div className="auc-log">
            {recent.map((b, i) => <div key={i}><span>{nameOf(b.by)}</span><b>{b.amount}</b></div>)}
          </div>
        )}
      </Card>

      <Card>
        <Label>Who bid?</Label>
        <div className="bidteams">
          {state.teams.map(t => {
            const can = canBid(t.id);
            return (
              <Btn key={t.id} tone={by === t.id ? 'sun' : 'soft'} disabled={!can} onClick={() => pick(t.id)} className="bt">
                <TeamDot team={t} size={28} />
                <span className="bt-text">
                  <b>{t.name}</b>
                  <small>{wonBy(t.id) ? 'Already won' : can ? `Max ${maxBid(t)}` : 'Too few coins'}</small>
                </span>
              </Btn>
            );
          })}
        </div>

        {team && (
          <>
            <Label>Raise by</Label>
            <div className="row">
              {[10, 20, 50].map(inc => {
                const a = st.bid.amount + inc;
                return (
                  <Btn key={inc} tone={amount === a ? 'sun' : 'soft'} disabled={a > max} onClick={() => setPicked(a)} style={{ flex: 1 }}>+{inc}</Btn>
                );
              })}
            </div>

            <Label>Amount</Label>
            <div className="stepper">
              <Btn tone="soft" size="lg" disabled={amount - AUCTION_STEP < minNext} onClick={() => setPicked(amount - AUCTION_STEP)}>−{AUCTION_STEP}</Btn>
              <b className="stepper-val"><Num value={amount} /></b>
              <Btn tone="soft" size="lg" disabled={amount + AUCTION_STEP > max} onClick={() => setPicked(amount + AUCTION_STEP)}>+{AUCTION_STEP}</Btn>
            </div>

            <Btn tone="good" size="lg" disabled={!ok} onClick={place} style={{ width: '100%', marginTop: 12 }}>Place bid</Btn>
            <div className="hint">{team.name} can bid up to {max}. Every team keeps {AUCTION_RESERVE} coins.</div>
          </>
        )}
      </Card>
    </>
  );
}

// ---------- Mic Time ----------
export function MicPanel() {
  const { state, send } = useA();
  const st = state.step;
  if (st.type !== 'mic' || st.phase !== 'spin') return null;
  return (
    <Fold title="Wheel not working?" hint="Pick the team yourself">
      <div className="list">
        {state.teams.map(t => {
          const picked = state.micPicked.includes(t.id);
          return <TeamLine key={t.id} team={t} right={<Btn tone={picked ? 'soft' : 'sun'} onClick={() => send({ type: 'MIC_PICK', teamId: t.id })}>{picked ? 'Again' : 'Pick'}</Btn>} below={picked ? <span className="sub">Already had a turn</span> : undefined} />;
        })}
      </div>
    </Fold>
  );
}
