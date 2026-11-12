// Focus kit (host points 6 and 70): when a NEW main subject arrives (a character, a prop, anything), everything else is faded,
// darkened, de-saturated and softly blurred, and the subject is lifted: bigger, with a clear white halo, on top.
//
// Usage in a scene / intro (keep the structure flat):
//   <Focus active={beatHasSubject}>
//     <Backdrop> ...all background art (sky, city, props, extra characters)... </Backdrop>
//     <Subject at={{ x: 960, y: 640 }} scale={1.2}> ...the one thing the narration is about... </Subject>
//   </Focus>
// `active` false = everything normal (no dimming, subject at scale 1). Switch it per beat; it animates smoothly (~0.5 s).
// Several subjects can share one Focus and take turns with `on` (overrides `active` for that subject only).
// A Subject whose content is absolutely placed (Mv) needs a fixed box: pass `w` and `h`, then place the Mv inside (left/top relative to the box).
// Performance: only transform/opacity/filter on a few big static layers. The blur is small (4 px) and transitions are short.
import { motion } from 'motion/react';
import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';

const FocusCtx = createContext(false);
export const useFocusActive = () => useContext(FocusCtx);

const fill: CSSProperties = { position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 };

export function Focus({ active, children }: { active: boolean; children: ReactNode }) {
  return <FocusCtx.Provider value={active}><div style={{ ...fill, overflow: 'visible' }}>{children}</div></FocusCtx.Provider>;
}

/** Everything that is NOT the main subject. Fades, darkens, de-saturates and blurs a little while a subject has focus. */
export function Backdrop({ children, blur = 4, dim = 0.6, style }: { children: ReactNode; blur?: number; dim?: number; style?: CSSProperties }) {
  const active = useContext(FocusCtx);
  return (
    <motion.div style={{ ...fill, overflow: 'visible', ...style }} initial={false}
      animate={{ opacity: active ? dim + 0.15 : 1, filter: active ? `blur(${blur}px) brightness(${0.75}) saturate(${0.7})` : 'blur(0px) brightness(1) saturate(1)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/** The main subject: lifted above the dimmed backdrop, a little bigger, with a white halo so it is clearly THE thing to look at.
 *  at + anchor place the box on the stage; anchor 'c' centres it, 'bc' puts its bottom-centre on `at`, 'tl' its top-left.
 *  w / h give the box a size (needed when the content is absolutely placed, and for a correct halo and centring). */
export function Subject({ children, at, scale = 1.15, halo = true, anchor = 'c', z = 26, style, on, w, h }: {
  children: ReactNode; at?: { x: number; y: number }; scale?: number; halo?: boolean; anchor?: 'c' | 'bc' | 'tl'; z?: number; style?: CSSProperties;
  /** Overrides the focus context for this subject only (for one Focus that holds several subjects taking turns). */
  on?: boolean; w?: number; h?: number;
}) {
  const ctx = useContext(FocusCtx);
  const active = on ?? ctx;
  const tf = anchor === 'c' ? 'translate(-50%, -50%)' : anchor === 'bc' ? 'translate(-50%, -100%)' : undefined;
  const origin = anchor === 'c' ? '50% 50%' : anchor === 'bc' ? '50% 100%' : '0 0';
  return (
    <div style={{ position: 'absolute', left: at?.x ?? 0, top: at?.y ?? 0, transform: tf, zIndex: z, width: w, height: h, ...style }}>
      <motion.div initial={false} animate={{ scale: active ? scale : 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        style={{ transformOrigin: origin, position: 'relative', width: w, height: h }}>
        {halo && (
          <motion.div initial={false} animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.8 }} transition={{ duration: 0.45 }}
            style={{ position: 'absolute', inset: -28, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', filter: 'blur(14px)', zIndex: -1, pointerEvents: 'none' }} />
        )}
        {children}
      </motion.div>
    </div>
  );
}
