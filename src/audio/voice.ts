// Bolt's voice via speechSynthesis. Prefers Indian English natural voices, drops broken "undefined" voices,
// strips emoji, cancels the previous line, chunks long text (Chrome stalls on ~15 s utterances).

let enabled = false;
let chosen: SpeechSynthesisVoice | null = null;
let ready: Promise<void> | null = null;
let token = 0;
const LS_KEY = 'startup-game.voice';

const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);

function usable(v: SpeechSynthesisVoice) {
  return !!v.name && !/undefined/i.test(v.name) && !/undefined/i.test(v.lang ?? '');
}
function score(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = (v.lang ?? '').toLowerCase().replace('_', '-');
  const natural = name.includes('natural') || name.includes('neural');
  let s = 0;
  if (lang === 'en-in') s += 100;
  else if (lang.startsWith('en-gb')) s += 40;
  else if (lang.startsWith('en')) s += 25;
  else return -1;
  if (natural) s += 50;
  if (name.includes('neerja')) s += 30;
  else if (name.includes('prabhat')) s += 20;
  if (name.includes('google') && lang === 'en-in') s += 15;
  if (name.includes('heera') || name.includes('ravi')) s += 5;
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
  const ranked = all.map(v => [score(v), v] as const).filter(([sc]) => sc >= 0).sort((a, b) => b[0] - a[0]);
  return ranked[0]?.[1] ?? all.find(v => v.default) ?? all[0];
}

function load(): Promise<void> {
  if (ready) return ready;
  ready = new Promise<void>(resolve => {
    const s = synth();
    if (!s) return resolve();
    const done = () => { chosen = pick(); resolve(); };
    if (s.getVoices().length) return done();
    const t = setTimeout(done, 2000);
    s.addEventListener('voiceschanged', () => { clearTimeout(t); done(); }, { once: true });
  });
  // keep the choice fresh if the list changes later (Edge loads online voices late)
  synth()?.addEventListener('voiceschanged', () => { chosen = pick(); });
  return ready;
}
if (typeof window !== 'undefined') void load();

/** Make text speakable: no emoji, villain name said nicely, rupees spelled out. */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{FE0E}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu, '')
    .replace(/rAIvan/g, 'Raavan')
    .replace(/₹\s?(\d+)/g, '$1 rupees')
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/\.\.\.|…/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}
function chunks(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  const out: string[] = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + p).length > 160 && cur) { out.push(cur.trim()); cur = p; } else cur += p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

async function say(text: string) {
  const s = synth();
  if (!enabled || !s) return;
  const my = ++token;
  s.cancel();
  await load();
  if (my !== token || !enabled) return;
  const clean = cleanForSpeech(text);
  if (!clean) return;
  for (const part of chunks(clean)) {
    const u = new SpeechSynthesisUtterance(part);
    if (chosen) { u.voice = chosen; u.lang = chosen.lang; } else u.lang = 'en-IN';
    u.rate = 0.95; u.pitch = 1.1; u.volume = 1;
    s.speak(u);
  }
}

export const voice = {
  say: (text: string) => { void say(text); },
  stop: () => { token++; synth()?.cancel(); },
  setEnabled: (b: boolean) => { enabled = b; if (!b) { token++; synth()?.cancel(); } },
  isEnabled: () => enabled,
  /** usable voices (for an admin picker) */
  list: () => (synth()?.getVoices() ?? []).filter(usable).map(v => ({ name: v.name, lang: v.lang })),
  current: () => chosen?.name ?? null,
  setVoice: (name: string | null) => {
    try { if (name) localStorage.setItem(LS_KEY, name); else localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    chosen = pick();
  },
  ready: () => load(),
};
