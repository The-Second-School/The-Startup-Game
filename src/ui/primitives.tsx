import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { sfx } from '../audio';
import { darken, inkOn, lighten, mix } from './palette';

// ---------------------------------------------------------------------------
// StageFrame: fixed 1920x1080 stage, uniformly scaled to fit the window, centred, letterboxed in --bg-2.
// useStageScale() gives the current scale (handy to convert pointer coords: stageX = (clientX - rect.left) / scale).
// ---------------------------------------------------------------------------
const ScaleCtx = createContext(1);
export const useStageScale = () => useContext(ScaleCtx);

export function StageFrame({ children, pattern = true, blobs = true, style }: { children?: ReactNode; pattern?: boolean; blobs?: boolean; style?: CSSProperties }) {
  const [box, setBox] = useState(() => fit());
  useLayoutEffect(() => {
    const on = () => setBox(fit());
    on();
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);
  return (
    <div className="ui-stage-outer">
      <div className="ui-stage" style={{ transform: `translate(${box.x}px, ${box.y}px) scale(${box.s})`, backgroundImage: pattern ? undefined : 'none', ...style }}>
        {blobs && <StageBlobs />}
        <ScaleCtx.Provider value={box.s}>{children}</ScaleCtx.Provider>
      </div>
    </div>
  );
}
function fit() {
  if (typeof window === 'undefined') return { s: 1, x: 0, y: 0 };
  const w = window.innerWidth, h = window.innerHeight;
  const s = Math.min(w / 1920, h / 1080);
  return { s, x: (w - 1920 * s) / 2, y: (h - 1080 * s) / 2 };
}
/** Big soft flat blobs in the corners of the stage (decorative, behind everything). */
function StageBlobs() {
  return (
    <svg className="ui-stage-blobs" viewBox="0 0 1920 1080" width={1920} height={1080} aria-hidden>
      <path fill="#FFF1CC" d="M-60 820c120-60 260-40 330 50s40 230-90 270-300 0-330-110 0-160 90-210z" />
      <path fill="#FFF1CC" d="M1640-80c140-20 300 40 320 160s-80 200-200 210-230-70-240-170 0-180 120-200z" />
      <circle cx="1810" cy="980" r="150" fill="#FFF1CC" />
      <circle cx="70" cy="120" r="90" fill="#FFF1CC" />
    </svg>
  );
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
// CountUp: animates from the previous value to the new one (ease-out). Writes straight to the DOM, no re-renders.
// ---------------------------------------------------------------------------
export function CountUp({ value, duration = 900, format, style, className }: { value: number; duration?: number; format?: (n: number) => string; style?: CSSProperties; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  const fmt = useRef(format);
  fmt.current = format;
  useEffect(() => {
    const el = ref.current;
    const from = shown.current, to = value;
    if (!el) return;
    if (from === to) { el.textContent = (fmt.current ?? String)(to); return; }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / Math.max(1, duration));
      const eased = 1 - (1 - k) ** 3;
      const v = Math.round(from + (to - from) * eased);
      shown.current = v;
      el.textContent = (fmt.current ?? String)(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span ref={ref} className={`ui-num${className ? ' ' + className : ''}`} style={style}>{(format ?? String)(shown.current)}</span>;
}
