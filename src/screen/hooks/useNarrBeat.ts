import { useNarr } from '../../narration/store';
import { useAfter } from './useTimeline';

/**
 * Which narration line is being spoken for the narration `id` (0 = first line). Views use it to reveal things in step with
 * the voice. Returns -1 until the narrator has started this id, and 99 once all lines are spoken (or when the narrator
 * never picked this id up within 2.5 s, so a screen can never get stuck half-revealed).
 */
export function useNarrBeat(id: string): number {
  const cur = useNarr(s => s.id);
  const index = useNarr(s => s.index);
  const done = useNarr(s => s.done);
  const stalled = useAfter(id, 2500);
  if (cur === id) return done ? 99 : index;
  return stalled ? 99 : -1;
}
