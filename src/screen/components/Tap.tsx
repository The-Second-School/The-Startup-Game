// Touch target: fires on pointerdown, guarded (single pointer, 300 ms debounce, reveal lock).
import type { CSSProperties, ReactNode } from 'react';
import type { Sfx } from '../../audio';
import { sfx } from '../../audio';
import { acceptTap } from '../lib/tap';
import { cx } from '../lib/game';

export interface TapProps {
  id: string;
  onTap?: () => void;
  disabled?: boolean;
  /** Sound on an accepted tap (default none; state changes play their own cue). */
  sound?: Sfx;
  /** Sound when tapped while disabled (default 'buzz'). */
  deniedSound?: Sfx | null;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ignoreLock?: boolean;
  debounce?: number;
}

export function Tap({ id, onTap, disabled, sound, deniedSound = 'buzz', className, style, children, ignoreLock, debounce }: TapProps) {
  return (
    <div
      data-tap={id}
      className={cx('scr-tap', disabled && 'is-disabled', className)}
      style={style}
      onPointerDown={e => {
        if (!acceptTap(e, id, { ignoreLock, debounce })) return;
        if (disabled) { if (deniedSound) sfx.play(deniedSound); return; }
        if (sound) sfx.play(sound);
        onTap?.();
      }}
    >
      {children}
    </div>
  );
}
