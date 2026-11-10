// Big kid-facing 3D button (>= 400x160 stage px) built on the ui kit's Button3D.
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Button3D } from '../../ui';
import type { Sfx } from '../../audio';
import { Tap } from './Tap';
import { cx } from '../lib/game';

interface Props {
  id: string;
  onTap?: () => void;
  children: ReactNode;
  color?: string;
  edge?: string;
  disabled?: boolean;
  width?: number;
  height?: number;
  style?: CSSProperties;
  className?: string;
  bounce?: boolean;
  sound?: Sfx;
}

export function BigButton({ id, onTap, children, color = 'var(--sun)', edge = 'var(--sun-edge)', disabled, width = 480, height = 170, style, className, bounce, sound = 'pop' }: Props) {
  return (
    <motion.div
      className={cx('scr-bigbtn-wrap', bounce && !disabled && 'scr-bounce', className)}
      style={{ width, height, ...style }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      <Tap id={id} onTap={onTap} disabled={disabled} sound={sound} className="scr-bigbtn">
        <Button3D color={color} edge={edge} size="xl" disabled={disabled} style={{ width: '100%', height: '100%', fontSize: height >= 180 ? 68 : 60, borderRadius: 44, lineHeight: 1.1 }}>
          {children}
        </Button3D>
      </Tap>
    </motion.div>
  );
}
