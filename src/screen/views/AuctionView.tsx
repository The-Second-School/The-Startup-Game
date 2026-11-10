// Billboard Auction: one ticket at a time. The host enters bids on the phone; the top bid glows and bounces.
// SOLD: "Going once... twice... SOLD!" with a hammer, then the ticket flies to the winner's paddle.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Bolt, Confetti, CountUp, DeltaPill, MeterIcon, Raivan } from '../../ui';
import type { AuctionState, AuctionTicket, Team } from '../../game/types';
import { maxBid } from '../../game/engine';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { teamBase, teamName, teamShade } from '../lib/game';
import { ReadyHint } from '../components/ReadyHint';
import { Gavel, TicketShape } from '../components/art';
import { useLaggedTeams } from '../hooks/useLaggedTeams';
import { useTimeline } from '../hooks/useTimeline';

function Billboard({ icon, size = 220 }: { icon: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" style={{ overflow: 'visible' }}>
      <rect x={70} y={150} width={22} height={86} rx={8} fill="#8A6F3E" /><rect x={148} y={150} width={22} height={86} rx={8} fill="#8A6F3E" />
      <rect x={14} y={30} width={212} height={130} rx={28} fill="#fff" />
      <rect x={24} y={42} width={192} height={118} rx={22} fill="#5A2F9E" />
      <rect x={24} y={38} width={192} height={114} rx={22} fill="#7B4BC9" />
      <rect x={38} y={48} width={70} height={14} rx={7} fill="#fff" opacity={0.45} />
      <text x={120} y={122} textAnchor="middle" fontSize={78}>{icon}</text>
      {[44, 84, 124, 164, 196].map(x => <circle key={x} cx={x} cy={22} r={9} fill="#FFC800" stroke="#fff" strokeWidth={4} className="ui-pulse" style={{ ['--d' as string]: `${-x / 90}s` }} />)}
    </svg>
  );
}

function TicketCard({ ticket, index, total }: { ticket: AuctionTicket; index: number; total: number }) {
  const gains = ([['customers', ticket.deltas.customers], ['happiness', ticket.deltas.happiness]] as const).filter(([, v]) => v !== 0);
  return (
    <div className="v2-ticket">
      <TicketShape width={1000} height={330} />
      <div className="v2-ticket-stub"><Billboard icon={ticket.icon} size={210} /></div>
      <div className="v2-ticket-body">
        <div className="v2-pill">Billboard {index + 1} of {total}</div>
        <div className="v2-ticket-title">{ticket.title}</div>
        <div className="v2-ticket-gains">
          <span className="v2-sub">You get</span>
          {gains.map(([k, v]) => <DeltaPill key={k} value={v} kind={k} />)}
        </div>
      </div>
    </div>
  );
}

const PAD = { top: 596, margin: 60, gap: 24 };
const paddleW = (n: number) => Math.floor((1920 - 2 * PAD.margin - (n - 1) * PAD.gap) / n);
const paddleX = (i: number, n: number) => PAD.margin + i * (paddleW(n) + PAD.gap);

export function AuctionView() {
  const { state } = useGame();
  if (state.step.type !== 'auction') return null;
  return <Auction st={state.step} />;
}

