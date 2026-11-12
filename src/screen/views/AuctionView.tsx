// Billboard Auction. Intro explains it step by step (revealed in step with Bolt's voice), then one ticket at a time:
// the host enters each team's bid on the phone, Jhootu answers by himself, and the screen plays it out in beats
// (team bid -> "Jhootu is thinking..." -> his counter, or "Jhootu gives up!"). SOLD is timed to the spoken "SOLD!".
// Layout: Bolt (dock, drawn by ScreenApp) top-left, the ticket title box right after him; two calm columns below.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { Avatar, Confetti, DeltaPill, Fibbot, MeterIcon, Num, useStageH } from '../../ui';
import { AUCTION_OPEN, AUCTION_RESERVE, AUCTION_STEP } from '../../game/content';
import { maxBid } from '../../game/engine';
import type { AuctionState, AuctionTicket, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { teamBase, teamName } from '../lib/game';
import { useDockAt } from '../../narration/useDockAt';
import { ReadyHint } from '../components/ReadyHint';
import { Gavel } from '../components/art';
import { useNarrBeat } from '../hooks/useNarrBeat';
import '../side.css';

type Bid = { by: string; amount: number };
const FIB = 'fibbot';
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** Splits `avail` px into n rows: each at most `cap` tall, gaps 24-40px, so the rows fill the space exactly. */
function fillRows(avail: number, n: number, cap: number) {
  const h = Math.max(1, Math.min(cap, Math.floor((avail - (n - 1) * 40) / Math.max(1, n))));
  const gap = n > 1 ? Math.max(24, Math.floor((avail - n * h) / (n - 1))) : 0;
  return { h, gap };
}

/** Bidding and sold screens: the hero + stage column on the left (taller with the frame) and the team rows on the right,
 *  which fill down to the real frame bottom. */
function auctionLayout(H: number, rows: number) {
  const X = H - 1080;
  const heroH = 364 + Math.round(X * 0.4);
  const stageTop = 156 + heroH + 20;
  const { h, gap } = fillRows(H - 32 - 156, rows, 200 + X * 0.25);
  return { heroH, stageTop, stageH: H - 32 - stageTop, rowH: h, rowGap: gap };
}

function Billboard({ icon, size = 220 }: { icon: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" style={{ overflow: 'visible' }} aria-hidden>
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

const Prize = ({ tk, size }: { tk: AuctionTicket; size?: 'md' | 'lg' }) => (
  <>
    {tk.deltas.customers !== 0 && <DeltaPill value={tk.deltas.customers} kind="customers" size={size} />}
    {tk.deltas.happiness !== 0 && <DeltaPill value={tk.deltas.happiness} kind="happiness" size={size} />}
  </>
);

const wonTicket = (st: AuctionState, id: string) => st.tickets.find(tk => st.winners[tk.id]?.by === id) ?? null;
const spring = { type: 'spring' as const, stiffness: 340, damping: 22 };
const card = { initial: { y: 50, opacity: 0, scale: 0.92 }, animate: { y: 0, opacity: 1, scale: 1 }, transition: spring };

export function AuctionView() {
  const { state } = useGame();
  if (state.step.type !== 'auction') return null;
  const st = state.step;
  const ticket = st.tickets[st.ticket];
  return (
    <div className="v2-root">
      {st.phase === 'intro' && <Intro st={st} teams={state.teams} />}
      {st.phase === 'bidding' && ticket && <Bidding key={ticket.id} st={st} ticket={ticket} teams={state.teams} />}
      {st.phase === 'sold' && ticket && <Sold key={ticket.id} st={st} ticket={ticket} teams={state.teams} />}
      {st.phase === 'done' && <Done st={st} teams={state.teams} />}
    </div>
  );
}

// ---------- intro: explain it, step by step ----------
function Intro({ st, teams }: { st: AuctionState; teams: Team[] }) {
  const beat = useNarrBeat('auction-intro');
  const show = (k: number) => beat >= k;
  const H = useStageH();
  const X = H - 1080;
  // The heading is at the top and Bolt sits right under it; the ticket row and the two calm panels fill the rest.
  useDockAt(40, 136, 1840);
  const ticketsH = 240 + Math.round(X * 0.3);
  const lowTop = 292 + ticketsH + 20;
  const rowH = Math.min(66 + X * 0.1, Math.floor((H - 32 - lowTop - 120) / Math.max(1, teams.length)));
  return (
    <>
      <div className="sd-intro-head" style={{ top: 16 }}>
        <AnimatePresence>
          {show(0) && (
            <motion.div key="h" className="sd-box sd-intro-title" {...card}>
              <Billboard icon="📣" size={110} />
              <span>Billboard Auction!</span>
              <span className="v2-sub">Win an ad for your startup</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="sd-tickets" style={{ top: 292, height: ticketsH }}>
        <AnimatePresence>
          {show(1) && st.tickets.map((tk, i) => (
            <motion.div key={tk.id} className="sd-box sd-mini-ticket" initial={{ y: 60, opacity: 0, rotate: -3 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ ...spring, delay: i * 0.12 }}>
              <Billboard icon={tk.icon} size={150} />
              <div className="sd-mini-body">
                <div className="sd-mini-title">{tk.title}</div>
                <div className="sd-pillrow"><Prize tk={tk} /></div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="sd-intro-low" style={{ top: lowTop, height: H - 32 - lowTop }}>
        <AnimatePresence>
          {show(2) && (
            <motion.div key="how" className="sd-box sd-how" {...card}>
              <div className="sd-box-title">How bidding works</div>
              <div className="sd-how-step"><span className="sd-how-ico">💰</span><span>Your Money Manager says a number</span></div>
              <div className="sd-how-step"><span className="sd-how-ico">⌨️</span><span>The host types it in</span></div>
              <div className="sd-how-step"><span className="sd-how-ico"><MeterIcon kind="coins" size={64} /></span><span>Highest bid wins and pays that many coins</span></div>
              <AnimatePresence>
                {show(3) && (
                  <motion.div key="fib" className="sd-how-step is-fibbot" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={spring}>
                    <span className="sd-how-ico"><Fibbot mood="sneaky" size={86} /></span><span>Jhootu bids too! If he wins, nobody gets the ad</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {show(4) && (
            <motion.div key="coins" className="sd-box sd-coins" {...card}>
              <div className="sd-box-title">Keep {AUCTION_RESERVE} coins safe</div>
              <div className="sd-coins-sub">You can bid up to your coins minus {AUCTION_RESERVE}. One billboard per team.</div>
              {teams.map(t => (
                <div key={t.id} className="sd-coin-row" style={{ height: rowH }}>
                  <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={Math.min(60, rowH - 6)} mood="happy" />
                  <span className="sd-coin-name">{teamName(t)}</span>
                  <span className="sd-coin-have"><MeterIcon kind="coins" size={40} /><Num value={t.coins} duration={600} /></span>
                  <span className="sd-coin-max">up to <b><Num value={maxBid(t)} duration={600} /></b></span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ReadyHint text="Start bidding" show={beat >= 5} />
    </>
  );
}

// ---------- bidding ----------
type Stage = 'idle' | 'bid' | 'thinking' | 'counter' | 'gaveup';

/** Plays st.bidLog back in beats. The engine appends the team's bid and Jhootu's counter in ONE update, so the screen reveals
 *  them one at a time. Starts from what is already in the log (a reload never replays old bids). */
function useStagedBids(log: Bid[]) {
  const [shown, setShown] = useState(log.length);
  const [stage, setStage] = useState<Stage>('idle');
  const [out, setOut] = useState(log.length > 0 && log[log.length - 1].by !== FIB);
  const shownRef = useRef(log.length);
  const outRef = useRef(out);
  const logRef = useRef(log);
  logRef.current = log;
  const runId = useRef(0);
  const running = useRef(false);

  useEffect(() => () => { runId.current++; running.current = false; }, []);
  useEffect(() => {
    if (running.current || shownRef.current >= log.length) return;
    running.current = true;
    const id = ++runId.current;
    const alive = () => runId.current === id;
    (async () => {
      while (alive() && shownRef.current < logRef.current.length) {
        const i = shownRef.current;
        const e = logRef.current[i];
        if (e.by === FIB) {
          setStage('thinking'); sfx.play('drumroll', { duration: 1.4 });
          await sleep(1500); if (!alive()) return;
        }
        shownRef.current = i + 1; setShown(i + 1);
        if (e.by === FIB) { setStage('counter'); sfx.play('evil'); await sleep(1500); }
        else {
          setStage('bid');
          const next = logRef.current[i + 1];
          await sleep(next ? 900 : 700); if (!alive()) return;
          if (!next && shownRef.current >= logRef.current.length && !outRef.current) {
            setStage('thinking'); sfx.play('drumroll', { duration: 1.6 });
            await sleep(1900); if (!alive()) return;
            outRef.current = true; setOut(true); setStage('gaveup'); sfx.play('cheer');
            await sleep(1100);
          }
        }
        if (!alive()) return;
      }
      if (alive()) { setStage(s => (s === 'thinking' ? 'idle' : s)); running.current = false; }
    })();
  }, [log.length]);
  return { shown, stage, out };
}

function Bidding({ st, ticket, teams }: { st: AuctionState; ticket: AuctionTicket; teams: Team[] }) {
  const { shown, stage, out } = useStagedBids(st.bidLog);
  const H = useStageH();
  const seen = st.bidLog.slice(0, shown);
  const top: Bid = seen.length ? seen[seen.length - 1] : { by: FIB, amount: AUCTION_OPEN };
  const hasBid = seen.length > 0;
  const topTeam = top.by === FIB ? null : teams.find(t => t.id === top.by) ?? null;
  const n = teams.length + 1;
  const { heroH, stageTop, stageH, rowH: h, rowGap } = auctionLayout(H, n);
  const bump = useAnimationControls();
  useEffect(() => { if (shown > 0) bump.start({ scale: [1.18, 1], rotate: [-3, 0], transition: { duration: 0.3, ease: 'easeOut' } }); }, [shown, bump]);

  const lastTeamBid = [...seen].reverse().find(b => b.by !== FIB);
  const lastTeam = lastTeamBid ? teams.find(t => t.id === lastTeamBid.by) : null;
  let say = hasBid ? 'Any higher bids?' : `Bids start at ${AUCTION_OPEN} coins`;
  let mood: 'laugh' | 'sneaky' | 'dizzy' | 'shock' = 'sneaky';
  if (stage === 'bid' && lastTeam && lastTeamBid) say = `${teamName(lastTeam)} bids ${lastTeamBid.amount}!`;
  if (stage === 'thinking') { say = 'Jhootu is thinking…'; mood = 'shock'; }
  if (stage === 'counter') { say = `Jhootu says ${top.amount}!`; mood = 'laugh'; }
  if (stage === 'gaveup' || (stage === 'idle' && out && hasBid)) { say = stage === 'gaveup' ? 'Jhootu gives up!' : 'Jhootu is out! Any higher bids?'; mood = 'dizzy'; }

  return (
    <>
      <motion.div className="sd-box sd-title" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
        <div className="sd-title-main">
          <div className="v2-pill">Billboard {st.ticket + 1} of {st.tickets.length}</div>
          <div className="sd-title-name">{ticket.title}</div>
        </div>
        <div className="sd-title-prize"><Prize tk={ticket} /></div>
      </motion.div>

      <motion.div className="sd-box sd-hero" style={{ height: heroH }} initial={{ x: -120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={spring}>
        <Billboard icon={ticket.icon} size={250} />
        <div className="sd-hero-bid">
          <div className="sd-hero-label">{hasBid ? 'Top bid' : 'Opening price'}</div>
          <motion.div className="sd-hero-num" animate={bump}><MeterIcon kind="coins" size={104} /><Num value={top.amount} duration={500} /></motion.div>
          {hasBid && (
            <div className="sd-hero-who">
              {topTeam ? <Avatar seed={topTeam.avatarSeed} colorIndex={topTeam.colorIndex} shade={2} size={72} mood="wow" /> : <Fibbot mood="laugh" size={80} />}
              <span>{topTeam ? teamName(topTeam) : 'Jhootu'}</span>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div className="sd-box sd-stage" style={{ top: stageTop, height: stageH }} initial={{ x: -120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ ...spring, delay: 0.08 }}>
        <div className="sd-stage-main">
          <motion.div key={`${stage}-${shown}`} initial={{ scale: 0.8, rotate: stage === 'counter' ? -8 : 0 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 13 }}>
            <Fibbot mood={mood} size={260} />
          </motion.div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${stage}-${say}`} className={`sd-say${stage === 'counter' ? ' is-hot' : ''}`} initial={{ scale: 0.7, opacity: 0, x: 30 }} animate={{ scale: 1, opacity: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: 'spring', stiffness: 460, damping: 20 }}>
              {say}
              {stage === 'thinking' && <span className="sd-dots"><i /><i /><i /></span>}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="sd-history">
          {seen.slice(-4).map((b, i) => {
            const t = b.by === FIB ? null : teams.find(x => x.id === b.by);
            return (
              <motion.span key={`${shown - 4 + i}`} className={`sd-hist${b.by === FIB ? ' is-fib' : ''}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
                {t ? teamName(t) : 'Jhootu'} <b>{b.amount}</b>
              </motion.span>
            );
          })}
        </div>
      </motion.div>

      <div className="sd-rows" style={{ ['--rh' as string]: `${h}px`, gap: rowGap }}>
        {teams.map(t => {
          const won = wonTicket(st, t.id);
          const isTop = top.by === t.id && hasBid;
          const bidBefore = seen.some(b => b.by === t.id);
          const cap = maxBid(t);
          let status = `Max bid ${cap}`;
          if (won) status = `Won ${won.icon}`;
          else if (isTop) status = 'Top bidder!';
          else if (cap < top.amount + AUCTION_STEP) status = bidBefore ? 'Outbid' : 'Can’t go higher';
          else if (bidBefore) status = `Outbid · max ${cap}`;
          return <TeamRow key={t.id} team={t} h={h} status={status} hot={isTop} grey={!!won} coins={t.coins} />;
        })}
        <TeamRow rival h={h} status={stage === 'thinking' ? 'Thinking…' : top.by === FIB && hasBid ? 'Top bid!' : out ? 'Out of this one' : 'Sneaky rival'} hot={top.by === FIB && hasBid} />
      </div>
    </>
  );
}

function TeamRow({ team, rival, h, status, hot, grey, coins }: { team?: Team; rival?: boolean; h: number; status: string; hot?: boolean; grey?: boolean; coins?: number }) {
  const face = Math.min(h - 8, 128);                 // rows can be taller than the face: the face stays a sensible size
  return (
    <motion.div layout="position" className={`sd-row${hot ? ' is-hot' : ''}${grey ? ' is-grey' : ''}${rival ? ' is-rival' : ''}`} style={{ height: h, ['--c' as string]: rival ? '#7B4BC9' : teamBase(team!) }} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1, scale: hot ? 1.015 : 1 }} transition={{ type: 'spring', stiffness: 380, damping: 24 }}>
      <div className="sd-row-face">{rival ? <Fibbot mood={hot ? 'laugh' : 'sneaky'} size={face} /> : <Avatar seed={team!.avatarSeed} colorIndex={team!.colorIndex} shade={2} size={face} mood={hot ? 'wow' : grey ? 'cool' : 'happy'} />}</div>
      <div className="sd-row-name">{rival ? 'Jhootu' : teamName(team)}{rival && <span className="sd-rival-tag">rival</span>}</div>
      <div className="sd-row-coins"><MeterIcon kind="coins" size={44} />{rival ? <b>∞</b> : <b><Num value={coins ?? 0} duration={700} /></b>}</div>
      <div className={`sd-row-status${hot ? ' is-hot' : ''}`}>{status}</div>
    </motion.div>
  );
}

// ---------- sold ----------
function Sold({ st, ticket, teams }: { st: AuctionState; ticket: AuctionTicket; teams: Team[] }) {
  const H = useStageH();
  const w = st.winners[ticket.id];
  const winTeam = w && w.by !== FIB ? teams.find(t => t.id === w.by) ?? null : null;
  const beat = useNarrBeat(`auction-sold-${st.ticket}`);
  const b = Math.max(0, beat);
  const [fire, setFire] = useState(0);
  const played = useRef(new Set<number>());
  useEffect(() => {
    if (beat < 0 || beat > 3 || played.current.has(beat)) return;
    played.current.add(beat);
    if (beat === 0 || beat === 1) sfx.play('tick');
    if (beat === 2) {
      sfx.play('gavel');
      setTimeout(() => sfx.play(winTeam ? 'fanfare' : 'evil'), 260);
      if (winTeam) { setFire(f => f + 1); setTimeout(() => sfx.play('clap'), 700); }
    }
    if (beat === 3 && winTeam) sfx.play('coin');
  }, [beat, winTeam]);

  const n = teams.length + 1;
  const { heroH, stageTop, stageH, rowH: h, rowGap } = auctionLayout(H, n);
  const sold = b >= 2;
  const paid = b >= 3;

  return (
    <>
      <Confetti fire={fire} />
      <motion.div className="sd-box sd-title" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
        <div className="sd-title-main">
          <div className="v2-pill">Billboard {st.ticket + 1} of {st.tickets.length}</div>
          <div className="sd-title-name">{ticket.title}</div>
        </div>
        <div className="sd-title-prize"><Prize tk={ticket} /></div>
      </motion.div>

      <div className="sd-box sd-hero is-sold" style={{ height: heroH }}>
        <Billboard icon={ticket.icon} size={250} />
        <div className="sd-hero-bid">
          <div className="sd-hero-label">Final price</div>
          <div className="sd-hero-num"><MeterIcon kind="coins" size={104} /><Num value={w?.amount ?? AUCTION_OPEN} duration={500} /></div>
        </div>
        <AnimatePresence>
          {sold && <motion.div key="stamp" className="sd-stamp" initial={{ scale: 2.4, opacity: 0, rotate: -18 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} transition={{ type: 'spring', stiffness: 600, damping: 14 }}>SOLD!</motion.div>}
        </AnimatePresence>
      </div>

      <div className="sd-box sd-stage is-sold" style={{ top: stageTop, height: stageH }}>
        <div className="sd-stage-main">
          <motion.div key={Math.min(b, 2)} className="sd-gavel" initial={{ rotate: -40 }} animate={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 700, damping: 12 }}><Gavel size={230} /></motion.div>
          <AnimatePresence mode="wait" initial={false}>
            {!sold ? (
              <motion.div key={`g${b}`} className="sd-going" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: 'spring', stiffness: 520, damping: 15 }}>
                {b === 0 ? 'Going once…' : 'Going twice…'}
              </motion.div>
            ) : (
              <motion.div key="who" className="sd-winner" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 460, damping: 18 }}>
                {winTeam && w ? (
                  <>
                    <Avatar seed={winTeam.avatarSeed} colorIndex={winTeam.colorIndex} shade={2} size={150} mood="wow" />
                    <div className="sd-winner-text"><b>{teamName(winTeam)}</b><span>won it for <b>{w.amount}</b> coins!</span></div>
                  </>
                ) : (
                  <>
                    <Fibbot mood="laugh" size={170} />
                    <div className="sd-winner-text"><b>Jhootu keeps it!</b><span>Nobody gets this ad</span></div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {paid && winTeam && w && (
            <motion.div key="gains" className="sd-gains" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}>
              <span className="v2-sub">{teamName(winTeam)} gets</span>
              <Prize tk={ticket} />
              <DeltaPill value={-w.amount} kind="coins" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="sd-rows" style={{ ['--rh' as string]: `${h}px`, gap: rowGap }}>
        {teams.map(t => {
          const isWin = !!winTeam && winTeam.id === t.id;
          const won = wonTicket(st, t.id);
          // coins drop on the beat when the winner pays, not before
          const coins = isWin && w && !paid ? t.coins + w.amount : t.coins;
          const status = isWin ? (sold ? 'Winner!' : 'Top bidder!') : won ? `Won ${won.icon}` : 'Not this time';
          return <TeamRow key={t.id} team={t} h={h} status={status} hot={isWin && sold} grey={!isWin && !!won} coins={coins} />;
        })}
        <TeamRow rival h={h} status={sold && !winTeam ? 'Keeps it!' : 'Sneaky rival'} hot={sold && !winTeam} />
      </div>
      <ReadyHint text={st.ticket + 1 < st.tickets.length ? 'Next billboard' : 'See results'} show={beat >= 99 || beat >= 4} />
    </>
  );
}

// ---------- done: who won what ----------
function Done({ st, teams }: { st: AuctionState; teams: Team[] }) {
  const beat = useNarrBeat('auction-done');
  const H = useStageH();
  const X = H - 1080;
  // The heading is at the top and Bolt sits right under it; the billboard rows fill the rest of the frame.
  useDockAt(40, 136, 1840);
  const n = st.tickets.length;
  const kept = st.tickets.filter(tk => !st.winners[tk.id] || st.winners[tk.id].by === FIB).length;
  const { h, gap } = fillRows(H - 32 - 292, n, 250 + X * 0.5);
  return (
    <>
      <motion.div className="sd-box sd-done-head" style={{ top: 16 }} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
        <span className="sd-done-title">Sold, sold, sold!</span>
        <span className="v2-sub">Who won each billboard</span>
        <span className="sd-done-tally">
          <span><b><Num value={n - kept} duration={500} /></b> won by teams</span><span><b><Num value={kept} duration={500} /></b> kept by Jhootu</span>
        </span>
      </motion.div>
      <div className="sd-done-list" style={{ top: 292, gap }}>
        <AnimatePresence>
          {st.tickets.map((tk, i) => {
            if (beat < i + 1) return null;
            const w = st.winners[tk.id];
            const t = w && w.by !== FIB ? teams.find(x => x.id === w.by) : null;
            return (
              <motion.div key={tk.id} className={`sd-box sd-won${t ? '' : ' is-fib'}`} style={{ height: h }} initial={{ x: 140, opacity: 0, scale: 0.94 }} animate={{ x: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
                <Billboard icon={tk.icon} size={Math.min(170, h - 30)} />
                <div className="sd-won-item">
                  <div className="sd-won-title">{tk.title}</div>
                  <div className="sd-pillrow"><Prize tk={tk} /></div>
                </div>
                <div className="sd-won-arrow">→</div>
                {t && w ? (
                  <div className="sd-won-who">
                    <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={Math.min(120, h - 40)} mood="wow" />
                    <div className="sd-won-text"><b>{teamName(t)}</b><span>paid <MeterIcon kind="coins" size={40} /><b><Num value={w.amount} duration={700} /></b></span></div>
                  </div>
                ) : (
                  <div className="sd-won-who">
                    <Fibbot mood="laugh" size={Math.min(130, h - 30)} />
                    <div className="sd-won-text"><b>Jhootu kept it</b><span>Nobody got this ad</span></div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <ReadyHint show={beat >= n + 1} />
    </>
  );
}
