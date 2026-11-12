// Bolt's voice via speechSynthesis.
// - Prefers a young-sounding MALE voice (Indian English first), pitched up a little so he sounds like an energetic robot kid.
// - Tones: normal, excited, cheer, whisper (secret), villain, calm.
// - Pronunciation fixes live in cleanForSpeech (A.I., who, psst, oh no, cash, rupees ...).
// - say() returns a promise that resolves when the line has been spoken (or was cancelled), so narration can run in sequence.
// - Exposes status ('loading' | 'ready' | 'unsupported') so the screen can show a "voice is loading" chip.

export type Tone = 'normal' | 'excited' | 'cheer' | 'whisper' | 'villain' | 'calm';
export type VoiceStatus = 'loading' | 'ready' | 'blocked' | 'unsupported';

// On by default: child components (scenes) start speaking BEFORE the app's settings effect runs on a page load, which used to make the first lines silent.
let enabled = true;
let chosen: SpeechSynthesisVoice | null = null;
let ready: Promise<void> | null = null;
let status: VoiceStatus = 'loading';
let speaking = false;
let token = 0;
const LS_KEY = 'startup-game.voice';
const statusSubs = new Set<(s: VoiceStatus) => void>();
const speakSubs = new Set<(b: boolean) => void>();
const unlockSubs = new Set<() => void>();

const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);
const setStatus = (s: VoiceStatus) => { if (s !== status) { status = s; statusSubs.forEach(f => f(s)); } };
const setSpeaking = (b: boolean) => { if (b !== speaking) { speaking = b; speakSubs.forEach(f => f(b)); } };

const FEMALE = ['neerja', 'heera', 'zira', 'aria', 'jenny', 'sonia', 'libby', 'emma', 'michelle', 'ana', 'samantha', 'karen', 'susan', 'hazel', 'linda', 'kalpana', 'swara', 'female', 'natasha', 'clara', 'mia', 'nancy', 'jane', 'sara', 'monica', 'tessa', 'fiona', 'moira', 'veena', 'victoria', 'catherine', 'yara', 'elsa', 'ava', 'amy', 'joanna', 'salli', 'kimberly', 'ivy', 'kendra', 'zoe', 'allison', 'priya', 'lekha', 'shruti'];
const MALE = ['prabhat', 'ravi', 'hemant', 'ryan', 'guy', 'andrew', 'brian', 'christopher', 'eric', 'davis', 'tony', 'jason', 'mark', 'david', 'george', 'james', 'daniel', 'thomas', 'oliver', 'alex', 'fred', 'male', 'rishi', 'aarav', 'rehaan', 'steffan', 'roger', 'liam', 'sean', 'jacob', 'matthew', 'justin', 'kevin', 'joey', 'matthew', 'brandon', 'adam', 'arthur'];

function usable(v: SpeechSynthesisVoice) {
  return !!v.name && !/undefined/i.test(v.name) && !/undefined/i.test(v.lang ?? '');
}
function score(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = (v.lang ?? '').toLowerCase().replace('_', '-');
  const natural = name.includes('natural') || name.includes('neural') || name.includes('online');
  let s = 0;
  if (lang === 'en-in') s += 100;
  else if (lang.startsWith('en-gb')) s += 45;
  else if (lang.startsWith('en-us')) s += 38;
  else if (lang.startsWith('en')) s += 25;
  else return -1000;
  if (FEMALE.some(f => name.includes(f))) s -= 150;
  if (MALE.some(m => name.includes(m))) s += 120;
  if (natural) s += 50;
  if (name.includes('prabhat')) s += 30;
  if (name.includes('ryan') || name.includes('guy')) s += 12;
  if (name.includes('google') && /male/.test(name) && !/female/.test(name)) s += 40;
  if (v.localService) s += 2;
  return s;
}

