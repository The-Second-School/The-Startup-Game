// Host "Pause": speech, sound and running animations stop where they are and continue on resume.
// Nothing global is patched (no fake clocks): only speech, the audio context and animations that are playing right now.
import { useEffect } from 'react';
import { sfx } from '../../audio';

export function usePause(paused: boolean) {
  useEffect(() => {
    if (!paused) return;
    try { window.speechSynthesis?.pause(); } catch { /* ignore */ }
    sfx.suspend(true);
    const held = new Set<Animation>();
    const hold = () => {
      for (const a of document.getAnimations()) if (a.playState === 'running') { a.pause(); held.add(a); }
    };
    hold();
    const id = window.setInterval(hold, 200);     // animations that start while paused are held too
    document.documentElement.classList.add('is-paused');
    return () => {
      window.clearInterval(id);
      document.documentElement.classList.remove('is-paused');
      for (const a of held) { try { a.play(); } catch { /* finished or removed */ } }
      try { window.speechSynthesis?.resume(); } catch { /* ignore */ }
      sfx.suspend(false);
    };
  }, [paused]);
}
