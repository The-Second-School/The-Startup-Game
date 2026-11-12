// Runs the narration for the current game state: speaks each line in turn (or just times it when the voice is off)
// and publishes progress to the dock. Scenes and question intros narrate themselves, narrationFor() returns null for them.
import { useEffect, useRef, useState } from 'react';
import { voice, readMs } from '../audio/voice';
import type { GameState } from '../game/types';
import { narrationFor } from './index';
import { useNarr } from './store';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export function useNarrator(state: GameState) {
  const n = narrationFor(state);
  const id = n?.id ?? null;
  const latest = useRef(n);
  latest.current = n;
  const voiceOn = state.settings.voice;
  const [unlocks, setUnlocks] = useState(0);
  useEffect(() => voice.onUnlock(() => setUnlocks(u => u + 1)), []);

  useEffect(() => {
    const cur = latest.current;
    const set = useNarr.getState().set;
    if (!cur) { set({ id: null, line: null, index: 0, total: 0, done: true, summary: undefined }); return; }
    let dead = false;
    set({ id: cur.id, line: cur.lines[0] ?? null, index: 0, total: cur.lines.length, done: false, summary: cur.summary, showText: cur.showText !== false, mascot: cur.mascot ?? 'bolt' });
    (async () => {
      // On a fresh page load the voice may still be starting: wait a moment so the first line is not spoken silently.
      if (voiceOn && voice.status() === 'loading') await Promise.race([voice.ready(), sleep(5000)]);
      for (let i = 0; i < cur.lines.length; i++) {
        if (dead) return;
        const line = cur.lines[i];
        set({ line, index: i });
        if (voiceOn) {
          const t0 = performance.now();
          await voice.say(line.text, { tone: line.tone, speech: line.say });
          // speech failed or was blocked: still leave the line up long enough to read
          if (!dead && performance.now() - t0 < 500) await sleep(readMs(line.text));
        } else await sleep(readMs(line.text));
        if (dead) return;
        await sleep(line.gap ?? 450);
      }
      if (!dead) set({ done: true });
    })();
    return () => { dead = true; voice.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, voiceOn, unlocks]);
}
