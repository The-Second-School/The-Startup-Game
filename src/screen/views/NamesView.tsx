// Team names (right after the teams are formed). While naming: every team waits in a compact column, the typed text field and the big
// keyboard are visible. When ALL teams are named: keyboard and field slide away, the header says "All teams named!", confetti pops and
// the teams grow into big celebration cards (avatar bouncing, name, members).
import '../setup.css';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Confetti } from '../../ui';
import { KidKeyboard, TypingField } from '../components/TouchKeyboard';
import { useDockAt } from '../../narration/useDockAt';
import { useGame } from '../lib/ctx';
import { useUi } from '../lib/ui';
import { cx, isDefaultName, teamColors } from '../lib/game';
import { GRADE_COLORS } from '../lib/grade';
import { namingTeamId } from '../lib/typing';

export function NamesView() {
  useDockAt(56, 136, 1100);
  const { state } = useGame();
  const typing = useUi(s => s.typing);
  const kbTeam = useUi(s => s.kbTeam);
  const n = state.teams.length;
  const left = state.teams.filter(t => isDefaultName(t.name)).length;
  const done = n > 0 && left === 0;

  // small confetti on every new name, a big burst when the last team is named
  const [fire, setFire] = useState(0);
  const [big, setBig] = useState(done ? 1 : 0);
  const prevSig = useRef(state.teams.map(t => t.name).join('|'));
  const prevDone = useRef(done);
  useEffect(() => {
    const sig = state.teams.map(t => t.name).join('|');
    if (sig !== prevSig.current) { prevSig.current = sig; if (!done) setFire(f => f + 1); }
    if (done && !prevDone.current) setBig(b => b + 1);
    prevDone.current = done;
  }, [state.teams, done]);

  const activeId = done ? null : namingTeamId(state, kbTeam);
  const gap = n >= 5 ? 24 : 32;
  const colW = Math.floor((1808 - (n - 1) * gap) / Math.max(1, n));
  const cardW = Math.min(420, colW);

  return (
    <div className="st-root">
      <div className={cx('st-names-head', done && 'is-done')}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={done ? 'done' : 'name'} className="st-names-title" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ duration: 0.22 }}>
            {done ? <><span className="st-check">✓</span>All teams named!</> : 'Name your team!'}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {!done && <div key="field" className="st-names-field"><TypingField hint="Type your team name" /></div>}
        </AnimatePresence>
      </div>

      <div className="st-count">
        <span className="st-count-num">{n - left}</span>
        <span className="st-count-label">of {n} named</span>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key="cols" className="st-names-cols" style={{ gap }} exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}>
            {state.teams.map((t, i) => {
              const c = teamColors(t);
              const named = !isDefaultName(t.name);
              const active = activeId === t.id;
              return (
                <motion.div key={t.id} className={cx('st-ncol', active && 'is-active')} style={{ width: colW, background: named ? c.shades[1] : c.shades[0] }}
                  initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: i * 0.06 }}>
                  <motion.div animate={named ? { y: [0, -8, 0] } : active ? { rotate: [-4, 4, -4] } : { y: 0 }} transition={named || active ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: -i * 0.5 } : { duration: 0.2 }}>
                    <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={76} mood={named ? 'wow' : 'happy'} />
                  </motion.div>
                  <div className="st-nslot">
                    <AnimatePresence mode="popLayout">
                      {active && typing ? (
                        <motion.div key="typing" className="st-ntyping" style={{ fontSize: typing.length <= 10 ? 50 : 40 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}>{typing}<span className="scr-caret">|</span></motion.div>
                      ) : named ? (
                        <motion.div key={t.name} className="st-nname" style={{ fontSize: t.name.length <= 10 ? 54 : 42 }} initial={{ y: -160, scale: 1.5, rotate: -12, opacity: 0 }} animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 14 }}>
                          {t.name}
                        </motion.div>
                      ) : (
                        <motion.div key="wait" className="st-nwait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {active ? 'type here' : 'next'}<span className="scr-dots"><i>.</i><i>.</i><i>.</i></span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="st-nmembers">
                    {t.members.map(m => <Avatar key={m.playerId} seed={t.avatarSeed} colorIndex={t.colorIndex} shade={m.shade} size={40} />)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="cards" className="st-names-cards" style={{ gap }}>
            {state.teams.map((t, i) => {
              const c = teamColors(t);
              return (
                <motion.div key={t.id} className="st-ncard" style={{ width: cardW, background: c.shades[1] }}
                  initial={{ y: 120, scale: 0.6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 + i * 0.12 }}>
                  <motion.div animate={{ y: [0, -22, 0], rotate: [-4, 4, -4] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: -i * 0.35 }}>
                    <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={n >= 5 ? 170 : 200} mood="wow" />
                  </motion.div>
                  <motion.div className="st-ncard-name" style={{ fontSize: n >= 5 ? 52 : 64 }} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.35 + i * 0.12 }}>
                    {t.name}
                  </motion.div>
                  <div className="st-ncard-members">
                    {t.members.map((m, mi) => (
                      <motion.span key={m.playerId} className="st-ncard-member" style={{ background: GRADE_COLORS[m.grade].bg }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.12 + mi * 0.07 }}>
                        {m.name}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{!done && <KidKeyboard key="kbd" mode="names" />}</AnimatePresence>
      <Confetti fire={fire} count={90} />
      <Confetti fire={big} count={240} />
    </div>
  );
}
