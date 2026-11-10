// Product wheel: each team's Lock Master taps SPIN in turn; taken slices grey out; winner card pops.
import '../views2.css';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Confetti, ProductArt } from '../../ui';
import { PRODUCTS, productById } from '../../game/content';
import { randomProduct } from '../../game/helpers';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { bus } from '../lib/bus';
import { lockInput, unlockInput } from '../lib/tap';
import { teamColors } from '../lib/game';
import { Wheel } from '../components/Wheel';
import { BigButton } from '../components/BigButton';
import { useStableCallback } from '../hooks/useStableCallback';

const darken = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * 0.78));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

export function ProductsView() {
  const { state, dispatch, live } = useGame();
  const [spin, setSpin] = useState<{ index: number; id: number; teamId: string; productId: string } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<{ teamId: string; productId: string } | null>(null);
  const [fire, setFire] = useState(0);
  const current = state.teams.find(t => !t.productId) ?? null;

  const doSpin = useStableCallback(() => {
    if (!live || spinning || !current) return;
    const p = randomProduct(state);
    if (!p) return;
    setWinner(null);
    setSpinning(true);
    lockInput(6000);
    setSpin({ index: PRODUCTS.indexOf(p), id: Date.now(), teamId: current.id, productId: p.id });
  });
  useEffect(() => bus.on('spin', doSpin), [doSpin]);

  const onDone = () => {
    if (!spin) return;
    setSpinning(false);
    unlockInput();
    dispatch({ type: 'SET_PRODUCT', teamId: spin.teamId, productId: spin.productId });
    setWinner({ teamId: spin.teamId, productId: spin.productId });
    setFire(f => f + 1);
    sfx.play('fanfare');
  };
  useEffect(() => { if (!winner) return; const id = setTimeout(() => setWinner(null), 3800); return () => clearTimeout(id); }, [winner]);

  const taken = new Set(state.teams.map(t => t.productId).filter(Boolean));
  const slices = PRODUCTS.map(p => ({
    key: p.id, color: p.color, edge: darken(p.color),
    faded: taken.has(p.id) && !(spinning && spin?.productId === p.id),
    art: <ProductArt productId={p.id} size={112} />,
  }));
  const wp = winner ? productById(winner.productId) : null;
  const wt = winner ? state.teams.find(t => t.id === winner.teamId) ?? null : null;
  const rowH = Math.min(116, Math.floor(590 / Math.max(1, state.teams.length)));

  return (
    <div className="scr-full">
      <motion.div className="scr-wheel-pos" style={{ left: 70, top: 150 }} initial={{ x: -300, opacity: 0, rotate: -20 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: -300, opacity: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
        <motion.div animate={spinning ? { scale: 1 } : { scale: [1, 1.018, 1] }} transition={spinning ? { duration: 0.2 } : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}>
          <Wheel slices={slices} size={880} spin={spin ? { index: spin.index, id: spin.id } : null} onDone={onDone} />
        </motion.div>
      </motion.div>
      <div className="v2-prod-side">
        <motion.div className="scr-h1" style={{ fontSize: 80 }} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>Spin your product!</motion.div>
        <div className="v2-prod-rows">
          {state.teams.map((t, i) => {
            const p = productById(t.productId);
            const c = teamColors(t);
            const isCur = current?.id === t.id;
            return (
              <motion.div key={t.id} className="v2-prod-row" style={{ height: rowH, background: isCur ? c.shades[1] : c.shades[0] }}
                initial={{ x: 120, opacity: 0 }} animate={{ x: isCur ? -20 : 0, opacity: 1 }} exit={{ x: 120, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.07 }}>
                <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={rowH - 30} />
                <span className="v2-prod-team">{t.name}</span>
                <AnimatePresence mode="popLayout">
                  {p ? (
                    <motion.span key={p.id} className="v2-prod-got" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
                      <ProductArt productId={p.id} size={rowH - 30} /> {p.name}
                    </motion.span>
                  ) : (
                    <motion.span key="wait" className="v2-prod-wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{isCur ? 'Your turn!' : 'Waiting'}</motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="v2-prod-btn">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div key={current.id} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}>
              <BigButton id="spin-product" onTap={doSpin} disabled={spinning} width={680} height={170} bounce={!spinning} color={teamColors(current).base} edge={teamColors(current).shades[4]}>
                {spinning ? 'Spinning…' : `SPIN for ${current.name}!`}
              </BigButton>
            </motion.div>
          ) : (
            <motion.div key="allset" className="v2-allset" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 18 }}>Everyone has a product!</motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {wp && wt && (
          <motion.div key={wp.id} className="v2-winner" initial={{ scale: 0.3, rotate: -14, opacity: 0 }} animate={{ scale: 1, rotate: -3, opacity: 1 }} exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>
            <div className="v2-winner-team">{wt.name} got…</div>
            <motion.div animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}><ProductArt productId={wp.id} size={210} /></motion.div>
            <div className="v2-winner-name">{wp.name}</div>
            <div className="v2-winner-does">{wp.does}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <Confetti fire={fire} />
    </div>
  );
}
