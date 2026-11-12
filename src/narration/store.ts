import { create } from 'zustand';
import type { NarrLine, Mascot } from './types';

interface NarrStore {
  id: string | null;
  line: NarrLine | null;
  index: number;
  total: number;
  /** all lines spoken */
  done: boolean;
  summary: string | undefined;
  showText: boolean;
  mascot: Mascot;
  set: (p: Partial<NarrStore>) => void;
}

export const useNarr = create<NarrStore>(set => ({
  id: null, line: null, index: 0, total: 0, done: true, summary: undefined, showText: true, mascot: 'bolt',
  set: p => set(p),
}));
