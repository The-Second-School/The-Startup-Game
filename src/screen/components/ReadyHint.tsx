import { AnimatePresence, motion } from 'motion/react';

/** A STATUS, not a button: a small flat green pill in the bottom-right corner telling the host the screen is ready for Next.
 *  The whole pill floats gently (container and text move together). `bottom` / `right` are kept for old callers but ignored:
 *  the hint always sits in the same corner on every screen. Pass show={false} to animate it out. */
export function ReadyHint({ text = 'Ready!', show = true }: { text?: string; bottom?: number; right?: number; show?: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="ready" className="scr-ready-pos" initial={{ scale: 0.6, opacity: 0, y: 14 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.6, opacity: 0, y: 14 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
          <div className="scr-ready scr-float">{text}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
