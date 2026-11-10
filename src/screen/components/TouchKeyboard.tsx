// Big kid-friendly on-screen keyboard for the Players and Names steps (sits in the bottom half, y >= 560).
// Feeds the same typing state + actions as the physical keyboard (lib/typing.ts).
import { memo } from 'react';
import { motion } from 'motion/react';
import type { Grade } from '../../game/types';
import { sfx } from '../../audio';
import { useUi } from '../lib/ui';
import { backspaceTyping, commitTyping, shouldCap, typeChar } from '../lib/typing';
import { Tap } from './Tap';
import { GRADE_COLORS } from '../lib/grade';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const KEY_H = 84;

const Key = memo(function Key({ id, w, onTap, className, children }: { id: string; w: number; onTap: () => void; className?: string; children: React.ReactNode }) {
  return (
    <Tap id={id} onTap={onTap} ignoreLock debounce={90} sound="tap" className={`scr-key${className ? ' ' + className : ''}`} style={{ width: w, height: KEY_H }}>
      <span>{children}</span>
    </Tap>
  );
});

export function TouchKeyboard({ mode, hint }: { mode: 'players' | 'names'; hint?: string }) {
  const typing = useUi(s => s.typing);
  const grade = useUi(s => s.grade);
  const setGrade = useUi(s => s.setGrade);
  const up = shouldCap(typing);
  const add = () => { if (!commitTyping()) sfx.play('buzz'); };
  return (
    <motion.div className="scr-kbd" initial={{ y: 400, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 400, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
      <div className="scr-kbd-field">
        <div className="scr-kbd-text">
          {typing ? <>{typing}<span className="scr-caret">|</span></> : <span className="scr-kbd-ph">{hint ?? 'Type a name'}<span className="scr-caret">|</span></span>}
        </div>
        {mode === 'players' && (
          <div className="scr-kbd-grades">
            {([5, 6, 7] as Grade[]).map(g => (
              <Tap key={g} id={`grade-${g}`} ignoreLock debounce={90} sound="tap" onTap={() => setGrade(g)} className={`scr-kbd-grade${grade === g ? ' is-on' : ''}`} style={{ background: GRADE_COLORS[g].bg }}>
                <span>Class {g}</span>
              </Tap>
            ))}
          </div>
        )}
      </div>
      {ROWS.map((r, ri) => (
        <div key={r} className="scr-kbd-row">
          {ri === 2 && <Key id="k-bs" w={150} onTap={backspaceTyping} className="is-fn">⌫</Key>}
          {r.split('').map(ch => <Key key={ch} id={`k-${ch}`} w={118} onTap={() => typeChar(ch)}>{up ? ch : ch.toLowerCase()}</Key>)}
        </div>
      ))}
      <div className="scr-kbd-row">
        <Key id="k-space" w={760} onTap={() => typeChar(' ')} className="is-space">space</Key>
        <Key id="k-add" w={360} onTap={add} className="is-go">{mode === 'players' ? 'Add' : 'OK'}</Key>
      </div>
    </motion.div>
  );
}