function pick(): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const all = s.getVoices().filter(usable);
  if (!all.length) return null;
  let stored: string | null = null;
  try { stored = localStorage.getItem(LS_KEY); } catch { /* ignore */ }
  if (stored) {
    const v = all.find(x => x.name === stored);
    if (v) return v;
  }
  const ranked = all.map(v => [score(v), v] as const).filter(([sc]) => sc > -500).sort((a, b) => b[0] - a[0]);
  return ranked[0]?.[1] ?? all.find(v => v.default) ?? all[0];
}

/** Tries to wake the speech engine with a silent word so the first real line is not delayed. */
function warm() {
  const s = synth();
  if (!s) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    if (chosen) u.voice = chosen;
    s.speak(u);
  } catch { /* ignore */ }
}

function load(): Promise<void> {
  if (ready) return ready;
  ready = new Promise<void>(resolve => {
    const s = synth();
    if (!s) { setStatus('unsupported'); return resolve(); }
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      chosen = pick();
      warm();
      setStatus('ready');
      resolve();
    };
    if (s.getVoices().length) return finish();
    // Voices arrive late (esp. Edge online voices after a reload): wait for them, but never longer than 6 s.
    const t = setTimeout(finish, 6000);
    s.addEventListener('voiceschanged', () => { clearTimeout(t); finish(); }, { once: true });
    // some browsers never fire voiceschanged: poll briefly
    let n = 0;
    const poll = setInterval(() => { if (finished || ++n > 30) { clearInterval(poll); return; } if (s.getVoices().length) { clearTimeout(t); clearInterval(poll); finish(); } }, 200);
  });
  // keep the choice fresh if the list changes later (Edge loads its online voices late)
  synth()?.addEventListener('voiceschanged', () => { chosen = pick(); });
  return ready;
}
if (typeof window !== 'undefined') void load();

// Browsers (Chrome, Edge) may refuse to speak until the page has had one tap or key press. Warm the engine on the first gesture,
// and if a line was refused ('not-allowed') show the "tap once" hint and replay the narration after that first tap.
let gestureSeen = false;
function onGesture() {
  gestureSeen = true;
  warm();
  if (status === 'blocked') { setStatus('ready'); unlockSubs.forEach(f => f()); }
}
if (typeof window !== 'undefined') {
  const once = () => { removeEventListener('pointerdown', once, true); removeEventListener('keydown', once, true); onGesture(); };
  addEventListener('pointerdown', once, true);
  addEventListener('keydown', once, true);
}
function markBlocked() {
  if (gestureSeen) return;
  setStatus('blocked');
  const retry = () => { removeEventListener('pointerdown', retry, true); removeEventListener('keydown', retry, true); onGesture(); };
  addEventListener('pointerdown', retry, true);
  addEventListener('keydown', retry, true);
}

// ---------- pronunciation ----------
const KEEP_CAPS = new Set(['AI', 'TV', 'CEO', 'OK', 'USB', 'UPI', 'PIN', 'ID', 'SMS', 'GPS', 'AM', 'PM', 'STEM', 'LOL', 'DIY', 'FAQ', 'VIP', 'PC', 'UK', 'USA', 'IT']);

/** Make text speakable: no emoji, tricky words respelled, rupees spelled out. Only changes what is SAID, never what is shown. */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{FE0E}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu, '')
    .replace(/\bFibbot\b/g, 'Fib-bot')
    .replace(/\bA\.?\s?I\.?(?=\W|$)/g, 'A. I.')              // "AI" would be read as "ay" + a short "i"
    .replace(/\b[Pp][Ss][Ss]+[Tt]\b/g, 'hey, come closer')    // "psst" is read letter by letter
    .replace(/\b[Uu]h[- ]?[Oo]h\b/g, 'oh no')
    .replace(/\bcash\b/gi, 'kash')
    .replace(/\b[A-Z]{2,}\b/g, w => (KEEP_CAPS.has(w) ? w : w.charAt(0) + w.slice(1).toLowerCase()))   // "WHO" is a word, not W-H-O
    .replace(/\bWho\b/g, 'who')
    .replace(/₹\s?(\d+)/g, '$1 rupees')
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/\s[–—-]\s/g, ', ')
    .replace(/\.\.\.|…/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}
