import { useState } from 'react';
import { AUCTION_STEP, BUG } from '../../game/content';
import { maxBid, teamById } from '../../game/engine';
import { AUCTION_RESERVE } from '../../game/content';
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
export function AuctionPanel() {
  const { state, send } = useA();
  const st = state.step;
  const [by, setBy] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  if (st.type !== 'auction' || st.phase !== 'bidding') return null;
  const wonBy = (id: string) => Object.values(st.winners).some(w => w.by === id);
  const team = by ? teamById(state, by) : null;
  const bid = (who: string, amount: number) => { send({ type: 'BID', by: who, amount }); setBy(null); setCustom(''); };
  const customN = parseInt(custom, 10);
  const customOk = !!team && Number.isFinite(customN) && customN > st.bid.amount && customN <= maxBid(team);

  return (
    <>
      <Card>
        <Label>{team ? `${team.name} bids` : 'Who is bidding?'}</Label>
        <div className="bidteams">
          {state.teams.map(t => {
            const won = wonBy(t.id);
            const poor = maxBid(t) <= st.bid.amount;
            return (
              <Btn key={t.id} tone={by === t.id ? 'sun' : 'soft'} disabled={won || poor} onClick={() => setBy(by === t.id ? null : t.id)} className="bt">
                <TeamDot team={t} size={28} />
                <span className="bt-text"><b>{t.name}</b><small>{won ? 'Already won one' : poor ? `Max bid ${maxBid(t)}: not enough` : `${t.coins} coins, max bid ${maxBid(t)}`}</small></span>
              </Btn>
            );
          })}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          {[10, 20, 50].map(inc => {
            const amt = st.bid.amount + inc;
            return <Btn key={inc} tone="good" size="lg" disabled={!team || amt > maxBid(team)} onClick={() => team && bid(team.id, amt)} style={{ flex: 1, flexDirection: 'column', gap: 0 }}>+{inc}<small>{amt}</small></Btn>;
          })}
        </div>
        {!team && <div className="hint">Tap the team that bid, then how much they raised.</div>}
        {team && <div className={`hint${maxBid(team) <= st.bid.amount + 10 ? ' hint-warn' : ''}`}>{team.name} can bid at most {maxBid(team)} coins: every team keeps {AUCTION_RESERVE} coins in reserve. Buttons above that are off.</div>}
        <form className="row" style={{ marginTop: 10 }} onSubmit={e => { e.preventDefault(); if (customOk && team) bid(team.id, customN); }}>
          <input className="input" inputMode="numeric" pattern="[0-9]*" placeholder={team ? `Other amount (max ${maxBid(team)})` : 'Other amount'} value={custom} onChange={e => setCustom(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          <Btn type="submit" tone="good" disabled={!customOk}>Bid</Btn>
        </form>
      </Card>
      <Btn tone="purple" size="lg" onClick={() => bid('raivan', st.bid.amount + AUCTION_STEP)} style={{ width: '100%' }}>rAIvan bids {st.bid.amount + AUCTION_STEP}</Btn>
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
