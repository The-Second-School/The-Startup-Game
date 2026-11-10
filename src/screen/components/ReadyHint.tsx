import { AnimatePresence, motion } from 'motion/react';

/** Look-only bouncing hint telling the host the screen is ready for Next. Pass show={false} to animate it out. */
export function ReadyHint({ text = 'Ready!', bottom = 60, right = 60, show = true }: { text?: string; bottom?: number; right?: number; show?: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="ready" className="scr-ready" style={{ bottom, right }} initial={{ scale: 0, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: -3, opacity: 1 }} exit={{ scale: 0, rotate: 8, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
          <span className="scr-bounce-y">{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
