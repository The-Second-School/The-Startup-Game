// Slim, calm progress rail across the top (shown only once the game has started). Nothing here loops: it only moves when the act changes.
// A line joins the six acts; the part already travelled fills with colour, the current act gets a coloured ring.
import { motion } from 'motion/react';
import { RecipeIcon } from '../../ui';
import { RECIPE } from '../../game/content';
import { HEADER_H } from '../lib/layout';

const COLORS = ['#1CB0F6', '#FF9600', '#FF6FB5', '#58CC02', '#CE82FF', '#FFC800'];

export function ProgressRail({ act }: { act: number }) {
  const idx = Math.max(0, Math.min(RECIPE.length - 1, act - 1));
  const N = RECIPE.length;
  const pad = 36; // half a node, so the line starts and ends at node centres
  return (
    <div className="pr-rail" style={{ height: HEADER_H }}>
      <div className="pr-line" style={{ left: pad, right: pad }}>
        <motion.i className="pr-fill" initial={false} animate={{ scaleX: act <= 0 ? 0 : idx / (N - 1) }} transition={{ type: 'spring', stiffness: 90, damping: 22 }} style={{ background: COLORS[idx] }} />
      </div>
      <div className="pr-nodes" style={{ left: 0, right: 0 }}>
        {RECIPE.map((r, i) => {
          const done = act > r.act, cur = act === r.act;
          return (
            <div key={r.act} className="pr-node" style={{ opacity: done || cur ? 1 : 0.55 }}>
              <span className={`pr-dot${cur ? ' is-cur' : ''}`} style={{ borderColor: done || cur ? COLORS[i] : '#EBCB6B', background: done ? COLORS[i] : '#fff' }}>
                <RecipeIcon act={r.act} size={cur ? 30 : 26} />
              </span>
              {cur && <span className="pr-name">{r.name}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
