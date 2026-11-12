// Big kid-friendly on-screen keyboard + typed-text field for the Players and Names steps. The keyboard sits in the bottom half
// (every key is >= 116 stage px high, all at y >= 568) and feeds the same typing state as the physical keyboard (lib/typing.ts).
// Layout: three letter rows (Backspace to the RIGHT of M), then a last row: classes 5 to 10 + space + Add (players) or space + OK (names).
import '../setup.css';
import { memo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GRADES, type Grade } from '../../game/types';
import { sfx } from '../../audio';
import { useUi } from '../lib/ui';
import { GRADE_COLORS } from '../lib/grade';
import { backspaceTyping, commitTyping, shouldCap, typeChar } from '../lib/typing';
import { Tap } from './Tap';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const KEY_H = 116;
const KEY_W = 150;
const FN_W = 210;

const Key = memo(function Key({ id, w, onTap, className, style, children }: { id: string; w: number; onTap: () => void; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <Tap id={id} onTap={onTap} ignoreLock debounce={90} sound="tap" className={`st-key${className ? ' ' + className : ''}`} style={{ width: w, height: KEY_H, ...style }}>
      <span>{children}</span>
    </Tap>
  );
});

/** The typed-text field. With `grade` it also shows ONE class chip (it re-pops in place when the class changes, never two at once). */
export function TypingField({ hint, grade, className }: { hint: string; grade?: Grade; className?: string }) {
  const typing = useUi(s => s.typing);
  return (
    <motion.div className={`st-field${className ? ' ' + className : ''}`} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
      <div className="st-field-text">
        {typing ? <>{typing}<span className="scr-caret">|</span></> : <span className="st-field-ph">{hint}<span className="scr-caret">|</span></span>}
      </div>
      {grade && (
        <span className="st-chip-slot">
          <motion.span key={grade} className="st-field-chip" style={{ background: GRADE_COLORS[grade].bg }} initial={{ scale: 0.55, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 17 }}>
            Class {grade}
          </motion.span>
        </span>
      )}
    </motion.div>
  );
}

export function KidKeyboard({ mode }: { mode: 'players' | 'names' }) {
  const grade = useUi(s => s.grade);
  const setGrade = useUi(s => s.setGrade);
  const up = shouldCap(useUi(s => s.typing));
  const add = () => { if (!commitTyping()) sfx.play('buzz'); };
  return (
    <motion.div className="st-kbd" initial={{ y: 520, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 560, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
      {ROWS.map((r, ri) => (
        <div key={r} className="st-kbd-row">
          {r.split('').map(ch => <Key key={ch} id={`k-${ch}`} w={KEY_W} onTap={() => typeChar(ch)}>{up ? ch : ch.toLowerCase()}</Key>)}
          {ri === 2 && <Key id="k-bs" w={FN_W} onTap={backspaceTyping} className="is-fn">⌫</Key>}
        </div>
      ))}
      <div className="st-kbd-row">
        {mode === 'players' && GRADES.map(g => (
          <Key key={g} id={`grade-${g}`} w={KEY_W} onTap={() => setGrade(g)} className={`is-grade${grade === g ? ' is-on' : ''}`} style={{ background: GRADE_COLORS[g].bg }}>
            <i>Class</i><b>{g}</b>
          </Key>
        ))}
        <Key id="k-space" w={mode === 'players' ? 300 : 1170} onTap={() => typeChar(' ')} className="is-space">space</Key>
        <Key id="k-add" w={mode === 'players' ? 310 : 400} onTap={add} className="is-go">{mode === 'players' ? 'Add' : 'OK'}</Key>
      </div>
    </motion.div>
  );
}

/** Convenience: the keyboard that slides in/out with its parent state. */
export function TouchKeyboard({ mode, show = true }: { mode: 'players' | 'names'; show?: boolean }) {
  return <AnimatePresence>{show && <KidKeyboard key="kbd" mode={mode} />}</AnimatePresence>;
}
