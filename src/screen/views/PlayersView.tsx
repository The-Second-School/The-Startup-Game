// Players: founders pop in as name bubbles while kids type on the big touch keyboard (bottom half only).
// The keyboard and the typed-text field live here and are shared with NamesView.
import '../views2.css';
import { memo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bolt } from '../../ui';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { useUi } from '../lib/ui';
import { GRADE_COLORS } from '../lib/grade';
import { backspaceTyping, commitTyping, shouldCap, typeChar } from '../lib/typing';
import { Tap } from '../components/Tap';
import type { Grade } from '../../game/types';

export { GRADE_COLORS };

// ---------- shared: typed text field + big keyboard (keys are 120 x 120 stage px or bigger, all at y >= 548) ----------
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const KEY_H = 120;

const Key = memo(function Key({ id, w, onTap, className, style, children }: { id: string; w: number; onTap: () => void; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <Tap id={id} onTap={onTap} ignoreLock debounce={90} sound="tap" className={`v2-key${className ? ' ' + className : ''}`} style={{ width: w, height: KEY_H, ...style }}>
      <span>{children}</span>
    </Tap>
  );
});

export function TypingField({ hint, grade }: { hint: string; grade?: Grade }) {
  const typing = useUi(s => s.typing);
  return (
    <motion.div className="v2-field" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
      <div className="v2-field-text">
        {typing ? <>{typing}<span className="scr-caret">|</span></> : <span className="v2-field-ph">{hint}<span className="scr-caret">|</span></span>}
      </div>
      <AnimatePresence>
        {grade && typing && (
          <motion.span key={grade} className="v2-field-chip" style={{ background: GRADE_COLORS[grade].bg }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 16 }}>
            Class {grade}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function KidKeyboard({ mode }: { mode: 'players' | 'names' }) {
  const grade = useUi(s => s.grade);
  const setGrade = useUi(s => s.setGrade);
  const up = shouldCap(useUi(s => s.typing));
  const add = () => { if (!commitTyping()) sfx.play('buzz'); };
  return (
    <motion.div className="v2-kbd" initial={{ y: 520, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 520, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
      {ROWS.map((r, ri) => (
        <div key={r} className="v2-kbd-row">
          {ri === 2 && <Key id="k-bs" w={190} onTap={backspaceTyping} className="is-fn">⌫</Key>}
          {r.split('').map(ch => <Key key={ch} id={`k-${ch}`} w={120} onTap={() => typeChar(ch)}>{up ? ch : ch.toLowerCase()}</Key>)}
        </div>
      ))}
      <div className="v2-kbd-row">
        {mode === 'players' && ([5, 6, 7] as Grade[]).map(g => (
          <Key key={g} id={`grade-${g}`} w={200} onTap={() => setGrade(g)} className={`is-grade${grade === g ? ' is-on' : ''}`} style={{ background: GRADE_COLORS[g].bg }}>Class {g}</Key>
        ))}
        <Key id="k-space" w={mode === 'players' ? 330 : 720} onTap={() => typeChar(' ')} className="is-space">space</Key>
        <Key id="k-add" w={mode === 'players' ? 300 : 380} onTap={() => add()} className="is-go">{mode === 'players' ? 'Add' : 'OK'}</Key>
      </div>
    </motion.div>
  );
}

// ---------- view ----------
const MAX_SHOWN = 21;

export function PlayersView() {
  const { state } = useGame();
  const grade = useUi(s => s.grade);
  const counts = ([5, 6, 7] as Grade[]).map(g => [g, state.players.filter(p => p.grade === g).length] as const);
  const n = state.players.length;
  const hidden = Math.max(0, n - MAX_SHOWN);
  const shown = state.players.slice(hidden);
  return (
    <div className="v2-root">
      <div className="v2-setup-head">
        <motion.div className="v2-setup-bolt" animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
          <Bolt pose={n ? 'cheer' : 'point'} size={110} talking />
        </motion.div>
        <div className="v2-setup-title">{n ? `${n} founder${n === 1 ? '' : 's'} so far!` : 'Who’s playing?'}</div>
        <div className="v2-grade-counts">
          {counts.map(([g, c]) => (
            <div key={g} className="v2-grade-pill" style={{ background: GRADE_COLORS[g].bg }}>Class {g} <b>{c}</b></div>
          ))}
        </div>
      </div>

      <div className="v2-field-wrap"><TypingField hint="Type your name" grade={grade} /></div>

      <div className="v2-pbubbles">
        <AnimatePresence>
          {hidden > 0 && (
            <motion.div key="more" layout className="v2-pbubble is-more" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
              +{hidden} more
            </motion.div>
          )}
          {shown.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              className="v2-pbubble"
              style={{ background: GRADE_COLORS[p.grade].bg }}
              initial={{ scale: 0, y: 60, rotate: ((i * 37) % 7) - 3 }}
              animate={{ scale: 1, y: 0, rotate: ((i * 37) % 7) - 3 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              {p.name}<span className="v2-pbubble-tag">{p.grade}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {n === 0 && <motion.div key="empty" className="v2-pempty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Pick your class, type your name, then tap Add</motion.div>}
        </AnimatePresence>
      </div>

      <KidKeyboard mode="players" />
    </div>
  );
}
