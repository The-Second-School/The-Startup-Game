// Touch guard for a single-touch kiosk: act on pointerdown, ignore a second simultaneous pointer,
// debounce double taps per target, and block kid input while a reveal animation is playing.
import type { PointerEvent as RPointerEvent } from 'react';

const active = new Set<number>();
let installed = false;

export function installPointerGuard() {
  if (installed) return;
  installed = true;
  addEventListener('pointerdown', e => {
    // A primary pointer means nothing else is down: clear stale ids so a missed pointerup can never jam input.
    if (e.isPrimary) active.clear();
    active.add(e.pointerId);
  }, true);
  const rm = (e: PointerEvent) => { active.delete(e.pointerId); };
  addEventListener('pointerup', rm, true);
  addEventListener('pointercancel', rm, true);
  addEventListener('blur', () => active.clear());
}

let lockedUntil = 0;
/** Block kid taps for `ms` (reveal animations). */
export function lockInput(ms: number) { lockedUntil = Math.max(lockedUntil, performance.now() + ms); }
export function unlockInput() { lockedUntil = 0; }
export function inputLocked() { return performance.now() < lockedUntil; }

const last = new Map<string, number>();
let lastAny = 0;

export function acceptTap(e: RPointerEvent, key: string, opts: { ignoreLock?: boolean; debounce?: number } = {}) {
  if (!e.isPrimary) return false;
  if (e.pointerType === 'mouse' && e.button !== 0) return false;
  if (active.size > 1) return false;
  if (!opts.ignoreLock && inputLocked()) return false;
  const now = performance.now();
  if (now - (last.get(key) ?? -1e9) < (opts.debounce ?? 300)) return false;
  if (now - lastAny < 80) return false;
  last.set(key, now);
  lastAny = now;
  return true;
}
