// Scene player (owner: scenes). Scene art lives in ./acts/<sceneId>.tsx and ./intros/<anim>.tsx (owners: scenes agents).
// Each art file default-exports a component. Missing files fall back to a simple placeholder, so the build never breaks.
//
// Narration rhythm (host points 26, 83): a beat only advances AFTER the voice has finished its line, plus a breathing gap
// (1.3 s, 2 s after important beats). When the voice is off or refused, the line is read at reading pace instead.
// The first line waits for the voice engine to be ready, so early lines are never silent.
// After the last beat of a scene with 2+ beats, an "In short" summary is spoken and shown; the art stays on its last beat.

import { AnimatePresence, motion } from 'motion/react';
import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react';
import { SCENES } from '../game/content';
import type { SceneId, Team } from '../game/types';
import { Bolt, SpeechBubble, Avatar } from '../ui';
import { voice } from '../audio';
import type { SceneBodyProps, IntroBodyProps } from './types';

export type { SceneBodyProps, IntroBodyProps } from './types';

// Scene art is code-split: each act / intro is its own chunk, fetched when first needed and prefetched when the browser is idle.
const actFiles = import.meta.glob<{ default: ComponentType<SceneBodyProps> }>('./acts/*.tsx');
const introFiles = import.meta.glob<{ default: ComponentType<IntroBodyProps> }>('./intros/*.tsx');
type Mod = { default: ComponentType<any> };
const lazyCache = new Map<string, LazyExoticComponent<ComponentType<any>>>();
const resolved = new Map<string, ComponentType<any>>();
const loadArt = (files: Record<string, () => Promise<Mod>>, path: string) => files[path]().then(m => { resolved.set(path, m.default); return m; });
// Once a chunk has arrived we hand out the real component (no Suspense round trip, which React also throttles by ~300 ms).
function lazyArt<P>(files: Record<string, () => Promise<Mod>>, path: string): ComponentType<P> | null {
  if (!files[path]) return null;
  const done = resolved.get(path);
  if (done) return done as ComponentType<P>;
  let c = lazyCache.get(path);
  if (!c) { c = lazy(() => loadArt(files, path)); lazyCache.set(path, c); }
  return c as ComponentType<P>;
}
const bodyFor = (id: string) => lazyArt<SceneBodyProps>(actFiles, `./acts/${id}.tsx`);
const introFor = (id: string) => lazyArt<IntroBodyProps>(introFiles, `./intros/${id}.tsx`);

// Warm the chunks once the first view is up so a scene never waits on the network mid-game.
const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 1500));
export function prefetchScenes() {
  const all = [
    ...Object.keys(actFiles).map(k => () => loadArt(actFiles, k)),
    ...Object.keys(introFiles).map(k => () => loadArt(introFiles, k)),
  ];
  let i = 0;
  const next = () => { if (i < all.length) { void all[i++](); idle(next); } };
  idle(next);
}

const BoltM = memo(Bolt);
const AvatarM = memo(Avatar);

/** How long a narration beat stays up when it is read silently (kept for callers that time things themselves). */
export const beatMs = (text: string) => Math.max(4800, Math.min(9000, 1800 + text.length * 62));

type Tone = 'normal' | 'excited' | 'cheer' | 'whisper' | 'villain' | 'calm';
type Recap = { teamId: string; icon: string; text: string };

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, Math.max(0, ms)));
/** Reading pace for a line the voice cannot speak (same rule as the voice engine's own fallback). */
const readingMs = (text: string) => Math.max(1600, 900 + text.length * 62);

