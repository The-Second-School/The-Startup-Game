// Awards: reveal 5 -> 1 with drumroll, card flip, confetti and trophies.
// Banana Peel shows its funny reasons; at #1 the Success board unlocks and buildings rise.
import '../views2.css';
import '../board.css';
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Building, Confetti, CountUp, MeterIcon, useStageH } from '../../ui';
import { AWARDS } from '../../game/content';
import { stageOf, success } from '../../game/engine';
import type { AwardResult, AwardsState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { teamBase, teamName } from '../lib/game';
import { Crown, Medal } from '../components/art';
import { ReadyHint } from '../components/ReadyHint';
import { useTimeline } from '../hooks/useTimeline';

type AwardId = AwardResult['id'];

const LOOK: Record<AwardId, { base: string; edge: string }> = {
  banana: { base: '#FFD93B', edge: '#D6A800' },
  pitch: { base: '#1CB0F6', edge: '#1290CC' },
  customer: { base: '#58CC02', edge: '#45A302' },
  happiness: { base: '#FF6FB5', edge: '#E5539A' },
  champion: { base: '#FFC800', edge: '#E0A100' },
};

// ---------- art ----------
function BananaArt({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <path d="M18 24 Q22 70 62 82 Q84 86 92 70 Q74 72 60 58 Q40 40 36 16 Z" fill="#fff" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
      <path d="M20 26 Q24 68 62 80 Q82 84 90 70 Q72 70 58 56 Q40 38 38 18 Z" fill="#D6A800" />
      <path d="M20 26 Q22 62 58 74 Q76 78 84 68 Q68 64 54 52 Q38 36 36 20 Z" fill="#FFD93B" />
      <path d="M28 30 Q32 52 48 64" stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6} />
      <rect x={30} y={8} width={14} height={14} rx={5} fill="#8A6F3E" transform="rotate(-12 37 15)" />
    </svg>
  );
}
function MicArt({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <path d="M24 46 Q24 74 50 74 Q76 74 76 46" stroke="#1290CC" strokeWidth={8} strokeLinecap="round" fill="none" />
      <rect x={46} y={72} width={8} height={16} rx={4} fill="#1290CC" /><rect x={32} y={86} width={36} height={8} rx={4} fill="#1290CC" />
      <rect x={32} y={8} width={36} height={60} rx={18} fill="#fff" stroke="#fff" strokeWidth={8} />
      <rect x={32} y={8} width={36} height={60} rx={18} fill="#1CB0F6" />
      <rect x={38} y={16} width={10} height={20} rx={5} fill="#fff" opacity={0.6} />
    </svg>
  );
}
function StarArt({ size = 90 }: { size?: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 22 : 46, a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${50 + r * Math.cos(a)},${52 + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <polygon points={pts} fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
      <polygon points={pts} fill="#E0A100" transform="translate(0 3)" strokeLinejoin="round" stroke="#E0A100" strokeWidth={4} />
      <polygon points={pts} fill="#FFC800" stroke="#FFC800" strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={40} cy={34} rx={9} ry={5} fill="#fff" opacity={0.7} transform="rotate(-30 40 34)" />
    </svg>
  );
}
function Badge({ id, size }: { id: AwardId; size: number }): ReactNode {
  if (id === 'banana') return <BananaArt size={size} />;
  if (id === 'pitch') return <MicArt size={size} />;
  if (id === 'customer') return <MeterIcon kind="customers" size={size} />;
  if (id === 'happiness') return <MeterIcon kind="happiness" size={size} />;
  return <StarArt size={size} />;
}

function Trophy({ id, size = 300, covered }: { id: AwardId; size?: number; covered?: boolean }) {
  const { base, edge } = LOOK[id];
  const h = size * 1.1;
  const cup = 'M40 30 H200 V84 Q200 164 120 172 Q40 164 40 84 Z';
  return (
    <div className="v2-trophy" style={{ width: size, height: h }}>
      <svg viewBox="0 0 240 264" width={size} height={h} style={{ overflow: 'visible' }}>
        <path d="M44 50 H26 Q14 50 14 64 Q16 116 76 128" stroke="#fff" strokeWidth={32} fill="none" strokeLinecap="round" />
        <path d="M196 50 H214 Q226 50 226 64 Q224 116 164 128" stroke="#fff" strokeWidth={32} fill="none" strokeLinecap="round" />
        <path d="M44 50 H26 Q14 50 14 64 Q16 116 76 128" stroke={edge} strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d="M196 50 H214 Q226 50 226 64 Q224 116 164 128" stroke={edge} strokeWidth={16} fill="none" strokeLinecap="round" />
        <rect x={54} y={218} width={132} height={42} rx={16} fill="#fff" />
        <rect x={62} y={228} width={116} height={30} rx={11} fill={edge} />
        <rect x={62} y={224} width={116} height={28} rx={11} fill={base} />
        <rect x={98} y={164} width={44} height={66} rx={14} fill="#fff" />
        <rect x={104} y={170} width={32} height={58} rx={10} fill={edge} />
        <rect x={104} y={170} width={26} height={54} rx={10} fill={base} />
        <path d={cup} fill="#fff" stroke="#fff" strokeWidth={18} strokeLinejoin="round" />
        <path d={cup} fill={edge} transform="translate(0 7)" />
        <path d={cup} fill={base} />
        <ellipse cx={120} cy={31} rx={80} ry={11} fill={base} stroke="#fff" strokeWidth={6} />
        <ellipse cx={120} cy={33} rx={64} ry={6} fill={edge} opacity={0.55} />
        <ellipse cx={72} cy={72} rx={14} ry={30} fill="#fff" opacity={0.5} transform="rotate(8 72 72)" />
      </svg>
      <div className="v2-trophy-badge" style={{ width: size * 0.5, height: size * 0.5 }}>
        {covered ? <span className="v2-qmark">?</span> : <Badge id={id} size={size * 0.34} />}
      </div>
    </div>
  );
}

// ---------- main pieces ----------
function Intro() {
  return (
    <motion.div className="v2-card v2-award-main v2-award-intro" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <div className="v2-intro-hero">
        <motion.div animate={{ y: [0, -16, 0], rotate: [-2, 2, -2] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}>
          <Trophy id="champion" size={360} />
        </motion.div>
      </div>
      <div className="v2-top-title" style={{ fontSize: 112 }}>Awards time!</div>
      <div className="v2-sub" style={{ textAlign: 'center', maxWidth: 1000 }}>Five awards, counting down from number 5 to number 1. Who wins the Golden Trophy?</div>
    </motion.div>
  );
}

function AwardCard({ res, team, n }: { res: AwardResult; team: Team; n: number }) {
  const meta = AWARDS[res.id];
  const flipped = n >= 1;
  const trophySize = 290 + Math.round((useStageH() - 1080) * 0.5);   // the trophy grows with the extra height
  const lines = Math.max(0, n - 1);
  const champ = res.id === 'champion';
  const banana = res.id === 'banana';
  const look = LOOK[res.id];
  return (
    <motion.div className="v2-card v2-award-main" initial={{ x: -400, opacity: 0, scale: 0.9 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: 400, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <div className="v2-award-head">
        <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
        <motion.div
          animate={flipped ? (banana ? { rotate: [0, -24, 18, -8, 0], y: [0, -20, 0] } : { scale: [1, 1.18, 1], rotate: [0, -6, 4, 0] }) : { rotate: [-3, 3, -3] }}
          transition={flipped ? { duration: 0.7 } : { duration: 0.25, repeat: Infinity }}
        >
          <Trophy id={res.id} size={trophySize} covered={!flipped} />
        </motion.div>
        </motion.div>
        <div className="v2-award-text">
          <div className="v2-pill is-big" style={{ ['--c' as string]: look.base }}>Award #{res.rank}</div>
          <div className="v2-award-title">{meta.title}</div>
          <div className="v2-sub">{meta.sub}</div>
        </div>
      </div>

      <div className="v2-flip">
        <motion.div className="v2-flip-in" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 150, damping: 15 }}>
          <div className="v2-flip-face v2-flip-back">
            <div className="v2-drum">
              <motion.span animate={{ rotate: [-18, 18, -18] }} transition={{ duration: 0.18, repeat: Infinity }}>🥁</motion.span>
              <span>And the winner is...</span>
            </div>
          </div>
          <div className="v2-flip-face v2-flip-front" style={{ ['--c' as string]: look.base }}>
            <div className="v2-winner-avatar">
              {champ && <motion.div className="v2-crown" initial={{ y: -200, rotate: -30 }} animate={{ y: 0, rotate: -8 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.9 }}><Crown size={140} /></motion.div>}
              <motion.div animate={flipped ? { y: [0, -18, 0] } : undefined} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={250} mood={banana ? 'sad' : 'wow'} />
              </motion.div>
            </div>
            <div className="v2-winner-text">
              <div className="v2-winner-name" style={{ fontSize: team.name.length > 14 ? 76 : 104 }}>{teamName(team)}</div>
              <div className="v2-why">
                <AnimatePresence initial={false}>{res.why.slice(0, lines).map((w, i) => (
                  <motion.div key={i} className="v2-why-line" initial={{ x: 120, opacity: 0, scale: 0.8 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: 120, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>{w}</motion.div>
                ))}</AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SuccessBoard({ teams, championId }: { teams: Team[]; championId: string }) {
  const list = [...teams].sort((a, b) => success(b) - success(a) || teams.indexOf(a) - teams.indexOf(b));
  const H = useStageH();
  // Rows share the card below the title: each at most ~110-200px tall, with 24-40px gaps, so the card is full at any height.
  const n = Math.max(1, list.length);
  const avail = H - 386;                                               // card (H - 188) minus its padding and the title row
  const rowH = Math.min(200 + Math.round((H - 1080) * 0.2), Math.floor((avail - (n - 1) * 40) / n));
  const rowGap = n > 1 ? Math.max(24, Math.floor((avail - n * rowH) / (n - 1))) : 0;
  return (
    <motion.div className="v2-card v2-award-main v2-success" initial={{ scale: 0.6, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
      <div className="v2-success-head">
        <motion.span initial={{ rotate: -40, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.3 }}>🔓</motion.span>
        <span className="v2-top-title" style={{ fontSize: 80 }}>Success board unlocked!</span>
      </div>
      <div className="v2-success-rows" style={{ gap: rowGap }}>
        {list.map((t, i) => {
          const s = success(t);
          const champ = t.id === championId;
          return (
            <motion.div key={t.id} className={`v2-srow${champ ? ' is-champ' : ''}`} style={{ height: rowH }} initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 + i * 0.12 }}>
              <span className="bd-srank">{i < 3 ? <Medal kind={(['gold', 'silver', 'bronze'] as const)[i]} size={i === 0 ? 76 : 60} /> : <i className="bd-dot" />}</span>
              <motion.div className="v2-srow-b" initial={{ y: 120, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 11, delay: 0.7 + i * 0.15 }}>
                <Building stage={stageOf(t).id} color={teamBase(t)} size={Math.round(rowH * 0.78)} animateIn />
              </motion.div>
              <span className="v2-srow-name">{teamName(t)}</span>
              <div className="v2-srow-bar">
                <motion.div className="v2-srow-fill" style={{ originX: 0, background: LOOK.champion.base }} initial={{ scaleX: 0 }} animate={{ scaleX: Math.max(0.03, s / 100) }} transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.9 + i * 0.12 }} />
              </div>
              <b className="v2-srow-val"><CountUp value={s} duration={1400} /></b>
              {champ && <span className="v2-srow-crown"><Crown size={76} /></span>}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---------- view ----------
export function AwardsView() {
  const { state } = useGame();
  if (state.step.type !== 'awards') return null;
  return <Awards st={state.step} />;
}

function Awards({ st }: { st: AwardsState }) {
  const { state } = useGame();
  const r = st.reveal;
  const res = r > 0 ? st.results[r - 1] : null;
  const team = res ? state.teams.find(t => t.id === res.teamId) ?? null : null;
  const n = useTimeline(`reveal-${r}`, r > 0 ? [4200, 4900, 5600, 6300, 10800] : []);
  const [fire, setFire] = useState(0);
  const [shake, setShake] = useState(0);
  const finale = res?.id === 'champion';
  const showSuccess = finale && n >= 5;

  useEffect(() => { if (r > 0) sfx.play('drumroll'); }, [r]);
  useEffect(() => {
    if (!res || n === 0) return;
    if (n === 1) { sfx.play(res.id === 'banana' ? 'splat' : 'fanfare'); setFire(f => f + 1); if (finale) { setShake(s => s + 1); sfx.play('cheer'); } }
    if (finale && (n === 2 || n === 3)) setFire(f => f + 1);
    if (finale && n === 5) sfx.play('ding');
  }, [n, res, finale]);

  const champion = st.results.find(x => x.id === 'champion');

  return (
    <motion.div className="v2-root bd-aw" animate={shake ? { x: [0, -16, 16, -12, 12, -6, 6, 0], y: [0, 6, -6, 4, -4, 0] } : undefined} transition={{ duration: 0.7 }}>
      <Confetti fire={fire} count={finale ? 200 : 120} />
      <AnimatePresence mode="wait">
        {r === 0 ? <Intro key="intro" /> : showSuccess && champion ? <SuccessBoard key="success" teams={state.teams} championId={champion.teamId} /> : res && team ? <AwardCard key={`a${r}`} res={res} team={team} n={n} /> : null}
      </AnimatePresence>

      <div className="v2-ladder">
        {[1, 2, 3, 4, 5].map(rank => {
          const idx = st.results.findIndex(x => x.rank === rank);
          const item = st.results[idx];
          const t = item ? state.teams.find(x => x.id === item.teamId) : null;
          const shown = !!item && (idx < r - 1 || (idx === r - 1 && n >= 1));
          const active = idx === r - 1;
          return (
            <motion.div key={rank} exit={{ x: 300, opacity: 0 }} className={`v2-slot${shown ? ' is-shown' : ''}${active ? ' is-active' : ''}${rank === 1 ? ' is-gold' : ''}`} initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22, delay: (5 - rank) * 0.07 }}>
              <span className="v2-slot-rank">{rank}</span>
              <AnimatePresence mode="popLayout" initial={false}>
              {shown && item && t ? (
                <motion.div key="full" className="v2-slot-in" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 14 }}>
                  <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={78} mood={item.id === 'banana' ? 'sad' : 'wow'} />
                  <div className="v2-slot-text"><b>{item.title}</b><span>{teamName(t)}</span></div>
                </motion.div>
              ) : (
                <motion.div key="empty" className="v2-slot-in is-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><span>{item ? AWARDS[item.id].icon : ''}</span><span className="v2-slot-q">? ? ?</span></motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <ReadyHint show={(r === 0) || n >= 4} text={r < st.results.length ? `Reveal #${5 - r}` : 'Finish'} />
    </motion.div>
  );
}
