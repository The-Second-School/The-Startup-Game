// Scene player (owner: orchestrator). Scene art lives in ./acts/<sceneId>.tsx and ./intros/<anim>.tsx (owners: scenes agents).
// Each art file default-exports a component. Missing files fall back to a simple placeholder, so the build never breaks.

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

/** How long a narration beat stays up: long enough to read aloud to kids. */
export const beatMs = (text: string) => Math.max(4800, Math.min(9000, 1800 + text.length * 62));

type Recap = { teamId: string; icon: string; text: string };

export const ActScene = memo(function ActScene({ sceneId, teams, recap, onDone }: { sceneId: SceneId; teams: Team[]; recap: Recap[]; onDone?: () => void }) {
  const scene = SCENES[sceneId];
  const [beat, setBeat] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const Body = useMemo(() => bodyFor(sceneId), [sceneId]);
  const isRecap = scene.beats[beat]?.includes('(story so far)');
  const text = (scene.beats[beat] ?? '').replace(' (story so far)', '');

  useEffect(() => { setBeat(0); }, [sceneId]);
  useEffect(() => {
    if (beat >= scene.beats.length) { doneRef.current?.(); return; }
    voice.say(text);
    const ms = isRecap ? Math.max(6500, 2600 + teams.length * 1400) : beatMs(text);
    const t = setTimeout(() => setBeat(b => b + 1), ms);
    return () => clearTimeout(t);
  }, [beat, scene.beats.length, text, isRecap, teams.length]);

  const shown = Math.min(beat, scene.beats.length - 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {/* isolated so art z-indexes can never paint over Bolt or the header */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate' }}>
        {Body ? <Suspense fallback={null}><Body beat={shown} beats={scene.beats} teams={teams} recap={recap} /></Suspense> : <Fallback title={scene.title} />}
      </div>
      {/* Recap overlay: "story so far", one card per team */}
      <AnimatePresence>
        {isRecap && (
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
          <div className="ui-bob"><BoltM pose={beat === 0 ? 'wave' : 'talk'} size={180} talking /></div>
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div key={shown} initial={{ scale: 0.7, opacity: 0, y: -10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }} style={{ maxWidth: 1500, transformOrigin: 'left center' }}>
            <SpeechBubble text={isRecap ? 'Here’s what happened last time…' : text} side="left" typing size="lg" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

export const QuestionIntro = memo(function QuestionIntro({ anim, text, onDone }: { anim: string; text: string; onDone?: () => void }) {
  const Body = useMemo(() => introFor(anim), [anim]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    voice.say(text);
    const t = setTimeout(() => doneRef.current?.(), beatMs(text));
    return () => clearTimeout(t);
  }, [text]);
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
