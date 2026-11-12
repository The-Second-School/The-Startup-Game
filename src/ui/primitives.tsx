import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { sfx } from '../audio';
import { darken, inkOn, lighten, mix } from './palette';

// ---------------------------------------------------------------------------
// StageFrame: fixed design HEIGHT of 1080, design WIDTH that follows the window aspect (clamped 1440..2560), scaled by
// viewportHeight/1080 so it always fills the window (no bars in landscape). Content that was designed for 1920x1080 lives in a
// centred "frame" (see .scr-frame): when the stage is wider than 1920 the frame is centred and backgrounds bleed out on both sides,
// when it is narrower the frame is uniformly scaled down to fit. Portrait windows letterbox.
// CSS vars on .ui-stage: --stage-w (px), --bleed (px each side beyond 1920), --frame-s (frame scale).
// useStageScale() = window->stage scale (pointer coords: stageX = (clientX - rect.left) / scale); useStage() gives the rest.
// ---------------------------------------------------------------------------
export type StageInfo = { w: number; h: number; scale: number; frameScale: number; bleed: number; frameW: number; frameH: number };
const MIN_W = 1440, MAX_W = 2560;
const defaultStage: StageInfo = { w: 1920, h: 1080, scale: 1, frameScale: 1, bleed: 0, frameW: 1920, frameH: 1080 };
const StageCtx = createContext<StageInfo>(defaultStage);
/** Current stage geometry: design width w (1440..2560), height h (1080), window scale, frame scale (<1 when narrower than 1920) and bleed per side (>0 when wider than 1920). */
export const useStage = () => useContext(StageCtx);
export const useStageScale = () => useContext(StageCtx).scale;
/** Width available to the frame content in frame coordinates (1920 or wider). Use for strips that should stretch. */
export const useStageW = () => useContext(StageCtx).frameW;
/** Height available to the frame content in frame coordinates (1080, or taller when the window is narrower than 16:9). */
export const useStageH = () => useContext(StageCtx).frameH;

