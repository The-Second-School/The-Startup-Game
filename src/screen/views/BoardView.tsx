// Leaderboards after each act (and the recap after the break). Three boards: Customers and Happiness are the big stars,
// Coins is the smaller side board. The view first shows the standings from before the act, rolls the numbers,
// then re-sorts with drama. Narration lives in narration/lines/board.ts.
import '../board.css';
import { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Confetti, RecipeIcon } from '../../ui';
import { sfx } from '../../audio';
import { BOARD_FIELDS, valueBefore, type Field } from '../../narration/lines/board';
import { CONTENT_TOP, STAGE_H } from '../lib/layout';
import { useGame } from '../lib/ctx';
import { Board, type BoardEvent } from '../components/RankBoards';
import { ReadyHint } from '../components/ReadyHint';
import { RECIPE } from '../../game/content';

const BOTTOM = 108;                                   // room for the small secret-winner note
const PANEL_H = STAGE_H - CONTENT_TOP - BOTTOM;       // boards use the whole height below the dock

export function BoardView({ act, recap }: { act: number; recap?: boolean }) {
  const { state } = useGame();
  const teams = state.teams;
  const recipe = RECIPE.find(r => r.act === act);
  const [fire, setFire] = useState(0);
  const last = useRef<Record<string, number>>({});

  const onEvent = useCallback((e: BoardEvent) => {
    const now = Date.now();
    if (now - (last.current[e] ?? 0) < 1500) return;
    last.current[e] = now;
    if (e === 'sort') sfx.play('whoosh', { volume: 0.7 });
    else if (e === 'gold') { sfx.play('fanfare'); setFire(f => f + 1); }
    else if (e === 'rise') { if (now - (last.current.gold ?? 0) > 1500) sfx.play('gain'); }
    else setTimeout(() => sfx.play('loss', { volume: 0.55 }), 650);
  }, []);

  // Where everyone stood before this act (not needed for the recap: the board simply stays as it was).
  const prevFor = (f: Field): Record<string, number> | undefined => {
    if (recap) return undefined;
    const out: Record<string, number> = {};
    teams.forEach(t => { out[t.id] = valueBefore(t, f, act); });
    return out;
  };

  return (
    <div className="bd-root">
      <Confetti fire={fire} count={110} />

      <motion.div className="bd-title" initial={{ y: -30, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        {recap
          ? <><span className="bd-title-emoji">👋</span>Welcome back!</>
          : <><RecipeIcon act={act} size={52} />{recipe ? `${recipe.name} done!` : 'Leaderboards'}</>}
      </motion.div>

      <div className="bd-columns" style={{ top: CONTENT_TOP + 8, height: PANEL_H }}>
        {BOARD_FIELDS.map((f, i) => (
          <Board key={f} field={f} teams={teams} prev={prevFor(f)} tone={f === 'coins' ? 'side' : 'main'}
            width={f === 'coins' ? 520 : 640} height={PANEL_H} delay={i * 220} sortDelay={recap ? 0 : 900} onEvent={onEvent} />
        ))}
      </div>

      <motion.div className="bd-secret" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.9 }}>
        <span>🤫</span>
        3 boards. The real winner is a secret mix of everything. We will not tell you how!
      </motion.div>
      <ReadyHint />
    </div>
  );
}
