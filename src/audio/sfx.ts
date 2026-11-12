// Synthesised sound effects (Web Audio API). Bright, short, kid-friendly. All cues sit in C major so they harmonise.
// Chain: cue -> cue gain -> master gain -> compressor -> destination.
// The AudioContext is created/resumed on the first pointerdown/keydown anywhere (autoplay policy).

export type Sfx = 'pop' | 'tap' | 'lock' | 'whoosh' | 'ding' | 'gain' | 'loss' | 'buzz' | 'drumroll' | 'fanfare' | 'splat' | 'tick' | 'coin' | 'evil' | 'cheer' | 'clap' | 'gavel';
export const SFX_NAMES: Sfx[] = ['pop', 'tap', 'lock', 'whoosh', 'ding', 'gain', 'loss', 'buzz', 'drumroll', 'fanfare', 'splat', 'tick', 'coin', 'evil', 'cheer', 'clap', 'gavel'];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let enabled = true;
let volume = 0.6;
let active = 0;
const MAX_VOICES = 8;
const lastPlayed = new Map<string, number>();

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call from any user gesture to unlock audio. Also wired automatically to the first pointerdown/keydown. */
export function unlockAudio() { ensure(); }
if (typeof window !== 'undefined') {
  const once = () => { ensure(); };
  window.addEventListener('pointerdown', once, { capture: true });
  window.addEventListener('keydown', once, { capture: true });
}

// ---------- tiny synth helpers ----------
type Ctx = { c: AudioContext; out: GainNode; t: number; det: number };

function tone(x: Ctx, o: { type?: OscillatorType; f: number; f2?: number; at?: number; dur: number; vol?: number; attack?: number; glide?: number; lp?: number; vib?: number; vibRate?: number }) {
  const { c, out } = x;
  const t0 = x.t + (o.at ?? 0);
  const osc = c.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.f * x.det, t0);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2 * x.det), t0 + (o.glide ?? o.dur));
  const g = c.createGain();
  const vol = o.vol ?? 0.5;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack ?? 0.005));
  g.gain.exponentialRampToValueAtTime(0.001, t0 + o.dur);
  let node: AudioNode = osc;
  if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; node.connect(f); node = f; }
  if (o.vib) {
    const lfo = c.createOscillator(); const lg = c.createGain();
    lfo.frequency.value = o.vibRate ?? 6; lg.gain.value = o.vib;
    lfo.connect(lg).connect(osc.frequency); lfo.start(t0); lfo.stop(t0 + o.dur + 0.05);
  }
  node.connect(g).connect(out);
  osc.start(t0); osc.stop(t0 + o.dur + 0.05);
}

function noise(x: Ctx, o: { at?: number; dur: number; vol?: number; type?: BiquadFilterType; f: number; f2?: number; q?: number; attack?: number; sweep?: number }) {
  const { c, out } = x;
  if (!noiseBuf) return;
  const t0 = x.t + (o.at ?? 0);
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const flt = c.createBiquadFilter();
  flt.type = o.type ?? 'bandpass';
  flt.Q.value = o.q ?? 1;
  flt.frequency.setValueAtTime(o.f, t0);
  if (o.f2) flt.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.sweep ?? o.dur));
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.vol ?? 0.5, t0 + (o.attack ?? 0.004));
  g.gain.exponentialRampToValueAtTime(0.001, t0 + o.dur);
  src.connect(flt).connect(g).connect(out);
  src.start(t0, Math.random() * 1.5); src.stop(t0 + o.dur + 0.05);
}

// Note frequencies
const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.5, G6: 1568, C7: 2093 };

