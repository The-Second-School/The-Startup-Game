// Freeze the whole big screen at the exact frame (host "Freeze" button).
// How: a virtual clock. performance.now / Date.now stop advancing, requestAnimationFrame callbacks are held, setTimeout /
// setInterval are suspended with their remaining time, CSS + Web Animations are paused in place, speech and sound are paused.
// On resume everything continues from the same instant with no jump. MUST be imported before React / motion (main.tsx does it first),
// because motion captures requestAnimationFrame when it loads.

type Rec = { fn: (...a: unknown[]) => void; args: unknown[]; delay: number; start: number; every: boolean; real: number };

let frozen = false;
let frozenAt = 0;       // real performance.now when frozen
let frozenDate = 0;
let offset = 0;         // total real ms spent frozen
const realNow = performance.now.bind(performance);
const realDate = Date.now.bind(Date);
const realRaf = window.requestAnimationFrame.bind(window);
const realCaf = window.cancelAnimationFrame.bind(window);
const realSt = window.setTimeout.bind(window);
const realCt = window.clearTimeout.bind(window);
const realSi = window.setInterval.bind(window);
const realCi = window.clearInterval.bind(window);

const vnow = () => (frozen ? frozenAt : realNow()) - offset;

const isPhone = typeof location !== 'undefined' && (location.hash.startsWith('#/admin') || location.hostname.startsWith('admin.'));
if (typeof window !== 'undefined' && !isPhone && !(window as unknown as { __frz?: boolean }).__frz) {
  (window as unknown as { __frz?: boolean }).__frz = true;
  performance.now = () => vnow();
  Date.now = () => (frozen ? frozenDate : realDate()) - offset;

  // ---- animation frames ----
  let rafSeq = 0;
  const live = new Map<number, FrameRequestCallback>();   // virtual id -> cb
  const arm = (id: number) => {
    const cb = live.get(id);
    if (!cb) return;
    realRaf(t => {
      if (!live.has(id)) return;
      if (frozen) return;                                  // held: re-armed on resume
      live.delete(id);
      cb(t - offset);
    });
  };
  window.requestAnimationFrame = (cb: FrameRequestCallback) => { const id = ++rafSeq; live.set(id, cb); arm(id); return id; };
  window.cancelAnimationFrame = (id: number) => { live.delete(id); };
  void realCaf;

  // ---- timers ----
  let tSeq = 0;
  const timers = new Map<number, Rec>();
  const schedule = (id: number, r: Rec, wait: number) => {
    r.real = realSt(() => {
      const rec = timers.get(id);
      if (!rec) return;
      if (rec.every) { rec.start = vnow(); schedule(id, rec, rec.delay); } else timers.delete(id);
      rec.fn(...rec.args);
    }, Math.max(0, wait)) as unknown as number;
  };
  const add = (every: boolean) => (fn: TimerHandler, delay = 0, ...args: unknown[]) => {
    if (typeof fn !== 'function') return realSt(fn as string, delay);
    const id = ++tSeq;
    const r: Rec = { fn: fn as Rec['fn'], args, delay: Math.max(0, delay || 0), start: vnow(), every, real: 0 };
    timers.set(id, r);
    if (frozen) r.start = vnow() - 0; else schedule(id, r, r.delay);
    return id;
  };
  window.setTimeout = add(false) as unknown as typeof setTimeout;
  window.setInterval = add(true) as unknown as typeof setInterval;
  const clear = (id?: number) => { if (id === undefined) return; const r = timers.get(id); if (r) { realCt(r.real); realCi(r.real); timers.delete(id); } };
  window.clearTimeout = clear as typeof clearTimeout;
  window.clearInterval = clear as typeof clearInterval;
  void realSi; void realCi;

  const paused = new Set<Animation>();
  const hooks = new Set<(on: boolean) => void>();

  (window as unknown as { __freeze: (on: boolean) => void }).__freeze = (on: boolean) => {
    if (on === frozen) return;
    if (on) {
      // remaining time of every timer, then stop them
      const t = vnow();
      for (const r of timers.values()) { realCt(r.real); r.delay = Math.max(0, r.delay - (t - r.start)); r.start = t; }
      frozenAt = realNow(); frozenDate = realDate(); frozen = true;
      for (const a of document.getAnimations()) { if (a.playState === 'running') { a.pause(); paused.add(a); } }
      document.documentElement.classList.add('is-frozen');
    } else {
      offset += realNow() - frozenAt;
      frozen = false;
      document.documentElement.classList.remove('is-frozen');
      for (const a of paused) { try { a.play(); } catch { /* finished or removed */ } }
      paused.clear();
      for (const [id, r] of timers) { r.start = vnow(); schedule(id, r, r.delay); }
      for (const id of live.keys()) arm(id);
    }
    hooks.forEach(h => h(on));
  };
  (window as unknown as { __onFreeze: (h: (on: boolean) => void) => void }).__onFreeze = h => { hooks.add(h); };
}

export const isFrozen = () => frozen;
/** Freeze (true) or resume (false) everything on this page. Also pauses speech and sound via the registered hooks. */
export function setFrozen(on: boolean) {
  (window as unknown as { __freeze?: (b: boolean) => void }).__freeze?.(on);
}
export function onFreeze(h: (on: boolean) => void) {
  (window as unknown as { __onFreeze?: (h: (on: boolean) => void) => void }).__onFreeze?.(h);
}