export function StageFrame({ children, pattern = true, style }: { children?: ReactNode; pattern?: boolean; blobs?: boolean; style?: CSSProperties }) {
  const [box, setBox] = useState(() => fit());
  useLayoutEffect(() => {
    const on = () => setBox(fit());
    on();
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);
  const { info, x, y } = box;
  const vars = { '--stage-w': `${info.w}px`, '--bleed': `${info.bleed}px`, '--frame-s': info.frameScale, '--frame-h': `${info.frameH}px`, '--fx': `${info.frameH - 1080}px`, '--grow': Math.min(1.2, info.frameH / 1080) } as CSSProperties;
  return (
    <div className="ui-stage-outer">
      <div className="ui-stage" style={{ width: info.w, transform: `translate(${x}px, ${y}px) scale(${info.scale})`, backgroundImage: pattern ? undefined : 'none', ...vars, ...style }}>
        <StageCtx.Provider value={info}>{children}</StageCtx.Provider>
      </div>
    </div>
  );
}
function fit() {
  if (typeof window === 'undefined') return { info: defaultStage, x: 0, y: 0 };
  const vw = Math.max(1, window.innerWidth), vh = Math.max(1, window.innerHeight);
  const w = Math.round(Math.min(MAX_W, Math.max(MIN_W, (vw / vh) * 1080)));
  const scale = Math.min(vw / w, vh / 1080);
  const info: StageInfo = { w, h: 1080, scale, frameScale: Math.min(1, w / 1920), bleed: Math.max(0, (w - 1920) / 2), frameW: Math.max(1920, w), frameH: 1080 / Math.min(1, w / 1920) };
  return { info, x: (vw - w * scale) / 2, y: (vh - 1080 * scale) / 2 };
}
// ---------------------------------------------------------------------------
// Button3D: chunky Duolingo button. Sound on pointerdown, press squash, action on click (pointerup inside).
// ---------------------------------------------------------------------------
type BtnProps = {
  color?: string; edge?: string; size?: 'md' | 'lg' | 'xl'; disabled?: boolean; onClick?: () => void;
  children?: ReactNode; className?: string; style?: CSSProperties;
  /** optional extras */
  textColor?: string; sound?: false | 'tap' | 'pop' | 'lock'; icon?: ReactNode;
};
export function Button3D({ color, edge, size = 'lg', disabled, onClick, children, className, style, textColor, sound = 'tap', icon }: BtnProps) {
  const [pressed, setPressed] = useState(false);
  const last = useRef(0);
  const c = color ?? 'var(--sun)';
  const isVar = c.startsWith('var(');
  const e = edge ?? (isVar ? (c === 'var(--sun)' ? 'var(--sun-edge)' : 'var(--paper-edge)') : darken(c, 0.16));
  const t = textColor ?? (isVar ? 'var(--ink)' : inkOn(c));
  const vars = disabled ? {} : ({ '--c': c, '--e': e, '--t': t } as CSSProperties);
  return (
    <button
      type="button"
      className={`ui-btn ui-btn-${size}${className ? ' ' + className : ''}`}
      disabled={disabled}
      data-pressed={pressed ? '1' : '0'}
      style={{ ...vars, ...style }}
      onPointerDown={ev => {
        if (disabled) return;
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        setPressed(true);
        if (sound) sfx.play(sound);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onClick={() => {
        if (disabled) return;
        const now = performance.now();
        if (now - last.current < 250) return; // debounce IR/capacitive jitter
        last.current = now;
        onClick?.();
      }}
    >
      {icon}
      <span className="ui-btn-label">{children}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Card: 3 stacked flat layers (lip, fill, inner panel) + white sticker border.
// ---------------------------------------------------------------------------
export function Card({ children, color, edge, className, style, padding = 32, inner, hi = true }: {
  children?: ReactNode; color?: string; edge?: string; className?: string; style?: CSSProperties; padding?: number;
  /** optional: inner panel colour (default: a light tint of the fill), or false for no inner panel */
  inner?: string | false; hi?: boolean;
}) {
  const fill = color ?? '#FFFFFF';
  const isVar = fill.startsWith('var(');
  const isWhite = !isVar && fill.toUpperCase() === '#FFFFFF';
  const e = edge ?? (isVar ? 'var(--paper-edge)' : isWhite ? '#EED9A0' : darken(fill, 0.16));
  const inC = inner === false ? 'transparent' : inner ?? (isVar ? 'var(--paper-3)' : isWhite ? '#FFF6D6' : lighten(fill, 0.72));
  const vars = { '--c': fill, '--e': e, '--in': inC } as CSSProperties;
  return (
    <div className={`ui-card${className ? ' ' + className : ''}`} style={{ ...vars, ...(inner === false ? { padding } : {}), ...style }}>
      {inner === false ? (
        <>{hi && <div className="ui-card-hi" />}{children}</>
      ) : (
        <div className="ui-card-inner" style={{ padding }}>
          {hi && <div className="ui-card-hi" style={{ background: isWhite ? '#fff' : mix(String(inC), '#ffffff', 0.7) }} />}
          <div style={{ position: 'relative', height: '100%' }}>{children}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pill: small chunky chip.
// ---------------------------------------------------------------------------
export function Pill({ children, color, edge, textColor, size = 'md', style, className }: {
  children?: ReactNode; color?: string; edge?: string; textColor?: string; size?: 'sm' | 'md' | 'lg'; style?: CSSProperties; className?: string;
}) {
  const c = color ?? 'var(--sun)';
  const isVar = c.startsWith('var(');
  const e = edge ?? (isVar ? (c === 'var(--sun)' ? 'var(--sun-edge)' : 'var(--paper-edge)') : c.toUpperCase() === '#FFFFFF' ? '#EED9A0' : darken(c, 0.16));
  const t = textColor ?? (isVar ? 'var(--ink)' : inkOn(c));
  return <span className={`ui-pill ui-pill-${size}${className ? ' ' + className : ''}`} style={{ '--c': c, '--e': e, '--t': t, ...style } as CSSProperties}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Num: THE number component. Every digit lives in its own fixed-width cell (0.6em, the tabular width of Baloo 2), so a changing number
// never changes width or wobbles. When a digit changes it rolls like an odometer (transform only). Cells are keyed from the right,
// so a digit never re-mounts when the number grows or shrinks; only the cell that is really new fades in. Works for signs and
// formats: pass a number (+ optional `format`) or a ready string such as '2:05', '₹40', '+12', '−3', '3/10'.
// ---------------------------------------------------------------------------
const DIGIT_LIST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
function Roll({ d, ms, fresh }: { d: number; ms: number; fresh: boolean }) {
  const born = useRef(fresh).current; // only a cell that mounts after the first render fades in; it never re-triggers
  return (
    <span className={`ui-nd${born ? ' is-new' : ''}`} aria-hidden>
      <span className="ui-nd-sizer">{d}</span>
      <span className="ui-nd-clip">
        <span className="ui-nd-strip" style={{ transform: `translateY(${-d}em)`, transitionDuration: `${ms}ms` }}>
          {DIGIT_LIST.map(n => <span key={n} className="ui-nd-d">{n}</span>)}
        </span>
      </span>
    </span>
  );
}
export function Num({ value, format, duration = 700, style, className }: { value: number | string; format?: (n: number) => string; duration?: number; style?: CSSProperties; className?: string }) {
  const text = typeof value === 'string' ? value : (format ?? String)(value);
  const chars = Array.from(text);
  const ready = useRef(false);
  useEffect(() => { ready.current = true; }, []);
  const fresh = ready.current;
  return (
    <span className={`ui-num${className ? ' ' + className : ''}`} style={style}>
      <span className="ui-sr">{text}</span>
      {chars.map((ch, i) => {
        const k = chars.length - i; // key from the right: stable when the number gets longer or shorter
        return /[0-9]/.test(ch)
          ? <Roll key={k} d={+ch} ms={duration} fresh={fresh} />
          : <span key={`c${k}`} className="ui-nc" aria-hidden>{ch === '-' ? '−' : ch}</span>;
      })}
    </span>
  );
}

/** CountUp: same API as before (value, duration, format, style, className); digits roll to the new value inside fixed-width cells. */
export function CountUp({ value, duration = 800, format, style, className }: { value: number; duration?: number; format?: (n: number) => string; style?: CSSProperties; className?: string }) {
  return <Num value={value} duration={duration} format={format} style={style} className={className} />;
}