type Recipe = (x: Ctx, opt?: PlayOpts) => number; // returns duration in s
const R: Partial<Record<Sfx, Recipe>> = {
  tap: x => {
    tone(x, { f: 720, f2: 380, dur: 0.09, vol: 0.45, glide: 0.07 });
    noise(x, { dur: 0.02, vol: 0.12, type: 'highpass', f: 3000 });
    return 0.12;
  },
  pop: x => {
    tone(x, { f: 520, f2: 260, dur: 0.12, vol: 0.7, glide: 0.09 });
    tone(x, { f: 1040, f2: 620, dur: 0.06, vol: 0.18, glide: 0.05 });
    noise(x, { dur: 0.014, vol: 0.2, type: 'highpass', f: 2000 });
    return 0.15;
  },
  lock: x => { // ka-CHUNK + bright click
    tone(x, { f: 190, f2: 80, dur: 0.14, vol: 0.8, glide: 0.1 });
    noise(x, { dur: 0.05, vol: 0.4, type: 'bandpass', f: 1800, q: 2 });
    noise(x, { at: 0.07, dur: 0.035, vol: 0.45, type: 'highpass', f: 4000 });
    tone(x, { at: 0.08, f: N.G5, dur: 0.18, vol: 0.25, type: 'triangle' });
    tone(x, { at: 0.13, f: N.C6, dur: 0.3, vol: 0.28, type: 'triangle' });
    return 0.45;
  },
  whoosh: x => {
    noise(x, { dur: 0.42, vol: 0.5, type: 'bandpass', f: 400, f2: 3000, q: 1.2, attack: 0.15, sweep: 0.35 });
    return 0.45;
  },
  ding: x => {
    tone(x, { f: N.G5, dur: 0.25, vol: 0.4 });
    tone(x, { at: 0.11, f: N.C6, dur: 0.65, vol: 0.45 });
    tone(x, { at: 0.11, f: N.G6, dur: 0.5, vol: 0.1 });
    tone(x, { at: 0.11, f: N.C7, dur: 0.35, vol: 0.06 });
    return 0.8;
  },
  gain: x => { // happy rising sparkle
    [N.C6, N.E6, N.G6].forEach((f, i) => tone(x, { at: i * 0.07, f, dur: 0.22, vol: 0.32, type: 'triangle' }));
    tone(x, { at: 0.21, f: N.C7, dur: 0.4, vol: 0.18 });
    return 0.65;
  },
  loss: x => { // silly "wah-wah", not sad
    tone(x, { f: N.G4, f2: N.F4, dur: 0.24, vol: 0.32, type: 'triangle', lp: 1800 });
    tone(x, { at: 0.24, f: N.E4, f2: N.C4, dur: 0.5, vol: 0.32, type: 'triangle', lp: 1500, vib: 9, vibRate: 7, glide: 0.45 });
    return 0.8;
  },
  buzz: x => {
    tone(x, { f: 150, f2: 110, dur: 0.24, vol: 0.22, type: 'sawtooth', lp: 700, glide: 0.24 });
    tone(x, { f: 156, f2: 112, dur: 0.24, vol: 0.22, type: 'sawtooth', lp: 700, glide: 0.24 });
    return 0.3;
  },
  drumroll: (x, o) => {
    const len = o?.duration ?? 2.4;
    let t = 0, i = 0;
    while (t < len) {
      const k = t / len;
      noise(x, { at: t, dur: 0.06, vol: 0.12 + 0.55 * k, type: 'bandpass', f: 200 + 80 * (i % 2), q: 1 });
      noise(x, { at: t, dur: 0.03, vol: 0.05 + 0.15 * k, type: 'highpass', f: 2500 });
      t += 0.035 - 0.012 * k; i++;
    }
    tone(x, { at: len, f: 120, f2: 50, dur: 0.3, vol: 0.9 });
    noise(x, { at: len, dur: 0.9, vol: 0.35, type: 'highpass', f: 6000 });
    return len + 0.9;
  },
  fanfare: x => {
    const notes = [N.C5, N.E5, N.G5, N.C6];
    notes.forEach((f, i) => {
      tone(x, { at: i * 0.12, f, dur: 0.16, vol: 0.2, type: 'square', lp: 3000 });
      tone(x, { at: i * 0.12, f: f / 2, dur: 0.16, vol: 0.18, type: 'triangle' });
    });
    [N.C6, N.E6, N.G6].forEach(f => tone(x, { at: 0.48, f, dur: 0.9, vol: 0.14, type: 'square', lp: 3000, attack: 0.01 }));
    tone(x, { at: 0.48, f: N.C5, dur: 0.9, vol: 0.2, type: 'triangle' });
    return 1.45;
  },
  splat: x => {
    noise(x, { dur: 0.22, vol: 0.7, type: 'lowpass', f: 2400, f2: 300, q: 2, sweep: 0.18 });
    tone(x, { f: 300, f2: 70, dur: 0.18, vol: 0.55, glide: 0.15 });
    tone(x, { at: 0.03, f: 900, f2: 1800, dur: 0.07, vol: 0.12, type: 'triangle' });
    return 0.25;
  },
  tick: (x, o) => {
    tone(x, { f: 1000 + (o?.pitch ?? 0), dur: 0.04, vol: 0.45, type: 'triangle', attack: 0.002 });
    return 0.06;
  },
  coin: x => {
    tone(x, { f: N.B5, dur: 0.08, vol: 0.22, type: 'square', lp: 4000 });
    tone(x, { at: 0.075, f: N.E6, dur: 0.38, vol: 0.22, type: 'square', lp: 4000 });
    return 0.45;
  },
  evil: x => { // cartoon "mwa-ha-ha-ha": wobbly descending pulses + a low "dun-dun"
    const ha = [N.A4, N.G4, N.F4, N.D4];
    tone(x, { f: 110, dur: 0.5, vol: 0.3, type: 'sawtooth', lp: 500 });
    tone(x, { f: 116.5, dur: 0.5, vol: 0.2, type: 'sawtooth', lp: 500 });
    ha.forEach((f, i) => {
      const at = 0.28 + i * 0.17;
      tone(x, { at, f: f * 1.06, f2: f * 0.94, dur: 0.15, vol: 0.28, type: 'sawtooth', lp: 1400, glide: 0.14, attack: 0.012 });
      tone(x, { at, f: f * 2, f2: f * 1.9, dur: 0.12, vol: 0.06, type: 'square', lp: 2200 });
    });
    return 1.05;
  },
  cheer: x => { // "yaaay": noisy crowd swell + whistles + a happy chord
    noise(x, { dur: 1.2, vol: 0.32, type: 'bandpass', f: 900, f2: 1400, q: 0.7, attack: 0.18, sweep: 0.6 });
    noise(x, { dur: 1.0, vol: 0.18, type: 'bandpass', f: 2400, q: 1.5, attack: 0.12 });
    for (let i = 0; i < 4; i++) {
      const at = 0.1 + i * 0.18 + Math.random() * 0.05;
      const f = 1500 + Math.random() * 800;
      tone(x, { at, f, f2: f * 1.35, dur: 0.16, vol: 0.08, glide: 0.12 });
    }
    [N.C5, N.E5, N.G5].forEach((f, i) => tone(x, { at: 0.05 * i, f, dur: 0.6, vol: 0.12, type: 'triangle' }));
    return 1.25;
  },
};