/** Tone per line: whispers for secrets and tips, excited for wins and steps, villain for Jhootu's own lines (not quoted speech). */
function toneFor(text: string): Tone {
  if (/psst|secret|\btip\b|shh|whisper/i.test(text)) return 'whisper';
  if (/jhootu/i.test(text) && !/[“"]/.test(text)) return 'villain';
  if (/golden|festival is here|works!|growing fast|step \d|coming|\bwins?\b|poof|boom/i.test(text)) return 'excited';
  return 'normal';
}
/** Lines that deserve a longer breath after them. */
const isImportant = (text: string, tone: Tone) => tone === 'excited' || tone === 'villain' || /step \d|golden|summary/i.test(text);

/** Speaks one line and resolves when it has been said. If the voice did not speak it (off, refused, unsupported), waits the reading time. */
async function speakLine(text: string, tone: Tone): Promise<void> {
  // Await the engine first: the parent screen turns the voice on in its own effect, which runs after ours on a reload,
  // so the enabled flag is only trustworthy once this promise has resolved.
  await voice.ready();
  const started = Date.now();
  if (voice.isEnabled()) {
    try { await voice.say(text, { tone }); } catch { /* fall back to reading time */ }
  }
  const spoke = Date.now() - started;
  if (spoke < 400) await sleep(readingMs(text) - spoke);
}

/** Holds the first line until the voice engine is ready (the engine caps its own wait at 6 s). */
function useVoiceArmed(): boolean {
  const [armed, setArmed] = useState(() => voice.status() !== 'loading');
  useEffect(() => {
    if (armed) return;
    let alive = true;
    void voice.ready().then(() => { if (alive) setArmed(true); });
    return () => { alive = false; };
  }, [armed]);
  return armed;
}

/** The player for one scene. Keyed by scene id (see ActScene) so every scene starts from beat 0. */
function ActPlayer({ sceneId, teams, recap, onDone }: { sceneId: SceneId; teams: Team[]; recap: Recap[]; onDone?: () => void }) {
  const scene = SCENES[sceneId];
  const n = scene.beats.length;
  const summary = n >= 2 ? scene.summary : undefined;
  const [beat, setBeat] = useState(0);
  const [inSummary, setInSummary] = useState(false);
  const armed = useVoiceArmed();
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const Body = useMemo(() => bodyFor(sceneId), [sceneId]);

  const raw = inSummary ? (summary ?? '') : (scene.beats[beat] ?? '');
  const recapBeat = !inSummary && raw.includes('(story so far)');
  const line = raw.replace(' (story so far)', '');
  const tone: Tone = inSummary ? 'calm' : toneFor(line);

  useEffect(() => {
    if (!armed) return;
    let alive = true;
    const big = inSummary || isImportant(line, tone);
    const gap = big ? 2000 : 1300;
    // the recap overlay needs time for its cards to slide in, whatever the voice does
    const holdMs = recapBeat ? Math.max(6500, 2600 + teams.length * 1400) : 0;
    void (async () => {
      const started = Date.now();
      await speakLine(inSummary ? `Summary. ${line}` : line, tone);
      await sleep(holdMs - (Date.now() - started) + gap);
      if (!alive) return;
      if (inSummary) { doneRef.current?.(); return; }
      if (beat + 1 < n) setBeat(beat + 1);
      else if (summary) setInSummary(true);
      else doneRef.current?.();
    })();
    return () => { alive = false; };
    // teams.length only tunes the recap hold; it must not restart the narration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, beat, inSummary]);

  const bubble = inSummary ? `Summary: ${line}` : line;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {/* isolated so art z-indexes can never paint over Bolt or the header */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate' }}>
        {Body ? <Suspense fallback={null}><Body beat={beat} beats={scene.beats} teams={teams} recap={recap} /></Suspense> : <Fallback title={scene.title} />}
      </div>
      {/* Recap overlay: "story so far", one card per team */}
      <AnimatePresence>
        {recapBeat && (
          <motion.div key="recap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 0, bottom: 0, left: -400, right: -400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, padding: '340px 60px 80px', flexWrap: 'wrap', background: 'rgba(255,252,243,0.7)' }}>
            {recap.map((r, i) => {
              const team = teams.find(t => t.id === r.teamId);
              return (
                <motion.div key={r.teamId}
                  initial={{ y: 80, scale: 0.6, rotate: i % 2 ? 6 : -6, opacity: 0 }}
                  animate={{ y: 0, scale: 1, rotate: i % 2 ? 2 : -2, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.5 + i * 0.9 }}
                  style={{ width: teams.length > 4 ? 520 : 400, background: '#fff', border: '6px solid #fff', borderRadius: 48, boxShadow: 'var(--sh)', padding: 28, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
                  {team && <AvatarM seed={team.avatarSeed} colorIndex={team.colorIndex} size={120} mood="happy" />}
                  <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05 }}>{team?.name}</div>
                  <div style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.15, color: 'var(--ink-soft)' }}>{r.icon} {r.text}</div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Bolt narrates on top */}
      <div style={{ position: 'absolute', left: 40, right: 40, top: 122, zIndex: 20, display: 'flex', alignItems: 'flex-start', gap: 28, pointerEvents: 'none' }}>
        <motion.div initial={{ x: -260, rotate: -20 }} animate={{ x: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
          <div className="ui-bob"><BoltM pose={beat === 0 && !inSummary ? 'wave' : 'talk'} size={180} talking /></div>
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div key={inSummary ? 'summary' : beat} initial={{ scale: 0.7, opacity: 0, y: -10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }} style={{ maxWidth: 1500, transformOrigin: 'left center' }}>
            <SpeechBubble text={bubble} side="left" typing size="lg" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export const ActScene = memo(function ActScene({ sceneId, teams, recap, onDone }: { sceneId: SceneId; teams: Team[]; recap: Recap[]; onDone?: () => void }) {
  return <ActPlayer key={sceneId} sceneId={sceneId} teams={teams} recap={recap} onDone={onDone} />;
});

export const QuestionIntro = memo(function QuestionIntro({ anim, text, onDone }: { anim: string; text: string; onDone?: () => void }) {
  const Body = useMemo(() => introFor(anim), [anim]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const armed = useVoiceArmed();
  useEffect(() => {
    if (!armed) return;
    let alive = true;
    const tone = toneFor(text);
    void (async () => {
      await speakLine(text, tone);
      await sleep(isImportant(text, tone) ? 2000 : 1300);
      if (alive) doneRef.current?.();
    })();
    return () => { alive = false; };
  }, [armed, text]);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate' }}>{Body ? <Suspense fallback={null}><Body /></Suspense> : <Fallback title="" />}</div>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 122, zIndex: 20, display: 'flex', alignItems: 'flex-start', gap: 28, pointerEvents: 'none' }}>
        <motion.div initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -200, opacity: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 20 }}><div className="ui-bob"><BoltM pose="talk" size={170} talking /></div></motion.div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 24, delay: 0.1 }} style={{ transformOrigin: 'left center', maxWidth: 1500 }}><SpeechBubble text={text} side="left" typing size="lg" /></motion.div>
      </div>
    </div>
  );
});

function Fallback({ title }: { title: string }) {
  return <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 96, fontWeight: 800 }}>{title}</div>;
}
