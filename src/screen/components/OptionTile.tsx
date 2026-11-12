// One answer tile in the y 560..890 row. Colour + hollow sandwich shape (colour-blind safe) + icon + text + coin tag.
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { OptionShape } from '../../ui';
import { lighten } from '../../ui/palette';
import { Tap } from './Tap';
import { cx, optionStyle } from '../lib/game';
import '../choice.css';

export type TileState = 'idle' | 'active' | 'picked' | 'broke' | 'revealed';

interface Props {
  index: number;
  icon: string;
  text: string;
  tag?: string;
  detail?: string;
  state: TileState;
  trap?: boolean;
  empty?: boolean;
  onTap?: () => void;
  width: number;
  left: number;
}

export const TILE_TOP = 560;
export const TILE_H = 330;

export function tileGeometry(n = 4) {
  const margin = 72, gap = 40;
  const width = Math.floor((1920 - 2 * margin - (n - 1) * gap) / n);
  return { width, left: (i: number) => margin + i * (width + gap) };
}

/** Option colours are 10% lighter than the game palette so the shapes, icons and text read easily. */
export const lightTile = (hex: string) => lighten(hex, 0.1);

export function OptionTile({ index, icon, text, tag, detail, state, trap, empty, onTap, width, left }: Props) {
  const os = optionStyle(index);
  const broke = state === 'broke';
  const revealedEmpty = state === 'revealed' && !!empty;
  return (
    <motion.div
      className="cx-tile-slot"
      style={{ left, width, top: TILE_TOP, height: TILE_H }}
      initial={{ y: 80, opacity: 0, scale: 0.9 }}
      animate={{ y: state === 'picked' ? -14 : 0, opacity: 1, scale: state === 'picked' ? 1.03 : 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95, transition: { duration: 0.25, delay: index * 0.03 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 18, delay: state === 'idle' ? index * 0.07 : 0 }}
    >
      <Tap
        id={`opt-${index}`}
        onTap={onTap}
        disabled={!onTap || broke}
        deniedSound={broke ? 'buzz' : null}
        className={cx('cx-tile', `is-${state}`, revealedEmpty && 'is-empty', trap && state === 'revealed' && 'is-trap')}
        style={{ '--o': broke ? '#E4DCC8' : lightTile(os.base), '--o-dark': broke ? '#BDB298' : os.dark } as CSSProperties}
      >
        <div className="cx-tile-head">
          <OptionShape shape={os.shape} color={broke ? '#BDB298' : os.dark} size={60} />
          {tag && <div className={cx('cx-tile-tag', tag === 'Free' && 'is-free', tag.startsWith('+') && 'is-plus')}>{broke ? 'Not enough coins' : tag}</div>}
        </div>
        <div className="cx-tile-text">
          <div className="cx-tile-main"><span className="cx-tile-icon">{icon}</span> {text}</div>
          {detail && <div className="cx-tile-detail">{detail}</div>}
        </div>
        <AnimatePresence>
          {state === 'picked' && (
            <motion.div key="picked" className="cx-tile-picked" initial={{ scale: 0.4, opacity: 0, y: 14 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.4, opacity: 0, y: 14 }} transition={{ type: 'spring', stiffness: 520, damping: 22 }}>Picked!</motion.div>
          )}
        </AnimatePresence>
      </Tap>
    </motion.div>
  );
}