R.clap = x => { // dramatic applause: a slow-clap start, then a crowd of claps swelling, then a final cheer
  const slow = [0, 0.32, 0.6, 0.84];
  slow.forEach((at, i) => {
    noise(x, { at, dur: 0.07, vol: 0.55 + i * 0.05, type: 'bandpass', f: 1500, q: 0.9 });
    noise(x, { at, dur: 0.04, vol: 0.28, type: 'highpass', f: 3200 });
  });
  let t = 1.0, k = 0;
  while (t < 2.3) {
    const swell = Math.min(1, (t - 1.0) / 0.9);
    noise(x, { at: t, dur: 0.06, vol: 0.14 + 0.4 * swell, type: 'bandpass', f: 1200 + Math.random() * 1600, q: 0.8 });
    if (k % 2) noise(x, { at: t + 0.012, dur: 0.04, vol: 0.12 * swell, type: 'highpass', f: 3500 });
    t += 0.045 + Math.random() * 0.03; k++;
  }
  noise(x, { at: 1.2, dur: 1.3, vol: 0.22, type: 'bandpass', f: 1000, f2: 1700, q: 0.6, attack: 0.5 });
  [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(x, { at: 1.9 + i * 0.05, f, dur: 0.5, vol: 0.1, type: 'triangle' }));
  return 2.7;
};
R.gavel = x => { // wooden hammer: a thud and a bright knock, "SOLD!"
  tone(x, { f: 170, f2: 70, dur: 0.18, vol: 0.9, glide: 0.12 });
  noise(x, { dur: 0.06, vol: 0.7, type: 'bandpass', f: 1400, q: 1.5 });
  tone(x, { at: 0.02, f: 900, f2: 500, dur: 0.07, vol: 0.2, type: 'triangle' });
  return 0.3;
};

export type PlayOpts = { pitch?: number; duration?: number; volume?: number };

function play(name: Sfx, opt?: PlayOpts) {
  if (!enabled) return;
  const c = ensure();
  if (!c || !master) return;
  const now = performance.now();
  const prev = lastPlayed.get(name) ?? -1e9;
  if (now - prev < (name === 'tick' ? 120 : 45)) return; // dedupe same cue fired twice at once
  lastPlayed.set(name, now);
  if (active >= MAX_VOICES) return;
  const out = c.createGain();
  out.gain.value = opt?.volume ?? 1;
  out.connect(master);
  const det = 1 + (Math.random() * 2 - 1) * (name === 'fanfare' || name === 'tick' ? 0.005 : 0.03);
  const dur = R[name]!({ c, out, t: c.currentTime + 0.005, det }, opt);
  active++;
  setTimeout(() => { active = Math.max(0, active - 1); out.disconnect(); }, (dur + 0.2) * 1000);
}

export const sfx = {
  play,
  setEnabled: (b: boolean) => { enabled = b; },
  isEnabled: () => enabled,
  /** master volume 0..1 (default 0.6) */
  setVolume: (v: number) => { volume = Math.max(0, Math.min(1, v)); if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02); },
  unlock: unlockAudio,
  /** Freeze (suspend) or resume all sound. */
  freeze: (on: boolean) => { if (!ctx) return; void (on ? ctx.suspend() : ctx.resume()); },
};