function Auction({ st }: { st: AuctionState }) {
  const { state } = useGame();
  const sold = st.phase === 'sold';
  const teams = useLaggedTeams(state.teams, sold ? 3600 : 0);
  const ticket = st.tickets[st.ticket];
  const winner = ticket ? st.winners[ticket.id] : undefined;
  const winTeam = winner && winner.by !== 'raivan' ? state.teams.find(t => t.id === winner.by) ?? null : null;
  const n = useTimeline(`${st.ticket}-${st.phase}`, sold ? [1100, 2300, 3500] : []);
  const [fire, setFire] = useState(0);
  const showTicket = (st.phase === 'bidding' || sold) && !!ticket;
  const count = teams.length + 1;
  const W = paddleW(count);

  useEffect(() => {
    if (!sold) return;
    if (n === 1) sfx.play('tick');
    if (n === 2) { sfx.play(winTeam ? 'fanfare' : 'evil'); if (winTeam) setFire(f => f + 1); }
    if (n === 3) sfx.play('whoosh');
  }, [n, sold, winTeam]);

  const flyIdx = winner ? (winner.by === 'raivan' ? teams.length : Math.max(0, teams.findIndex(t => t.id === winner.by))) : 0;
  const flight = { x: paddleX(flyIdx, count) + W / 2 - (60 + 500), y: PAD.top + 90 - (120 + 165) };

  const wonBy = (id: string) => st.tickets.find(tk => st.winners[tk.id]?.by === id) ?? null;

  const rows: { id: string; team: Team | null }[] = [...teams.map(t => ({ id: t.id, team: t })), { id: 'raivan', team: null }];

  return (
    <div className="v2-root">
      <Confetti fire={fire} />

      <AnimatePresence>
        {st.phase === 'intro' && (
          <motion.div key="intro" className="v2-card v2-top" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0, transition: { duration: 0.22 } }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
            <div className="v2-top-bolt"><Bolt pose="point" size={250} talking /></div>
            <div className="v2-top-body">
              <div className="v2-top-title">Billboard Auction!</div>
              <div className="v2-sub">Bid your coins. The highest bid wins the billboard! Each team can win only one. Keep 50 coins safe: your Max bid is your coins minus 50. Watch out, rAIvan bids too!</div>
            </div>
          </motion.div>
        )}
        {st.phase === 'done' && (
          <motion.div key="done" className="v2-card v2-top" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0, transition: { duration: 0.22 } }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
            <div className="v2-top-bolt"><Bolt pose="cheer" size={250} /></div>
            <div className="v2-top-body"><div className="v2-top-title">Sold, sold, sold!</div><div className="v2-sub">Here is who won each billboard.</div></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {showTicket && ticket && (
          <motion.div
            key={ticket.id}
            className="v2-ticket-wrap"
            initial={{ x: -700, rotate: -8, opacity: 0 }}
            animate={sold && n >= 3 ? { x: flight.x, y: flight.y, scale: 0.18, rotate: 10, opacity: 0.0 } : { x: 0, y: 0, scale: 1, rotate: -1.5, opacity: 1 }}
            exit={{ x: 500, rotate: 6, opacity: 0, transition: { duration: 0.25 } }}
            transition={sold && n >= 3 ? { duration: 0.8, ease: [0.5, 0, 0.8, 0.4] } : { type: 'spring', stiffness: 260, damping: 18 }}
          >
            <motion.div animate={sold ? { y: 0 } : { y: [0, -7, 0] }} transition={sold ? { duration: 0.2 } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
              <TicketCard ticket={ticket} index={st.ticket} total={st.tickets.length} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showTicket && !sold && (
          <motion.div key="bid" className="v2-bidpanel" initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 120, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
            <BidPanel st={st} teams={state.teams} />
          </motion.div>
        )}
        {showTicket && sold && (
          <motion.div key="sold" className="v2-bidpanel" initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 120, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
            <div className="v2-card v2-sold">
                <motion.div key={n} className="v2-gavel" initial={{ rotate: -34 }} animate={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 700, damping: 12 }}><Gavel size={210} /></motion.div>
                <AnimatePresence mode="wait">
                  <motion.div key={Math.min(n, 2)} className="v2-sold-text" initial={{ scale: 0.4, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: n >= 2 ? -3 : 0 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                    {n === 0 && <div className="v2-going">Going once...</div>}
                    {n === 1 && <div className="v2-going">Going twice...</div>}
                    {n >= 2 && (
                      <>
                        <div className="v2-soldstamp">SOLD!</div>
                        {winTeam ? (
                          <div className="v2-sold-who"><Avatar seed={winTeam.avatarSeed} colorIndex={winTeam.colorIndex} shade={2} size={84} mood="wow" /><div className="v2-sold-lines"><b>{teamName(winTeam)}</b><span>paid {winner?.amount} <MeterIcon kind="coins" size={44} /></span></div></div>
                        ) : (
                          <div className="v2-sold-who"><Raivan mood="laugh" size={90} /><span>rAIvan keeps it!</span></div>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
      {st.phase === 'done' ? (
        <motion.div key="winrow" className="v2-winrow" exit={{ opacity: 0, y: 80, transition: { duration: 0.22 } }}>
          {st.tickets.map((tk, i) => {
            const w = st.winners[tk.id];
            const t = w && w.by !== 'raivan' ? state.teams.find(x => x.id === w.by) : null;
            return (
              <motion.div key={tk.id} className="v2-card v2-win" initial={{ y: 80, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.15 + i * 0.12 }}>
                <Billboard icon={tk.icon} size={150} />
                <div className="v2-win-title">{tk.title}</div>
                {t ? (
                  <div className="v2-win-who"><Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={78} mood="wow" /><span>{teamName(t)}<br />{w?.amount} coins</span></div>
                ) : (
                  <div className="v2-win-who"><Raivan mood="laugh" size={78} /><span>rAIvan kept it</span></div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div key="paddles" className="v2-paddles" exit={{ opacity: 0, y: 120, transition: { duration: 0.22 } }}>
          {rows.map(({ id, team }, i) => {
            const isRaivan = id === 'raivan';
            const top = st.phase !== 'intro' && st.bid.by === id && (isRaivan || st.bidLog.length > 0);
            const isWinner = sold && winner?.by === id;
            const won = isRaivan ? null : wonBy(id);
            const greyed = !!won && !isWinner && !(sold && winner?.by === id);
            const cap = !isRaivan && team ? maxBid(team) : 0;
            const low = !isRaivan && team && !won && cap < st.bid.amount + 10;
            const base = isRaivan ? '#7B4BC9' : teamBase(team!);
            const edge = isRaivan ? '#5A2F9E' : teamShade(team!, 4);
            let status = 'Ready!';
            if (isWinner) status = 'Winner!';
            else if (top && !sold) status = 'Top bid!';
            else if (won) status = 'Won one';
            else if (isRaivan) status = 'Sneaky!';
            else if (low && st.phase === 'bidding') status = 'Low coins';
            else if (!isRaivan && st.phase === 'bidding') status = `Max bid ${cap}`;
            return (
              <motion.div
                key={id}
                className={`v2-paddle${greyed ? ' is-grey' : ''}${top || isWinner ? ' is-top' : ''}`}
                style={{ left: paddleX(i, count), width: W, ['--c' as string]: greyed ? '#CDBE97' : base, ['--e' as string]: greyed ? '#B3A57F' : edge }}
                initial={{ y: 300, opacity: 0 }}
                exit={{ y: 200, opacity: 0 }}
                animate={{ y: top || isWinner ? -34 : 0, opacity: 1, scale: top || isWinner ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: top ? 520 : 300, damping: top ? 12 : 22, delay: st.phase === 'intro' ? i * 0.07 : 0 }}
              >
                <AnimatePresence>{(top || isWinner) && <motion.div key="glow" className="v2-glow-wrap" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.2 }}><div className="v2-glow" /></motion.div>}</AnimatePresence>
                <motion.div key={top ? `${id}-${st.bid.amount}` : id} className="v2-paddle-face" initial={top ? { scale: 0.8, rotate: -8 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 12 }}>
                  {isRaivan ? <Raivan mood={top ? 'laugh' : 'sneaky'} size={150} /> : <Avatar seed={team!.avatarSeed} colorIndex={team!.colorIndex} shade={2} size={140} mood={isWinner ? 'wow' : top ? 'wow' : greyed ? 'cool' : 'happy'} />}
                </motion.div>
                <div className="v2-paddle-stick" />
                <div className="v2-paddle-card">
                  <div className="v2-paddle-name">{isRaivan ? 'rAIvan' : teamName(team)}</div>
                  <div className="v2-paddle-coins">
                    <MeterIcon kind="coins" size={46} />
                    {isRaivan ? <b>∞</b> : <b><CountUp value={team!.coins} /></b>}
                  </div>
                  <div className={`v2-paddle-status${top || isWinner ? ' is-hot' : ''}`}>{status}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      </AnimatePresence>

      <ReadyHint bottom={486} show={st.phase === 'intro' || st.phase === 'done' || (sold && n >= 3)} />
    </div>
  );
}

function BidPanel({ st, teams }: { st: AuctionState; teams: Team[] }) {
  const by = st.bid.by;
  const team = by === 'raivan' ? null : teams.find(t => t.id === by) ?? null;
  const key = `${by}-${st.bid.amount}`;
  return (
    <div className="v2-card v2-bid">
      <div className="v2-bid-label">{st.bidLog.length ? 'Top bid' : 'Opening bid'}</div>
      <motion.div key={key} className="v2-bid-main" initial={{ scale: 0.55, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 11 }}>
        <MeterIcon kind="coins" size={120} />
        <span className="v2-bid-num"><CountUp value={st.bid.amount} duration={300} /></span>
      </motion.div>
      <motion.div key={`w-${key}`} className="v2-bid-who" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
        {team ? <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={86} mood="wow" /> : <Raivan mood="sneaky" size={96} />}
        <span>{team ? teamName(team) : 'rAIvan'}</span>
      </motion.div>
    </div>
  );
}
