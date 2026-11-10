// The line between the question card and the tiles: "Rocket Kids is choosing…" / "Tap your team first".
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';

export function Banner({ id, children, color = 'var(--paper)', top = 480 }: { id: string; children: ReactNode; color?: string; edge?: string; top?: number }) {
  return (
    <div className="scr-banner-row" style={{ top }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={id}
          className="scr-banner"
          style={{ background: color, boxShadow: `var(--sh)` }}
          initial={{ scale: 0.5, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
