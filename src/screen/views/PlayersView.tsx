// Players: founders pop in as name bubbles while kids type on the big touch keyboard (bottom half only).
// The keyboard and the typed-text field are shared with NamesView (they live in components/TouchKeyboard).
import '../setup.css';
import { AnimatePresence, motion } from 'motion/react';
import { CountUp } from '../../ui';
import { GRADES } from '../../game/types';
import { useGame } from '../lib/ctx';
import { useUi } from '../lib/ui';
import { GRADE_COLORS } from '../lib/grade';
import { KidKeyboard, TypingField } from '../components/TouchKeyboard';

export { GRADE_COLORS, KidKeyboard, TypingField };

const MAX_SHOWN = 21;

export function PlayersView() {
  const { state } = useGame();
  const grade = useUi(s => s.grade);
  const n = state.players.length;
  const hidden = Math.max(0, n - MAX_SHOWN);
  const shown = state.players.slice(hidden);
  return (
    <div className="st-root">
      <div className="st-count">
        <CountUp value={n} className="st-count-num" />
        <span className="st-count-label">{n === 1 ? 'founder' : 'founders'}</span>
      </div>

      <div className="st-row">
        <div className="st-field-wrap"><TypingField hint="Type your name" grade={grade} /></div>
        <div className="st-note">Your class only helps us make fair, mixed teams. It is never scored!</div>
      </div>

      <div className="st-classes">
        {GRADES.map(g => (
          <div key={g} className={`st-class${grade === g ? ' is-on' : ''}`} style={{ background: GRADE_COLORS[g].bg }}>
            Class {g}
            <CountUp value={state.players.filter(p => p.grade === g).length} className="st-class-num" />
          </div>
        ))}
      </div>

      <div className="st-bubbles">
        <AnimatePresence mode="popLayout">
          {hidden > 0 && (
            <motion.div key="more" layout className="st-pbubble is-more" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
              +<CountUp value={hidden} /> more
            </motion.div>
          )}
          {shown.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              className="st-pbubble"
              style={{ background: GRADE_COLORS[p.grade].bg }}
              initial={{ scale: 0, y: 60, rotate: (((i + hidden) * 37) % 7) - 3 }}
              animate={{ scale: 1, y: 0, rotate: (((i + hidden) * 37) % 7) - 3 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              {p.name}<span className="st-pbubble-tag">{p.grade}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {n === 0 && <motion.div key="empty" className="st-pempty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Pick your class, type your name, then tap Add</motion.div>}
        </AnimatePresence>
      </div>

      <KidKeyboard mode="players" />
    </div>
  );
}
