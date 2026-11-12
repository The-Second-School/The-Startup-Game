// Look-only question card. Sits right after Bolt (x 204), on the same row as him, and animates between three sizes:
//   main  = the question is the subject (open phase)
//   small = the last minute: it makes room for the timer that pops in at the top right
//   mini  = the question is not the subject any more (everybody locked in, reveal)
// The card never draws a Bolt of its own: the narration dock owns him.
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cx } from '../lib/game';
import { DOCK_W } from '../lib/layout';
import '../choice.css';

type Pose = 'idle' | 'wave' | 'talk' | 'think' | 'cheer' | 'sad' | 'point' | 'shock';
export type CardSize = 'main' | 'small' | 'mini';

interface Props {
  title: string;
  sub?: ReactNode;
  /** Kept for old callers; Bolt lives in the dock now. */
  pose?: Pose;
  /** Right margin; the timer room is added automatically for size 'small'. */
  right?: number;
  children?: ReactNode;
  className?: string;
  size?: CardSize;
  /** Top edge: 56 (beside Bolt) or 196 when a transcript is showing. */
  top?: number;
  /** Bottom edge of the card in 'main' size (tiles start at 560). */
  bottom?: number;
  /** Explicit height (overrides the size preset). */
  height?: number;
  left?: number;
}

export const CARD_LEFT = DOCK_W + 16;
export const CARD_TOP = 56;
export const TIMER_SIZE = 190;

const TITLE_PX: Record<CardSize, [number, number, number]> = { main: [96, 84, 72], small: [72, 64, 56], mini: [56, 50, 46] };
const SUB_PX: Record<CardSize, number> = { main: 52, small: 42, mini: 36 };

export function QuestionCard({ title, sub, right = 40, children, className, size = 'main', top = CARD_TOP, bottom = 476, height, left = CARD_LEFT }: Props) {
  const len = title.length;
  const px = TITLE_PX[size][len <= 34 ? 0 : len <= 54 ? 1 : 2];
  const h = height ?? (size === 'main' ? bottom - top : size === 'small' ? Math.min(300, bottom - top) : 140);
  const r = size === 'small' ? right + TIMER_SIZE + 24 : right;
  return (
    <motion.div
      className={cx('cx-qcard', `is-${size}`, className)}
      style={{ left }}
      initial={{ top: top - 30, right: r, height: h, opacity: 0, scale: 0.96 }}
      animate={{ top, right: r, height: h, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -24, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <div className="cx-qcard-body">
        <motion.div className="cx-qcard-title" initial={false} animate={{ fontSize: px }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}>{title}</motion.div>
        <AnimatePresence initial={false}>
          {sub && size !== 'mini' && (
            <motion.div key="sub" className="cx-qcard-sub" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', fontSize: SUB_PX[size] }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>{sub}</motion.div>
          )}
        </AnimatePresence>
        {children}
      </div>
    </motion.div>
  );
}
