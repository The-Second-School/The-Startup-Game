import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { TEAM_COLORS } from '../game/content';
import type { Team } from '../game/types';

// ---------- Buttons ----------
export type Tone = 'sun' | 'soft' | 'good' | 'bad' | 'plain' | 'purple';

interface BtnProps {
  tone?: Tone;
  face?: string; ink?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  keepFocus?: boolean;
  type?: 'button' | 'submit';
  label?: string;
  autoFocus?: boolean;
}
/** Flat button with an even white border and a springy press. */
export function Btn({ tone = 'soft', face, ink, size = 'md', disabled, onClick, children, className = '', style, keepFocus, type = 'button', label, autoFocus }: BtnProps) {
  const vars = { ...(face ? { '--f': face } : {}), ...(ink ? { '--i': ink } : {}), ...style } as CSSProperties;
  return (
    <button type={type} className={`btn btn-${size} btn-${tone} ${className}`} style={vars} disabled={disabled} onClick={onClick} aria-label={label} autoFocus={autoFocus}
      onMouseDown={keepFocus ? e => e.preventDefault() : undefined}>
      {children}
    </button>
  );
}

/** Toggle chip: sun when on, pale when off. */
export function Chip({ on, onClick, children, disabled, style }: { on?: boolean; onClick?: () => void; children: ReactNode; disabled?: boolean; style?: CSSProperties }) {
  return <Btn size="md" tone={on ? 'sun' : 'soft'} onClick={onClick} disabled={disabled} style={style}>{children}</Btn>;
}

// ---------- Layout ----------
export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <section className={`card ${className}`} style={style}>{children}</section>;
}
/** Small section label above a group of controls. */
export function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return <div className="label"><span>{children}</span>{right}</div>;
}
export function Pill({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'good' | 'sun' | 'bad' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}
/** Friendly empty or waiting text. */
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
/** Collapsible card for optional shortcuts. */
export function Fold({ title, hint, children, open: initial = false }: { title: string; hint?: string; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <section className="card fold">
      <button type="button" className="fold-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="fold-title">{title}{hint && <small>{hint}</small>}</span>
        <svg viewBox="0 0 24 24" width="24" height="24" className={`chev ${open ? 'chev-open' : ''}`} aria-hidden><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && <div className="fold-body">{children}</div>}
    </section>
  );
}

// ---------- Team bits ----------
export function TeamDot({ team, size = 32 }: { team: Pick<Team, 'colorIndex' | 'name'>; size?: number }) {
  const c = TEAM_COLORS[team.colorIndex % TEAM_COLORS.length];
  return (
    <span className="tdot" style={{ width: size, height: size, background: c.base, fontSize: size * 0.5 }}>
      {(team.name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** One team per line: dot, name, optional right side. Rows sit inside one card with hairline dividers. */
export function TeamLine({ team, right, below, hot, onTap }: { team: Team; right?: ReactNode; below?: ReactNode; hot?: boolean; onTap?: () => void }) {
  return (
    <div className={`tline ${hot ? 'tline-hot' : ''}`}>
      {onTap ? (
        <button type="button" className="tline-top tline-tap" onClick={onTap}>
          <TeamDot team={team} />
          <div className="tline-name">{team.name || 'Team'}</div>
          {right && <div className="tline-right">{right}</div>}
        </button>
      ) : (
        <div className="tline-top">
          <TeamDot team={team} />
          <div className="tline-name">{team.name || 'Team'}</div>
          {right && <div className="tline-right">{right}</div>}
        </div>
      )}
      {below && <div className="tline-below">{below}</div>}
    </div>
  );
}

// ---------- Sheet + switch ----------
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="sheet-title">{title}</div>
          <Btn size="md" tone="soft" onClick={onClose}>Done</Btn>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function Switch({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button type="button" className="switch-row" onClick={() => onChange(!on)} role="switch" aria-checked={on}>
      <span className="switch-text"><b>{label}</b>{sub && <small>{sub}</small>}</span>
      <span className={`switch ${on ? 'switch-on' : ''}`}><i /></span>
    </button>
  );
}

// ---------- Clock ----------
export function useNow(ms = 500) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}

/** Text input that commits on Enter or blur (so we do not spam the undo stack while typing). */
export function CommitInput({ value, onCommit, placeholder, max = 24 }: { value: string; onCommit: (v: string) => void; placeholder?: string; max?: number }) {
  const [draft, setDraft] = useState(value);
  const editing = useRef(false);
  useEffect(() => { if (!editing.current) setDraft(value); }, [value]);
  const commit = () => { editing.current = false; const v = draft.trim(); if (v !== value) onCommit(v); };
  return (
    <input className="input" value={draft} maxLength={max} placeholder={placeholder} enterKeyHint="done" autoComplete="off" autoCorrect="off" autoCapitalize="words"
      onFocus={() => { editing.current = true; }}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur(); } }} />
  );
}