function chunks(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  const out: string[] = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + p).length > 150 && cur) { out.push(cur.trim()); cur = p; } else cur += p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const TONES: Record<Tone, { rate: number; pitch: number; volume: number }> = {
  normal: { rate: 1.08, pitch: 1.3, volume: 1 },
  calm: { rate: 0.98, pitch: 1.15, volume: 1 },
  excited: { rate: 1.18, pitch: 1.5, volume: 1 },
  cheer: { rate: 1.22, pitch: 1.6, volume: 1 },
  whisper: { rate: 0.9, pitch: 0.9, volume: 0.32 },
  villain: { rate: 0.95, pitch: 0.7, volume: 1 },
};

export interface SayOpts { tone?: Tone; /** what to say when it differs from the text on screen */ speech?: string }

/** Rough reading time in ms for text (used when the voice is off, and as a safety net). */
export const readMs = (text: string) => Math.max(1600, 900 + text.length * 62);

function say(text: string, opts: SayOpts = {}): Promise<void> {
  return new Promise<void>(resolve => {
    const s = synth();
    if (!enabled || !s) { resolve(); return; }
    const my = ++token;
    s.cancel();
    void load().then(() => {
      if (my !== token || !enabled) { resolve(); return; }
      const clean = cleanForSpeech(opts.speech ?? text);
      if (!clean) { resolve(); return; }
      const t = TONES[opts.tone ?? 'normal'];
      const parts = chunks(clean);
      let left = parts.length;
      let settled = false;
      const done = () => { if (settled) return; settled = true; clearTimeout(guard); if (my === token) setSpeaking(false); resolve(); };
      const guard = setTimeout(done, readMs(clean) * 1.8 + 2500);   // Chrome sometimes never fires onend
      setSpeaking(true);
      for (const part of parts) {
        const u = new SpeechSynthesisUtterance(part);
        if (chosen) { u.voice = chosen; u.lang = chosen.lang; } else u.lang = 'en-IN';
        u.rate = t.rate; u.pitch = t.pitch; u.volume = t.volume;
        u.onend = () => { if (--left <= 0 || my !== token) done(); };
        u.onerror = ev => { if ((ev as SpeechSynthesisErrorEvent).error !== 'canceled' && (ev as SpeechSynthesisErrorEvent).error !== 'interrupted') console.warn('[voice] speech error:', (ev as SpeechSynthesisErrorEvent).error); if ((ev as SpeechSynthesisErrorEvent).error === 'not-allowed') markBlocked(); if (--left <= 0 || my !== token) done(); };
        s.speak(u);
      }
      try { s.resume(); } catch { /* ignore */ }
    });
  });
}

export const voice = {
  say: (text: string, opts?: SayOpts) => say(text, opts),
  stop: () => { token++; synth()?.cancel(); setSpeaking(false); },
  setEnabled: (b: boolean) => { enabled = b; if (!b) { token++; synth()?.cancel(); setSpeaking(false); } else void load(); },
  isEnabled: () => enabled,
  status: () => status,
  isSpeaking: () => speaking,
  onStatus: (f: (s: VoiceStatus) => void) => { statusSubs.add(f); return () => { statusSubs.delete(f); }; },
  /** Called after the first tap/key press unblocked a refused voice (replay the current narration then). */
  onUnlock: (f: () => void) => { unlockSubs.add(f); return () => { unlockSubs.delete(f); }; },
  onSpeaking: (f: (b: boolean) => void) => { speakSubs.add(f); return () => { speakSubs.delete(f); }; },
  /** usable voices (for an admin picker) */
  list: () => (synth()?.getVoices() ?? []).filter(usable).map(v => ({ name: v.name, lang: v.lang })),
  current: () => chosen?.name ?? null,
  setVoice: (name: string | null) => {
    try { if (name) localStorage.setItem(LS_KEY, name); else localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    chosen = pick();
  },
  ready: () => load(),
};
