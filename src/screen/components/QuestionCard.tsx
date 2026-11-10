// Look-only question card in the top half (y 100..466) with Bolt breaking the frame.
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Bolt } from '../../ui';
import { cx } from '../lib/game';

type Pose = 'idle' | 'wave' | 'talk' | 'think' | 'cheer' | 'sad' | 'point' | 'shock';

interface Props { title: string; sub?: ReactNode; pose?: Pose; right?: number; children?: ReactNode; className?: string; top?: number; height?: number }

export function QuestionCard({ title, sub, pose = 'talk', right = 40, children, className, top = 124, height = 340 }: Props) {
  const long = title.length > 46;
  return (
    <motion.div
      className={cx('scr-qcard', className)}
      style={{ left: 40, right, top, height }}
      initial={{ y: -40, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div className="scr-qcard-bolt"><Bolt pose={pose} size={250} talking={pose === 'talk'} /></div>
      <div className="scr-qcard-body">
        <div className={cx('scr-qcard-title', long && 'is-long')}>{title}</div>
        {sub && <div className="scr-qcard-sub">{sub}</div>}
        {children}
      </div>
    </motion.div>
  );
}
